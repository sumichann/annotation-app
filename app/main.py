from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas, database

app = FastAPI(title="Annotation API")

# CORS設定 (フロントエンドからのアクセスを許可)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番ではフロントエンドのURLを指定してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ルート確認用
@app.get("/")
def read_root():
    return {"message": "Hello from Azure Container Apps!"}


# 1. アイテム情報の取得
@app.get("/items/{item_id}", response_model=List[schemas.ItemResponse])
def get_item(item_id: UUID, db: Session = Depends(database.get_db)):
    items = (
        db.query(models.LadiesItem)
        .filter(models.LadiesItem.anon_item_id == item_id)
        .all()
    )
    if not items:
        raise HTTPException(status_code=404, detail="Item not found")
    return items


# 2. 検証結果の書き込み (更新)
@app.post("/items/{item_id}")
def update_verification(
    item_id: UUID,
    update_data: schemas.VerificationUpdate,
    item_key: Optional[str] = Query(
        None, description="Item key to identify the specific item"
    ),
    db: Session = Depends(database.get_db),
):
    # item_keyが指定されている場合は、anon_item_idとitem_keyの両方で検索
    if item_key:
        item = (
            db.query(models.LadiesItem)
            .filter(
                models.LadiesItem.anon_item_id == item_id,
                models.LadiesItem.item_key == item_key,
            )
            .first()
        )
    else:
        # item_keyが指定されていない場合は、最初の1件を取得
        item = (
            db.query(models.LadiesItem)
            .filter(models.LadiesItem.anon_item_id == item_id)
            .first()
        )

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    try:
        # データの更新
        item.verification_result = update_data.result
        db.flush()  # 変更をデータベースに送信（まだコミットしない）
        db.commit()  # トランザクションをコミット
    except Exception as e:
        db.rollback()  # エラーが発生した場合はロールバック
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # コミット後、オブジェクトはexpired状態になるが、属性アクセスで自動再読み込みされる
    # refreshは不要（むしろ問題を引き起こす可能性がある）

    return {
        "status": "success",
        "uuid": item_id,
        "item_key": item.item_key,
        "new_result": item.verification_result,
    }
