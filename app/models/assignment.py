"""
割り当て（進捗管理）用モデル。
"""
from sqlalchemy import VARCHAR, Column, Integer, Text, DateTime, text

from ..database import Base


class Assignment(Base):
    """
    割り当て（進捗管理）用テーブル。
    カテゴリ × index 範囲 × 担当者名 を1レコードで管理。
    """

    __tablename__ = "assignment"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(VARCHAR(64), nullable=False, index=True)
    index_start = Column(Integer, nullable=False)
    index_end = Column(Integer, nullable=False)
    assigned_username = Column(Text, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=True, server_default=text("now()"))
