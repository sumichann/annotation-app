-- ladies_suit / mens_suit の index 列を 1 始まりの連番に振り直す
-- trim（items に存在する anon_item_id のみ残す）実行後に実行する想定
-- anon_item_id の昇順で 1, 2, 3, ... を付与

-- Ladies Suit
UPDATE ladies_suit_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM ladies_suit_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;

-- Mens Suit
UPDATE mens_suit_composition_products_import t
SET index = sub.rn
FROM (
  SELECT anon_item_id, ROW_NUMBER() OVER (ORDER BY anon_item_id) AS rn
  FROM mens_suit_composition_products_import
) sub
WHERE t.anon_item_id = sub.anon_item_id;
