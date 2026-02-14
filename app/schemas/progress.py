"""
進捗取得用の Pydantic スキーマ。
"""
from typing import List, Optional

from pydantic import BaseModel


class AssignmentProgressItem(BaseModel):
    """担当者別進捗（名前入力で取得する用）"""

    category: str
    index_start: int
    index_end: int
    total: int
    completed: int
    next_index: Optional[int] = None


class ProgressResponse(BaseModel):
    """担当者名に対する進捗レスポンス"""

    username: str
    assignments: List[AssignmentProgressItem]
