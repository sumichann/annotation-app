"""
カテゴリ別プロダクトテーブルモデル。
"""
from .base import BaseProduct


class LadiesJacketProduct(BaseProduct):
    __tablename__ = "ladies_jacket_composition_products_import"


class LadiesPantsProduct(BaseProduct):
    __tablename__ = "ladies_pants_composition_products_import"


class LadiesSuitProduct(BaseProduct):
    __tablename__ = "ladies_suit_composition_products_import"


class LadiesTopsProduct(BaseProduct):
    __tablename__ = "ladies_tops_composition_products_import"


class MensJacketProduct(BaseProduct):
    __tablename__ = "mens_jacket_composition_products_import"


class MensPantsProduct(BaseProduct):
    __tablename__ = "mens_pants_composition_products_import"


class MensSuitProduct(BaseProduct):
    __tablename__ = "mens_suit_composition_products_import"


class MensTopsProduct(BaseProduct):
    __tablename__ = "mens_tops_composition_products_import"
