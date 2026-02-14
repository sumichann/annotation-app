"""
カテゴリ文字列と SQLAlchemy モデルの対応。他サービスから利用する。
"""
from typing import Optional

from fastapi import HTTPException

from .. import models

CATEGORY_TO_ITEM_MODEL = {
    "ladies_jacket": models.LadiesJacketItem,
    "ladies_pants": models.LadiesPantsItem,
    "ladies_suit": models.LadiesSuitItem,
    "ladies_tops": models.LadiesTopsItem,
    "mens_jacket": models.MensJacketItem,
    "mens_pants": models.MensPantsItem,
    "mens_suit": models.MensSuitItem,
    "mens_tops": models.MensTopsItem,
}

CATEGORY_TO_PRODUCT_MODEL = {
    "ladies_jacket": models.LadiesJacketProduct,
    "ladies_pants": models.LadiesPantsProduct,
    "ladies_suit": models.LadiesSuitProduct,
    "ladies_tops": models.LadiesTopsProduct,
    "mens_jacket": models.MensJacketProduct,
    "mens_pants": models.MensPantsProduct,
    "mens_suit": models.MensSuitProduct,
    "mens_tops": models.MensTopsProduct,
}


def get_item_model_by_category(category: Optional[str]):
    """
    フロントエンドの category 値に対応する SQLAlchemy モデルを返す。
    未指定の場合は ladies_jacket をデフォルトとする。
    """
    if category is None:
        return models.LadiesJacketItem

    model = CATEGORY_TO_ITEM_MODEL.get(category)
    if model is None:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    return model


def get_product_model_by_category(category: Optional[str]):
    """
    フロントエンドの category 値に対応するプロダクトモデルを返す。
    未指定の場合は ladies_jacket をデフォルトとする。
    """
    if category is None:
        return models.LadiesJacketProduct

    model = CATEGORY_TO_PRODUCT_MODEL.get(category)
    if model is None:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    return model
