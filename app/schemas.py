from pydantic import BaseModel
from typing import Optional, Any
from uuid import UUID


# DBからデータを返すときの形式
class ItemResponse(BaseModel):
    anon_item_id: UUID
    item_key: Optional[str] = None
    item_name: str
    composition_data: Optional[Any] = None  # JSONの中身
    verification_result: Optional[str] = None
    # プロダクトテーブル由来の情報
    product_name: Optional[str] = None
    product_description: Optional[str] = None

    class Config:
        from_attributes = True


# ユーザーが更新するときに送ってくるデータの形式
class VerificationUpdate(BaseModel):
    result: str  # 例: "Approved", "Rejected"など
