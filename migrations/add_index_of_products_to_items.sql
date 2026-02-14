-- 各カテゴリーのitems_importテーブルに index_of_products 列を追加し、
-- 同一 anon_item_id の products_import の index と同じ値を格納する。
-- 実行前にバックアップを取ることを推奨します。

-- Ladies Jacket
ALTER TABLE ladies_jacket_composition_items_import
ADD COLUMN IF NOT EXISTS index_of_products INTEGER;

CREATE INDEX IF NOT EXISTS idx_ladies_jacket_items_index_of_products
ON ladies_jacket_composition_items_import(index_of_products);

UPDATE ladies_jacket_composition_items_import i
SET index_of_products = p.index
FROM ladies_jacket_composition_products_import p
WHERE i.anon_item_id = p.anon_item_id;

-- Ladies Pants
ALTER TABLE ladies_pants_composition_items_import
ADD COLUMN IF NOT EXISTS index_of_products INTEGER;

CREATE INDEX IF NOT EXISTS idx_ladies_pants_items_index_of_products
ON ladies_pants_composition_items_import(index_of_products);

UPDATE ladies_pants_composition_items_import i
SET index_of_products = p.index
FROM ladies_pants_composition_products_import p
WHERE i.anon_item_id = p.anon_item_id;

-- Ladies Suit
ALTER TABLE ladies_suit_composition_items_import
ADD COLUMN IF NOT EXISTS index_of_products INTEGER;

CREATE INDEX IF NOT EXISTS idx_ladies_suit_items_index_of_products
ON ladies_suit_composition_items_import(index_of_products);

UPDATE ladies_suit_composition_items_import i
SET index_of_products = p.index
FROM ladies_suit_composition_products_import p
WHERE i.anon_item_id = p.anon_item_id;

-- Ladies Tops
ALTER TABLE ladies_tops_composition_items_import
ADD COLUMN IF NOT EXISTS index_of_products INTEGER;

CREATE INDEX IF NOT EXISTS idx_ladies_tops_items_index_of_products
ON ladies_tops_composition_items_import(index_of_products);

UPDATE ladies_tops_composition_items_import i
SET index_of_products = p.index
FROM ladies_tops_composition_products_import p
WHERE i.anon_item_id = p.anon_item_id;

-- Mens Jacket
ALTER TABLE mens_jacket_composition_items_import
ADD COLUMN IF NOT EXISTS index_of_products INTEGER;

CREATE INDEX IF NOT EXISTS idx_mens_jacket_items_index_of_products
ON mens_jacket_composition_items_import(index_of_products);

UPDATE mens_jacket_composition_items_import i
SET index_of_products = p.index
FROM mens_jacket_composition_products_import p
WHERE i.anon_item_id = p.anon_item_id;

-- Mens Pants
ALTER TABLE mens_pants_composition_items_import
ADD COLUMN IF NOT EXISTS index_of_products INTEGER;

CREATE INDEX IF NOT EXISTS idx_mens_pants_items_index_of_products
ON mens_pants_composition_items_import(index_of_products);

UPDATE mens_pants_composition_items_import i
SET index_of_products = p.index
FROM mens_pants_composition_products_import p
WHERE i.anon_item_id = p.anon_item_id;

-- Mens Suit
ALTER TABLE mens_suit_composition_items_import
ADD COLUMN IF NOT EXISTS index_of_products INTEGER;

CREATE INDEX IF NOT EXISTS idx_mens_suit_items_index_of_products
ON mens_suit_composition_items_import(index_of_products);

UPDATE mens_suit_composition_items_import i
SET index_of_products = p.index
FROM mens_suit_composition_products_import p
WHERE i.anon_item_id = p.anon_item_id;

-- Mens Tops
ALTER TABLE mens_tops_composition_items_import
ADD COLUMN IF NOT EXISTS index_of_products INTEGER;

CREATE INDEX IF NOT EXISTS idx_mens_tops_items_index_of_products
ON mens_tops_composition_items_import(index_of_products);

UPDATE mens_tops_composition_items_import i
SET index_of_products = p.index
FROM mens_tops_composition_products_import p
WHERE i.anon_item_id = p.anon_item_id;

-- コメント
COMMENT ON COLUMN ladies_jacket_composition_items_import.index_of_products IS '同一 anon_item_id の products の index（ジャンル内通し番号）';
COMMENT ON COLUMN ladies_pants_composition_items_import.index_of_products IS '同一 anon_item_id の products の index（ジャンル内通し番号）';
COMMENT ON COLUMN ladies_suit_composition_items_import.index_of_products IS '同一 anon_item_id の products の index（ジャンル内通し番号）';
COMMENT ON COLUMN ladies_tops_composition_items_import.index_of_products IS '同一 anon_item_id の products の index（ジャンル内通し番号）';
COMMENT ON COLUMN mens_jacket_composition_items_import.index_of_products IS '同一 anon_item_id の products の index（ジャンル内通し番号）';
COMMENT ON COLUMN mens_pants_composition_items_import.index_of_products IS '同一 anon_item_id の products の index（ジャンル内通し番号）';
COMMENT ON COLUMN mens_suit_composition_items_import.index_of_products IS '同一 anon_item_id の products の index（ジャンル内通し番号）';
COMMENT ON COLUMN mens_tops_composition_items_import.index_of_products IS '同一 anon_item_id の products の index（ジャンル内通し番号）';
