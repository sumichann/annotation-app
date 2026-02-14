"""
アイテム取得・検証結果更新のビジネスロジック。
"""
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from .category import get_item_model_by_category, get_product_model_by_category


def get_item_by_index(
    db: Session,
    category: Optional[str],
    index: int,
) -> dict:
    """指定したジャンル・index に対応する anon_item_id を返す。"""
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


def get_item(
    db: Session,
    item_id: UUID,
    category: Optional[str],
) -> List[schemas.ItemResponse]:
    """item_id と category でアイテム一覧を取得する。"""
    item_model = get_item_model_by_category(category)
    product_model = get_product_model_by_category(category)

    items = db.query(item_model).filter(item_model.anon_item_id == item_id).all()
    if not items:
        raise HTTPException(status_code=404, detail="Item not found")

    product = (
        db.query(product_model).filter(product_model.anon_item_id == item_id).first()
    )

    product_index = getattr(product, "index", None) if product else None
    response_items: list[schemas.ItemResponse] = []
    for item in items:
        index_val = getattr(item, "index_of_products", None)
        if index_val is None:
            index_val = product_index
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
                index=index_val,
            )
        )

    return response_items


def update_verification(
    db: Session,
    item_id: UUID,
    update_data: schemas.VerificationUpdate,
    category: Optional[str],
    item_key: Optional[str] = None,
) -> dict:
    """検証結果を1件更新する。"""
    model = get_item_model_by_category(category)
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
        item = db.query(model).filter(model.anon_item_id == item_id).first()

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    try:
        item.verification_result = update_data.result
        db.flush()
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {
        "status": "success",
        "uuid": item_id,
        "item_key": item.item_key,
        "new_result": item.verification_result,
    }
