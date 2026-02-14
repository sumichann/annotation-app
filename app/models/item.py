"""
カテゴリ別アイテムテーブルモデル。
"""
from sqlalchemy import PrimaryKeyConstraint

from .base import BaseItem


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
