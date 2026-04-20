-- ─── TOPICS ──────────────────────────────────────────────────────────────────

INSERT INTO topics (name, description, image_url, sort_order) VALUES
    ('Food', 'Words related to food, drinks and cooking', '', 1),
    ('Home',  'Words related to home and furniture',       '', 2);

-- ─── SUBTOPICS ────────────────────────────────────────────────────────────────

INSERT INTO subtopics (topic_id, name, description, image_url, sort_order, words_count, disabled_mechanics) VALUES
    (1, 'Fruits',     'Common fruits',           '', 1, 6, '[]'),
    (1, 'Vegetables', 'Common vegetables',        '', 2, 5, '["mnemonic_cards"]'),
    (2, 'Furniture',  'Furniture and home items', '', 1, 5, '[]');

-- ─── WORDS: Fruits (subtopic 1) ───────────────────────────────────────────────

INSERT INTO words (subtopic_id, word_en, transcription_en, translation_ru, image_url, usage_example_en, usage_example_en_translation_ru, mnemonic_image_url, mnemo_text) VALUES
    (1, 'apple',      'ˈæpəl',     'яблоко',    '', 'I eat an apple every morning.',         'Я ем яблоко каждое утро.',          NULL, NULL),
    (1, 'banana',     'bəˈnɑːnə',  'банан',     '', 'She peeled a banana for breakfast.',    'Она очистила банан к завтраку.',     NULL, NULL),
    (1, 'orange',     'ˈɒrɪndʒ',   'апельсин',  '', 'He squeezed an orange for juice.',      'Он выжал апельсин для сока.',        NULL, 'Представь оранжевый шар с буквой О — это апельсин!'),
    (1, 'strawberry', 'ˈstrɔːbəri','клубника',  '', 'We picked strawberries in the garden.', 'Мы собирали клубнику в саду.',       NULL, NULL),
    (1, 'grape',      'ɡreɪp',     'виноград',  '', 'These grapes are very sweet.',          'Этот виноград очень сладкий.',       NULL, NULL),
    (1, 'lemon',      'ˈlemən',    'лимон',     '', 'Add a slice of lemon to your tea.',     'Добавь дольку лимона в чай.',        NULL, 'Лимон — кислый, как слово «лемон» режет язык.');

-- ─── WORDS: Vegetables (subtopic 2) ──────────────────────────────────────────

INSERT INTO words (subtopic_id, word_en, transcription_en, translation_ru, image_url, usage_example_en, usage_example_en_translation_ru, mnemonic_image_url, mnemo_text) VALUES
    (2, 'carrot',   'ˈkærət',     'морковь',   '', 'Rabbits love to eat carrots.',          'Кролики любят есть морковь.',        NULL, NULL),
    (2, 'potato',   'pəˈteɪtəʊ',  'картофель', '', 'She boiled the potatoes for dinner.',   'Она сварила картофель на ужин.',      NULL, NULL),
    (2, 'tomato',   'təˈmɑːtəʊ',  'помидор',   '', 'He sliced the tomato for the salad.',   'Он нарезал помидор для салата.',      NULL, NULL),
    (2, 'onion',    'ˈʌnjən',     'лук',       '', 'Cutting onions makes your eyes water.', 'От нарезки лука слезятся глаза.',    NULL, NULL),
    (2, 'cucumber', 'ˈkjuːkʌmbə', 'огурец',    '', 'The cucumber was fresh and crispy.',    'Огурец был свежим и хрустящим.',     NULL, NULL);

-- ─── WORDS: Furniture (subtopic 3) ───────────────────────────────────────────

INSERT INTO words (subtopic_id, word_en, transcription_en, translation_ru, image_url, usage_example_en, usage_example_en_translation_ru, mnemonic_image_url, mnemo_text) VALUES
    (3, 'table', 'ˈteɪbəl', 'стол',  '', 'Put the plates on the table.',          'Поставь тарелки на стол.',           NULL, 'Стол — «тэйбл», как таблица с ножками.'),
    (3, 'chair', 'tʃeə',    'стул',  '', 'She sat down on the chair.',            'Она села на стул.',                  NULL, NULL),
    (3, 'sofa',  'ˈsəʊfə',  'диван', '', 'They watched TV on the sofa.',          'Они смотрели телевизор на диване.',  NULL, NULL),
    (3, 'bed',   'bed',      'кровать','','He fell asleep as soon as he hit the bed.','Он заснул, как только лёг в кровать.', NULL, NULL),
    (3, 'shelf', 'ʃelf',    'полка', '', 'The books are on the top shelf.',       'Книги на верхней полке.',            NULL, NULL);
