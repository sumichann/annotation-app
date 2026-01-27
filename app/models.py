from sqlalchemy import VARCHAR, Column, PrimaryKeyConstraint, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .database import Base


class BaseItem(Base):
    """
    各カテゴリに共通するアイテムカラム定義。
    物理テーブルはサブクラス側で __tablename__ のみを変えて定義します。
    """

    __abstract__ = True  # このクラス自体はテーブルとしては作成しない

    # anon_item_id と item_key の組み合わせで一意になる
    anon_item_id = Column(UUID(as_uuid=True), index=True)
    item_key = Column(VARCHAR(255))

    item_name = Column(VARCHAR(255))

    # JSONデータ用カラム
    composition_data = Column(JSONB)

    # ここにユーザーのOK/NG結果などが入る
    verification_result = Column(VARCHAR(255), nullable=True)


class LadiesJacketItem(BaseItem):
    __tablename__ = "ladies_jacket_composition_items_import"
    __table_args__ = (PrimaryKeyConstraint("anon_item_id", "item_key"), {})


class LadiesPantsItem(BaseItem):
    __tablename__ = "ladies_pants_composition_items_import"
    __table_args__ = (PrimaryKeyConstraint("anon_item_id", "item_key"), {})


class LadiesSuitItem(BaseItem):
    __tablename__ = "ladies_suit_composition_items_import"
    __table_args__ = (PrimaryKeyConstraint("anon_item_id", "item_key"), {})


class LadiesTopsItem(BaseItem):
    __tablename__ = "ladies_tops_composition_items_import"
    __table_args__ = (PrimaryKeyConstraint("anon_item_id", "item_key"), {})


class MensJacketItem(BaseItem):
    __tablename__ = "mens_jacket_composition_items_import"
    __table_args__ = (PrimaryKeyConstraint("anon_item_id", "item_key"), {})


class MensPantsItem(BaseItem):
    __tablename__ = "mens_pants_composition_items_import"
    __table_args__ = (PrimaryKeyConstraint("anon_item_id", "item_key"), {})


class MensSuitItem(BaseItem):
    __tablename__ = "mens_suit_composition_items_import"
    __table_args__ = (PrimaryKeyConstraint("anon_item_id", "item_key"), {})


class MensTopsItem(BaseItem):
    __tablename__ = "mens_tops_composition_items_import"
    __table_args__ = (PrimaryKeyConstraint("anon_item_id", "item_key"), {})


class BaseProduct(Base):
    """
    プロダクト情報用の共通カラム定義。
    CSV（*_composition_products_import.csv）のカラムに対応。
    """

    __abstract__ = True

    # anon_item_id を主キーとして扱う（既存DB側の定義に追随）
    anon_item_id = Column(UUID(as_uuid=True), primary_key=True, index=True)

    status = Column(Text)  # text
    name = Column(Text)  # text
    description = Column(Text)  # text
    price = Column(Integer)
    category_id = Column(Integer)
    item_condition = Column(Integer)  # int4
    size = Column(Float)  # float8
    brand_name = Column(Text)  # text
    shipping_payer = Column(Integer)
    shipping_method = Column(Integer)
    shipping_from_area = Column(Integer)
    shipping_duration = Column(Integer)
    num_likes = Column(Integer)
    num_comments = Column(Integer)
    updated = Column(Text)  # text
    created = Column(Text)  # text


class LadiesJacketProduct(BaseProduct):
    """
    ladies_jacket_composition_products_import テーブルに対応するモデル。
    """

    __tablename__ = "ladies_jacket_composition_products_import"


class LadiesPantsProduct(BaseProduct):
    """
    ladies_pants_composition_products_import テーブルに対応するモデル。
    """

    __tablename__ = "ladies_pants_composition_products_import"


class LadiesSuitProduct(BaseProduct):
    """
    ladies_suit_composition_products_import テーブルに対応するモデル。
    """

    __tablename__ = "ladies_suit_composition_products_import"


class LadiesTopsProduct(BaseProduct):
    """
    ladies_tops_composition_products_import テーブルに対応するモデル。
    """

    __tablename__ = "ladies_tops_composition_products_import"


class MensJacketProduct(BaseProduct):
    """
    mens_jacket_composition_products_import テーブルに対応するモデル。
    """

    __tablename__ = "mens_jacket_composition_products_import"


class MensPantsProduct(BaseProduct):
    """
    mens_pants_composition_products_import テーブルに対応するモデル。
    """

    __tablename__ = "mens_pants_composition_products_import"


class MensSuitProduct(BaseProduct):
    """
    mens_suit_composition_products_import テーブルに対応するモデル。
    """

    __tablename__ = "mens_suit_composition_products_import"


class MensTopsProduct(BaseProduct):
    """
    mens_tops_composition_products_import テーブルに対応するモデル。
    """

    __tablename__ = "mens_tops_composition_products_import"
