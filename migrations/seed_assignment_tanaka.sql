-- テスト用: assignment に tanaka のデータを投入
-- テーブル作成（create_assignment_table.sql）の後に実行してください
-- 重複を避ける場合: 先に DELETE FROM assignment WHERE assigned_username = 'tanaka'; を実行

INSERT INTO assignment (category, index_start, index_end, assigned_username)
VALUES
  ('ladies_jacket', 1, 100, 'tanaka'),
  ('ladies_pants', 1, 50, 'tanaka'),
  ('mens_tops', 1, 80, 'tanaka');
