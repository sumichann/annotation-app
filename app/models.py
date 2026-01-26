from sqlalchemy import VARCHAR, Column, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .database import Base


class LadiesItem(Base):
    __tablename__ = "ladies_jacket_composition_items_import"
    __table_args__ = (
        PrimaryKeyConstraint("anon_item_id", "item_key"),
        {},
    )

    # anon_item_idとitem_keyの組み合わせで一意になる
    anon_item_id = Column(UUID(as_uuid=True), index=True)
    item_key = Column(VARCHAR(255))

    item_name = Column(VARCHAR(255))

    # JSONデータ用カラム
    composition_data = Column(JSONB)

    # ここにユーザーのOK/NG結果などが入る
    verification_result = Column(VARCHAR(255), nullable=True)
