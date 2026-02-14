-- 割り当て（進捗管理）用テーブル
-- カテゴリ × index 範囲 × 担当者名 を1レコードで管理
-- 実行前にバックアップを取ることを推奨します

CREATE TABLE IF NOT EXISTS assignment (
    id SERIAL PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    index_start INTEGER NOT NULL,
    index_end INTEGER NOT NULL,
    assigned_username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignment_category ON assignment(category);
CREATE INDEX IF NOT EXISTS idx_assignment_username ON assignment(assigned_username);

COMMENT ON TABLE assignment IS 'カテゴリ別・index範囲別の担当者割り当て（進捗管理用）';
COMMENT ON COLUMN assignment.category IS 'カテゴリ（例: ladies_jacket）';
COMMENT ON COLUMN assignment.index_start IS '担当範囲の開始 index（以上）';
COMMENT ON COLUMN assignment.index_end IS '担当範囲の終了 index（以下）';
COMMENT ON COLUMN assignment.assigned_username IS '担当者名';
