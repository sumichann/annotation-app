-- ladies_suit_composition_products_import を、
-- ladies_suit_composition_items_import に存在する anon_item_id のみ残す
-- 実行前にバックアップを取ることを強く推奨します

DELETE FROM ladies_suit_composition_products_import
WHERE anon_item_id NOT IN (
  SELECT anon_item_id
  FROM ladies_suit_composition_items_import
);
