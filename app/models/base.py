"""
アイテム・プロダクトの抽象基底クラス。
"""
from sqlalchemy import VARCHAR, Column, Integer, Float, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB

from ..database import Base


class BaseItem(Base):
    """
    各カテゴリに共通するアイテムカラム定義。
    物理テーブルはサブクラス側で __tablename__ のみを変えて定義します。
    """

    __abstract__ = True

    anon_item_id = Column(UUID(as_uuid=True), index=True)
    item_key = Column(VARCHAR(255))
    item_name = Column(VARCHAR(255))
    composition_data = Column(JSONB)
    verification_result = Column(VARCHAR(255), nullable=True)
    index_of_products = Column(Integer, nullable=True, index=True)


class BaseProduct(Base):
    """
    プロダクト情報用の共通カラム定義。
    """

    __abstract__ = True

    anon_item_id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    index = Column(Integer, nullable=True, index=True)
    status = Column(Text)
    name = Column(Text)
    description = Column(Text)
    price = Column(Integer)
    category_id = Column(Integer)
    item_condition = Column(Integer)
    size = Column(Float)
    brand_name = Column(Text)
    shipping_payer = Column(Integer)
    shipping_method = Column(Integer)
    shipping_from_area = Column(Integer)
    shipping_duration = Column(Integer)
    num_likes = Column(Integer)
    num_comments = Column(Integer)
    updated = Column(Text)
    created = Column(Text)
    locked_by_user_id = Column(Integer, nullable=True, index=True)
    locked_at = Column(DateTime(timezone=True), nullable=True)
