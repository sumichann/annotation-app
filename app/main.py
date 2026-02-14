from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from . import schemas, database
from .services import items as items_service, progress as progress_service, images as images_service

load_dotenv()

app = FastAPI(title="Annotation API")

# CORS設定 (フロントエンドからのアクセスを許可)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番ではフロントエンドのURLを指定してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello from Azure Container Apps!"}


@app.get("/items/by-index")
def get_item_by_index(
    category: Optional[str] = Query(
        default=None, description="Category name (e.g. ladies_jacket)"
    ),
    index: int = Query(..., ge=1, description="ジャンル内の通し番号（1始まり）"),
    db: Session = Depends(database.get_db),
):
    """指定したジャンル・index に対応する anon_item_id を返す。次のページは index + 1 で取得可能。"""
    return items_service.get_item_by_index(db, category, index)


@app.get("/progress", response_model=schemas.ProgressResponse)
def get_progress(
    username: str = Query(..., description="担当者名（assigned_username と一致）"),
    db: Session = Depends(database.get_db),
):
    """担当者名を指定し、その人の割り当て一覧と進捗を返す。"""
    return progress_service.get_progress(db, username)


@app.get("/items/{item_id}", response_model=List[schemas.ItemResponse])
def get_item(
    item_id: UUID,
    category: Optional[str] = Query(
        default=None, description="Category name (e.g. ladies_jacket)"
    ),
    db: Session = Depends(database.get_db),
):
    """アイテム情報を取得する。"""
    return items_service.get_item(db, item_id, category)


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
    """検証結果を書き込む（更新）。"""
    return items_service.update_verification(
        db, item_id, update_data, category, item_key
    )


@app.get("/images/{item_id}")
def get_images(
    item_id: UUID,
    category: Optional[str] = Query(default=None),
):
    """UUIDに対応したすべての写真をBlob Storageから取得する。"""
    return images_service.get_images(item_id, category)
