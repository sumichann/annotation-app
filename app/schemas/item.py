"""
アイテム取得・更新用の Pydantic スキーマ。
"""
from typing import Optional, Any
from uuid import UUID

from pydantic import BaseModel


class ItemResponse(BaseModel):
    """DBからデータを返すときの形式"""

    anon_item_id: UUID
    item_key: Optional[str] = None
    item_name: str
    composition_data: Optional[Any] = None
    verification_result: Optional[str] = None
    product_name: Optional[str] = None
    product_description: Optional[str] = None
    index: Optional[int] = None

    class Config:
        from_attributes = True


class VerificationUpdate(BaseModel):
    """ユーザーが更新するときに送ってくるデータの形式"""

    result: str  # 例: "Approved", "Rejected"など
