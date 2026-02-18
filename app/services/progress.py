"""
進捗取得のビジネスロジック。
"""
from typing import Optional

from sqlalchemy import and_, case, func
from sqlalchemy.orm import Session

from .. import models, schemas
from .category import get_item_model_by_category, get_product_model_by_category


def _get_products_and_completed_ids(db: Session, assignment: models.Assignment):
    """assignment の範囲内の (products_in_range, completed_ids) を返す。"""
    category = assignment.category
    index_start = assignment.index_start
    index_end = assignment.index_end
    product_model = get_product_model_by_category(category)
    item_model = get_item_model_by_category(category)

    products_in_range = (
        db.query(product_model.index, product_model.anon_item_id)
        .filter(
            product_model.index >= index_start,
            product_model.index <= index_end,
        )
        .order_by(product_model.index)
        .all()
    )
    if not products_in_range:
        return [], set()

    anon_item_ids = [p.anon_item_id for p in products_in_range]
    verified_expr = case(
        (
            and_(
                item_model.verification_result.isnot(None),
                func.trim(item_model.verification_result) != "",
            ),
            1,
        )
    )
    item_counts = (
        db.query(
            item_model.anon_item_id,
            func.count().label("total"),
            func.count(verified_expr).label("verified"),
        )
        .filter(item_model.anon_item_id.in_(anon_item_ids))
        .group_by(item_model.anon_item_id)
        .all()
    )
    completed_ids = {
        row.anon_item_id
        for row in item_counts
        if row.total > 0 and row.total == row.verified
    }
    return products_in_range, completed_ids


def _progress_for_assignment(
    db: Session, assignment: models.Assignment
) -> schemas.AssignmentProgressItem:
    """1件の assignment について、範囲内の total / completed / next_index を計算する。"""
    category = assignment.category
    index_start = assignment.index_start
    index_end = assignment.index_end
    products_in_range, completed_ids = _get_products_and_completed_ids(db, assignment)
    total = len(products_in_range)
    if total == 0:
        return schemas.AssignmentProgressItem(
            category=category,
            index_start=index_start,
            index_end=index_end,
            total=0,
            completed=0,
            next_index=None,
        )

    completed = 0
    next_index: Optional[int] = None
    for prod in products_in_range:
        if prod.anon_item_id in completed_ids:
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


def get_next_incomplete_index_after(
    db: Session, username: str, category: str, after_index: int
) -> Optional[int]:
    """
    指定担当者・カテゴリで、after_index より大きい「未完了」の最小 index を返す。
    今の作業画面を除いて「次にやるべき」index を返すために使う。
    """
    assignments = (
        db.query(models.Assignment)
        .filter(
            models.Assignment.assigned_username == username,
            models.Assignment.category == category,
        )
        .order_by(models.Assignment.index_start)
        .all()
    )
    if not assignments:
        return None

    candidate: Optional[int] = None
    for a in assignments:
        products_in_range, completed_ids = _get_products_and_completed_ids(db, a)
        for prod in products_in_range:
            if prod.index <= after_index:
                continue
            if prod.anon_item_id not in completed_ids:
                if candidate is None or prod.index < candidate:
                    candidate = prod.index
    return candidate


def get_prev_index_in_assignments(
    db: Session, username: str, category: str, before_index: int
) -> Optional[int]:
    """
    指定担当者・カテゴリで、before_index より小さい範囲にある「担当範囲内の最大 index」を返す。
    完了・未完了は問わず、割り当て範囲だけに限定して「前へ」を動かすために使う。
    """
    assignments = (
        db.query(models.Assignment)
        .filter(
            models.Assignment.assigned_username == username,
            models.Assignment.category == category,
        )
        .order_by(models.Assignment.index_start)
        .all()
    )
    if not assignments:
        return None

    candidate: Optional[int] = None
    for a in assignments:
        # この assignment の範囲内で before_index 未満の最大 index
        if a.index_start >= before_index:
            continue
        local_max = min(before_index - 1, a.index_end)
        if candidate is None or local_max > candidate:
            candidate = local_max
    return candidate
