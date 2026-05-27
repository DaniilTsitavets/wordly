-- Word images sourced from Unsplash (free for commercial use, no attribution required).
-- Replace URLs with S3 paths when migrating to self-hosted assets.

-- Fruits
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1630563451961-ac2ff27616ab?w=400&q=80' WHERE word_en = 'apple';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&q=80' WHERE word_en = 'banana';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1609424572698-04d9d2e04954?w=400&q=80' WHERE word_en = 'orange';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1687125106218-3c7a1963bd6e?w=400&q=80' WHERE word_en = 'strawberry';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1615485925763-86786288908a?w=400&q=80' WHERE word_en = 'grape';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1582287104445-6754664dbdb2?w=400&q=80' WHERE word_en = 'lemon';

-- Vegetables
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1600623632695-0169fbfe563d?w=400&q=80' WHERE word_en = 'carrot';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1617130094141-532436117aa1?w=400&q=80' WHERE word_en = 'potato';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1640958905248-fb819ea1bc6b?w=400&q=80' WHERE word_en = 'tomato';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=400&q=80' WHERE word_en = 'onion';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1587411768638-ec71f8e33b78?w=400&q=80' WHERE word_en = 'cucumber';

-- Mnemonics (orange, lemon, table — only words with mnemo_text in seed data)
UPDATE words SET
    mnemonic_image_url = 'https://images.unsplash.com/photo-1552089123-2d26226fc2b7?w=400&q=80',
    mnemo_text         = '«Оранж» — это цвет оранжевый! Апельсин такой же оранжевый, как его английское название.'
    WHERE word_en = 'orange';

UPDATE words SET
    mnemonic_image_url = 'https://images.unsplash.com/photo-1540073280202-6e5c781befec?w=400&q=80',
    mnemo_text         = '«Лемон» и «лимон» — почти близнецы. Просто скривись от кислоты — и ты уже говоришь по-английски!'
    WHERE word_en = 'lemon';

UPDATE words SET
    mnemonic_image_url = 'https://images.unsplash.com/photo-1506968430777-bf7784a87f23?w=400&q=80',
    mnemo_text         = '«Тэйбл» — как «таблица», только деревянная. Стол — плоская поверхность, как клетки таблицы.'
    WHERE word_en = 'table';

-- Furniture
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1559051668-934cd674493c?w=400&q=80' WHERE word_en = 'table';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=400&q=80' WHERE word_en = 'chair';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1691480152351-4b3f2c89ccff?w=400&q=80' WHERE word_en = 'sofa';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=400&q=80' WHERE word_en = 'bed';
UPDATE words SET image_url = 'https://images.unsplash.com/photo-1588111948296-83a8e036e004?w=400&q=80' WHERE word_en = 'shelf';