-- assignment.csv の内容を assignment テーブルに投入
-- 実行前に create_assignment_table.sql を実行してください
-- 重複を避ける場合: 先に DELETE FROM assignment; を実行

INSERT INTO assignment (category, index_start, index_end, assigned_username)
VALUES
  ('ladies_jacket', 1, 994, '梶原　悠雅'),
  ('ladies_jacket', 995, 1988, '山内悠理子'),
  ('ladies_jacket', 1989, 2982, '東島啓太'),
  ('ladies_jacket', 2983, 3750, '中村織仁'),
  ('ladies_pants', 1, 226, '中村織仁'),
  ('ladies_pants', 227, 1220, 'MAOYONG'),
  ('ladies_pants', 1221, 2214, '市毛宏弥'),
  ('ladies_pants', 2215, 3208, '柴田瑛貴'),
  ('ladies_pants', 3209, 3750, '日野 玲'),
  ('ladies_suit', 1, 452, '日野 玲'),
  ('ladies_suit', 453, 1446, '鈴木大翔'),
  ('ladies_suit', 1447, 1805, '平井美野里'),
  ('ladies_tops', 1, 635, '平井美野里'),
  ('ladies_tops', 636, 1629, '大西達也'),
  ('ladies_tops', 1630, 2623, '武藤聡希'),
  ('ladies_tops', 2624, 3617, '渡邊友宏'),
  ('ladies_tops', 3618, 3750, '山中涼雅'),
  ('mens_jacket', 1, 861, '山中涼雅'),
  ('mens_jacket', 862, 1855, '馬場開仁'),
  ('mens_jacket', 1856, 2849, '川浪樹'),
  ('mens_jacket', 2850, 3750, '小林倫太朗'),
  ('mens_pants', 1, 93, '小林倫太朗'),
  ('mens_pants', 94, 1087, '松本碧'),
  ('mens_pants', 1088, 2081, '青木秀真'),
  ('mens_pants', 2082, 3075, '中嶋光太'),
  ('mens_pants', 3076, 3750, '本澤聡一郎'),
  ('mens_suit', 1, 319, '本澤聡一郎'),
  ('mens_suit', 320, 547, '松橋悠'),
  ('mens_tops', 1, 3750, '松橋悠');
