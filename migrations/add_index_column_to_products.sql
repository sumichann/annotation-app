-- 各カテゴリーのproducts_importテーブルにindex列を追加
-- anon_item_id に対応するジャンル内通し番号（1始まり）。次のページ = index + 1 で遷移可能
-- 実行前にバックアップを取ることを推奨します

-- Ladies Jacket
ALTER TABLE ladies_jacket_composition_products_import
ADD COLUMN IF NOT EXISTS index INTEGER;

CREATE INDEX IF NOT EXISTS idx_ladies_jacket_products_index
ON ladies_jacket_composition_products_import(index);

UPDATE ladies_jacket_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM ladies_jacket_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- Ladies Pants
ALTER TABLE ladies_pants_composition_products_import
ADD COLUMN IF NOT EXISTS index INTEGER;

CREATE INDEX IF NOT EXISTS idx_ladies_pants_products_index
ON ladies_pants_composition_products_import(index);

UPDATE ladies_pants_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM ladies_pants_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- Ladies Suit
ALTER TABLE ladies_suit_composition_products_import
ADD COLUMN IF NOT EXISTS index INTEGER;

CREATE INDEX IF NOT EXISTS idx_ladies_suit_products_index
ON ladies_suit_composition_products_import(index);

UPDATE ladies_suit_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM ladies_suit_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- Ladies Tops
ALTER TABLE ladies_tops_composition_products_import
ADD COLUMN IF NOT EXISTS index INTEGER;

CREATE INDEX IF NOT EXISTS idx_ladies_tops_products_index
ON ladies_tops_composition_products_import(index);

UPDATE ladies_tops_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM ladies_tops_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- Mens Jacket
ALTER TABLE mens_jacket_composition_products_import
ADD COLUMN IF NOT EXISTS index INTEGER;

CREATE INDEX IF NOT EXISTS idx_mens_jacket_products_index
ON mens_jacket_composition_products_import(index);

UPDATE mens_jacket_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM mens_jacket_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- Mens Pants
ALTER TABLE mens_pants_composition_products_import
ADD COLUMN IF NOT EXISTS index INTEGER;

CREATE INDEX IF NOT EXISTS idx_mens_pants_products_index
ON mens_pants_composition_products_import(index);

UPDATE mens_pants_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM mens_pants_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- Mens Suit
ALTER TABLE mens_suit_composition_products_import
ADD COLUMN IF NOT EXISTS index INTEGER;

CREATE INDEX IF NOT EXISTS idx_mens_suit_products_index
ON mens_suit_composition_products_import(index);

UPDATE mens_suit_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM mens_suit_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- Mens Tops
ALTER TABLE mens_tops_composition_products_import
ADD COLUMN IF NOT EXISTS index INTEGER;

CREATE INDEX IF NOT EXISTS idx_mens_tops_products_index
ON mens_tops_composition_products_import(index);

UPDATE mens_tops_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM mens_tops_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- コメント
COMMENT ON COLUMN ladies_jacket_composition_products_import.index IS 'ジャンル内通し番号（1始まり）。次のページ = index + 1';
COMMENT ON COLUMN ladies_pants_composition_products_import.index IS 'ジャンル内通し番号（1始まり）。次のページ = index + 1';
COMMENT ON COLUMN ladies_suit_composition_products_import.index IS 'ジャンル内通し番号（1始まり）。次のページ = index + 1';
COMMENT ON COLUMN ladies_tops_composition_products_import.index IS 'ジャンル内通し番号（1始まり）。次のページ = index + 1';
COMMENT ON COLUMN mens_jacket_composition_products_import.index IS 'ジャンル内通し番号（1始まり）。次のページ = index + 1';
COMMENT ON COLUMN mens_pants_composition_products_import.index IS 'ジャンル内通し番号（1始まり）。次のページ = index + 1';
COMMENT ON COLUMN mens_suit_composition_products_import.index IS 'ジャンル内通し番号（1始まり）。次のページ = index + 1';
COMMENT ON COLUMN mens_tops_composition_products_import.index IS 'ジャンル内通し番号（1始まり）。次のページ = index + 1';
