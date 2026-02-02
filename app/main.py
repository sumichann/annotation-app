import os
import base64
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

from . import models, schemas, database

load_dotenv()

app = FastAPI(title="Annotation API")


# カテゴリー文字列 → モデルクラスのマッピング（再利用のためモジュール定数に定義）
CATEGORY_TO_ITEM_MODEL = {
    "ladies_jacket": models.LadiesJacketItem,
    "ladies_pants": models.LadiesPantsItem,
    "ladies_suit": models.LadiesSuitItem,
    "ladies_tops": models.LadiesTopsItem,
    "mens_jacket": models.MensJacketItem,
    "mens_pants": models.MensPantsItem,
    "mens_suit": models.MensSuitItem,
    "mens_tops": models.MensTopsItem,
}

CATEGORY_TO_PRODUCT_MODEL = {
    "ladies_jacket": models.LadiesJacketProduct,
    "ladies_pants": models.LadiesPantsProduct,
    "ladies_suit": models.LadiesSuitProduct,
    "ladies_tops": models.LadiesTopsProduct,
    "mens_jacket": models.MensJacketProduct,
    "mens_pants": models.MensPantsProduct,
    "mens_suit": models.MensSuitProduct,
    "mens_tops": models.MensTopsProduct,
}


def get_item_model_by_category(category: Optional[str]):
    """
    フロントエンドの category 値に対応する SQLAlchemy モデルを返す。
    未指定の場合は ladies_jacket をデフォルトとする。
    """
    if category is None:
        # デフォルトカテゴリ（後方互換用）
        return models.LadiesJacketItem

    model = CATEGORY_TO_ITEM_MODEL.get(category)
    if model is None:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    return model


def get_product_model_by_category(category: Optional[str]):
    """
    フロントエンドの category 値に対応するプロダクトモデルを返す。
    未指定の場合は ladies_jacket をデフォルトとする。
    """
    if category is None:
        return models.LadiesJacketProduct

    model = CATEGORY_TO_PRODUCT_MODEL.get(category)
    if model is None:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    return model

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


# index でアイテムの anon_item_id を取得（次のページ = index + 1 で遷移する用）
@app.get("/items/by-index")
def get_item_by_index(
    category: Optional[str] = Query(
        default=None, description="Category name (e.g. ladies_jacket)"
    ),
    index: int = Query(..., ge=1, description="ジャンル内の通し番号（1始まり）"),
    db: Session = Depends(database.get_db),
):
    """指定したジャンル・index に対応する anon_item_id を返す。次のページは index + 1 で取得可能。"""
    if not category:
        raise HTTPException(status_code=400, detail="Category parameter is required")
    product_model = get_product_model_by_category(category)
    product = (
        db.query(product_model)
        .filter(product_model.index == index)
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"No item found for category={category} index={index}",
        )
    return {
        "anon_item_id": str(product.anon_item_id),
        "index": product.index,
        "category": category,
    }


# 1. アイテム情報の取得
@app.get("/items/{item_id}", response_model=List[schemas.ItemResponse])
def get_item(
    item_id: UUID,
    category: Optional[str] = Query(
        default=None, description="Category name (e.g. ladies_jacket)"
    ),
    db: Session = Depends(database.get_db),
):
    item_model = get_item_model_by_category(category)
    product_model = get_product_model_by_category(category)

    items = db.query(item_model).filter(item_model.anon_item_id == item_id).all()
    if not items:
        raise HTTPException(status_code=404, detail="Item not found")

    # プロダクト情報を取得（1商品1レコード想定）
    product = (
        db.query(product_model).filter(product_model.anon_item_id == item_id).first()
    )

    product_index = getattr(product, "index", None) if product else None
    response_items: list[schemas.ItemResponse] = []
    for item in items:
        response_items.append(
            schemas.ItemResponse(
                anon_item_id=item.anon_item_id,
                item_key=item.item_key,
                item_name=item.item_name,
                composition_data=item.composition_data,
                verification_result=item.verification_result,
                product_name=getattr(product, "name", None) if product else None,
                product_description=getattr(product, "description", None)
                if product
                else None,
                index=product_index,
            )
        )

    return response_items


# 2. 検証結果の書き込み (更新)
@app.post("/items/{item_id}")
def update_verification(
    item_id: UUID,
    update_data: schemas.VerificationUpdate,
    item_key: Optional[str] = Query(
        None, description="Item key to identify the specific item"
    ),
    category: Optional[str] = Query(
        default=None, description="Category name (e.g. ladies_jacket)"
    ),
    db: Session = Depends(database.get_db),
):
    model = get_item_model_by_category(category)
    # item_keyが指定されている場合は、anon_item_idとitem_keyの両方で検索
    if item_key:
        item = (
            db.query(model)
            .filter(
                model.anon_item_id == item_id,
                model.item_key == item_key,
            )
            .first()
        )
    else:
        # item_keyが指定されていない場合は、最初の1件を取得
        item = db.query(model).filter(model.anon_item_id == item_id).first()

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


# 3. UUIDに対応した写真を全て取得
@app.get("/images/{item_id}")
def get_images(item_id: UUID, category: Optional[str] = Query(default=None)):
    """
    UUIDに対応したすべての写真をBlob Storageから取得します。
    画像ファイル名は以下いずれかの形式です。

    - 旧形式: {uuid}_{index}.jpg
    - 新形式: {category}/{uuid}_{index}.jpg

    categoryクエリパラメータが指定されている場合は、新形式に基づいて
    {category}/{uuid}_ で始まる画像のみを取得します。
    """
    # Blob Storageの設定を環境変数から取得
    blob_connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "itemclothes")

    if not blob_connection_string:
        raise HTTPException(
            status_code=500, detail="Azure Storage connection string is not configured"
        )

    try:
        # Blob Service Clientを作成
        blob_service_client = BlobServiceClient.from_connection_string(
            blob_connection_string
        )
        container_client = blob_service_client.get_container_client(container_name)

        # UUIDで始まるすべてのblobを検索
        # category が指定されている場合は {category}/{uuid}_ プレフィックスを使用
        if category:
            prefix = f"{category}/{item_id}_"
        else:
            prefix = f"{item_id}_"
        blobs = container_client.list_blobs(name_starts_with=prefix)

        images = []
        for blob in blobs:
            # .jpgで終わるファイルのみを対象とする
            if blob.name.endswith(".jpg"):
                # Blobを取得
                blob_client = container_client.get_blob_client(blob.name)
                blob_data = blob_client.download_blob()
                image_bytes = blob_data.readall()

                # base64エンコード
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")

                images.append(
                    {
                        "filename": blob.name,
                        "data": image_base64,
                        "size": len(image_bytes),
                    }
                )

        if not images:
            raise HTTPException(
                status_code=404,
                detail=f"No images found for UUID: {item_id}",
            )

        # JSON形式で返す
        return JSONResponse(
            content={
                "uuid": str(item_id),
                "count": len(images),
                "images": images,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving images: {str(e)}"
        )
