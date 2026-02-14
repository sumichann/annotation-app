"""
進捗取得のビジネスロジック。
"""
from typing import Optional

from sqlalchemy.orm import Session

from .. import models, schemas
from .category import get_item_model_by_category, get_product_model_by_category


def _progress_for_assignment(
    db: Session, assignment: models.Assignment
) -> schemas.AssignmentProgressItem:
    """1件の assignment について、範囲内の total / completed / next_index を計算する。"""
    category = assignment.category
    index_start = assignment.index_start
    index_end = assignment.index_end
    product_model = get_product_model_by_category(category)
    item_model = get_item_model_by_category(category)

    products_in_range = (
        db.query(product_model)
        .filter(
            product_model.index >= index_start,
            product_model.index <= index_end,
        )
        .order_by(product_model.index)
        .all()
    )
    total = len(products_in_range)

    completed = 0
    next_index: Optional[int] = None
    for prod in products_in_range:
        items = db.query(item_model).filter(item_model.anon_item_id == prod.anon_item_id).all()
        verified_count = sum(
            1
            for it in items
            if it.verification_result is not None
            and it.verification_result.strip() != ""
        )
        is_done = len(items) > 0 and verified_count == len(items)
        if is_done:
            completed += 1
        elif next_index is None:
            next_index = prod.index
    return schemas.AssignmentProgressItem(
        category=category,
        index_start=index_start,
        index_end=index_end,
        total=total,
        completed=completed,
        next_index=next_index,
    )


def get_progress(db: Session, username: str) -> schemas.ProgressResponse:
    """担当者名で割り当て一覧と進捗を取得する。"""
    assignments = (
        db.query(models.Assignment)
        .filter(models.Assignment.assigned_username == username)
        .order_by(models.Assignment.category, models.Assignment.index_start)
        .all()
    )
    items = [_progress_for_assignment(db, a) for a in assignments]
    return schemas.ProgressResponse(username=username, assignments=items)
