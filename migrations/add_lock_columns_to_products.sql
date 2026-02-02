-- 各カテゴリーのproducts_importテーブルにlocked_by_user_idとlocked_atカラムを追加
-- 実行前にバックアップを取ることを推奨します

-- Ladies Jacket
ALTER TABLE ladies_jacket_composition_products_import
ADD COLUMN IF NOT EXISTS locked_by_user_id INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_ladies_jacket_products_locked_by_user 
ON ladies_jacket_composition_products_import(locked_by_user_id);

-- Ladies Pants
ALTER TABLE ladies_pants_composition_products_import
ADD COLUMN IF NOT EXISTS locked_by_user_id INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_ladies_pants_products_locked_by_user 
ON ladies_pants_composition_products_import(locked_by_user_id);

-- Ladies Suit
ALTER TABLE ladies_suit_composition_products_import
ADD COLUMN IF NOT EXISTS locked_by_user_id INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_ladies_suit_products_locked_by_user 
ON ladies_suit_composition_products_import(locked_by_user_id);

-- Ladies Tops
ALTER TABLE ladies_tops_composition_products_import
ADD COLUMN IF NOT EXISTS locked_by_user_id INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_ladies_tops_products_locked_by_user 
ON ladies_tops_composition_products_import(locked_by_user_id);

-- Mens Jacket
ALTER TABLE mens_jacket_composition_products_import
ADD COLUMN IF NOT EXISTS locked_by_user_id INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_mens_jacket_products_locked_by_user 
ON mens_jacket_composition_products_import(locked_by_user_id);

-- Mens Pants
ALTER TABLE mens_pants_composition_products_import
ADD COLUMN IF NOT EXISTS locked_by_user_id INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_mens_pants_products_locked_by_user 
ON mens_pants_composition_products_import(locked_by_user_id);

-- Mens Suit
ALTER TABLE mens_suit_composition_products_import
ADD COLUMN IF NOT EXISTS locked_by_user_id INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_mens_suit_products_locked_by_user 
ON mens_suit_composition_products_import(locked_by_user_id);

-- Mens Tops
ALTER TABLE mens_tops_composition_products_import
ADD COLUMN IF NOT EXISTS locked_by_user_id INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_mens_tops_products_locked_by_user 
ON mens_tops_composition_products_import(locked_by_user_id);

-- コメント追加（オプション）
COMMENT ON COLUMN ladies_jacket_composition_products_import.locked_by_user_id IS 'ロック中のユーザーID（NULL = ロックされていない）';
COMMENT ON COLUMN ladies_jacket_composition_products_import.locked_at IS 'ロック開始日時';

COMMENT ON COLUMN ladies_pants_composition_products_import.locked_by_user_id IS 'ロック中のユーザーID（NULL = ロックされていない）';
COMMENT ON COLUMN ladies_pants_composition_products_import.locked_at IS 'ロック開始日時';

COMMENT ON COLUMN ladies_suit_composition_products_import.locked_by_user_id IS 'ロック中のユーザーID（NULL = ロックされていない）';
COMMENT ON COLUMN ladies_suit_composition_products_import.locked_at IS 'ロック開始日時';

COMMENT ON COLUMN ladies_tops_composition_products_import.locked_by_user_id IS 'ロック中のユーザーID（NULL = ロックされていない）';
COMMENT ON COLUMN ladies_tops_composition_products_import.locked_at IS 'ロック開始日時';

COMMENT ON COLUMN mens_jacket_composition_products_import.locked_by_user_id IS 'ロック中のユーザーID（NULL = ロックされていない）';
COMMENT ON COLUMN mens_jacket_composition_products_import.locked_at IS 'ロック開始日時';

COMMENT ON COLUMN mens_pants_composition_products_import.locked_by_user_id IS 'ロック中のユーザーID（NULL = ロックされていない）';
COMMENT ON COLUMN mens_pants_composition_products_import.locked_at IS 'ロック開始日時';

COMMENT ON COLUMN mens_suit_composition_products_import.locked_by_user_id IS 'ロック中のユーザーID（NULL = ロックされていない）';
COMMENT ON COLUMN mens_suit_composition_products_import.locked_at IS 'ロック開始日時';

COMMENT ON COLUMN mens_tops_composition_products_import.locked_by_user_id IS 'ロック中のユーザーID（NULL = ロックされていない）';
COMMENT ON COLUMN mens_tops_composition_products_import.locked_at IS 'ロック開始日時';
