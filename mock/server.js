const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  console.log(`${req.method} ${req.path}`);
  next();
});

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const FAKE_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaXNHdWVzdCI6ZmFsc2UsImV4cCI6OTk5OTk5OTk5OX0.mock';
const GUEST_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwiaXNHdWVzdCI6dHJ1ZSwiZXhwIjo5OTk5OTk5OTk5fQ.guest';

const isGuest = (req) => {
  const auth = req.headers['authorization'] || '';
  return auth.includes(GUEST_TOKEN);
};

const MOCK_USER = {
  id: 1, name: 'Alex', surname: 'Smith', email: 'mock@test.com',
  is_guest: false, interface_language: 'ru', daily_goal_min: 10,
  notifications_enabled: true, color_theme: 'system',
  onboarding_completed: false,
  streak: 5, gems: 150,
  last_active_date: '2026-04-09', created_at: '2026-01-01T00:00:00Z',
};

// Subtopic 1 — 9 words, 6 with mnemonics → Level 0 (mnemonic_cards) active
const WORDS_1 = [
  { id: 1, word_en: 'plate', transcription_en: 'pleɪt', translation_ru: 'тарелка',
    image_url: 'https://placehold.co/300x200?text=plate',
    usage_example_en: 'Put the plate on the table.',
    usage_example_en_translation_ru: 'Поставь тарелку на стол.',
    mnemonic: { image_url: 'https://placehold.co/300x200?text=mnemonic', mnemo_text: 'ПЛЕТЁТ — тарелка плетёт узоры' } },
  { id: 2, word_en: 'cup', transcription_en: 'kʌp', translation_ru: 'чашка',
    image_url: 'https://placehold.co/300x200?text=cup',
    usage_example_en: 'Fill the cup with tea.',
    usage_example_en_translation_ru: 'Наполни чашку чаем.',
    mnemonic: { image_url: 'https://placehold.co/300x200?text=mnemonic', mnemo_text: 'КАП — капает в чашку' } },
  { id: 3, word_en: 'fork', transcription_en: 'fɔːrk', translation_ru: 'вилка',
    image_url: 'https://placehold.co/300x200?text=fork',
    usage_example_en: 'Use a fork to eat salad.',
    usage_example_en_translation_ru: 'Используй вилку чтобы есть салат.',
    mnemonic: { image_url: 'https://placehold.co/300x200?text=mnemonic', mnemo_text: 'ФОРК — вилка ветвится как дерево' } },
  { id: 4, word_en: 'knife', transcription_en: 'naɪf', translation_ru: 'нож',
    image_url: 'https://placehold.co/300x200?text=knife',
    usage_example_en: 'Cut bread with a knife.',
    usage_example_en_translation_ru: 'Нарежь хлеб ножом.',
    mnemonic: { image_url: 'https://placehold.co/300x200?text=mnemonic', mnemo_text: 'НАЙФ — найди нож на кухне' } },
  { id: 5, word_en: 'spoon', transcription_en: 'spuːn', translation_ru: 'ложка',
    image_url: 'https://placehold.co/300x200?text=spoon',
    usage_example_en: 'Stir with a spoon.',
    usage_example_en_translation_ru: 'Помешай ложкой.',
    mnemonic: { image_url: 'https://placehold.co/300x200?text=mnemonic', mnemo_text: 'СПУН — спуниться над тарелкой с ложкой' } },
  { id: 6, word_en: 'bowl', transcription_en: 'boʊl', translation_ru: 'миска',
    image_url: 'https://placehold.co/300x200?text=bowl',
    usage_example_en: 'Pour soup into the bowl.',
    usage_example_en_translation_ru: 'Налей суп в миску.',
    mnemonic: { image_url: 'https://placehold.co/300x200?text=mnemonic', mnemo_text: 'БОУЛ — круглая как для боулинга' } },
  { id: 7, word_en: 'glass', transcription_en: 'ɡlæs', translation_ru: 'стакан',
    image_url: 'https://placehold.co/300x200?text=glass',
    usage_example_en: 'Drink water from a glass.',
    usage_example_en_translation_ru: 'Пей воду из стакана.',
    mnemonic: null },
  { id: 8, word_en: 'pot', transcription_en: 'pɒt', translation_ru: 'кастрюля',
    image_url: 'https://placehold.co/300x200?text=pot',
    usage_example_en: 'Boil water in a pot.',
    usage_example_en_translation_ru: 'Вскипяти воду в кастрюле.',
    mnemonic: null },
  { id: 9, word_en: 'pan', transcription_en: 'pæn', translation_ru: 'сковорода',
    image_url: 'https://placehold.co/300x200?text=pan',
    usage_example_en: 'Fry eggs in a pan.',
    usage_example_en_translation_ru: 'Пожарь яйца на сковороде.',
    mnemonic: null },
];

// Subtopic 2 — 9 words, NO mnemonics → Level 0 disabled, starts with Level 1 (flashcards)
const WORDS_2 = [
  { id: 10, word_en: 'apple', transcription_en: 'ˈæp.əl', translation_ru: 'яблоко',
    image_url: 'https://placehold.co/300x200?text=apple',
    usage_example_en: 'Eat an apple every day.',
    usage_example_en_translation_ru: 'Ешь яблоко каждый день.', mnemonic: null },
  { id: 11, word_en: 'bread', transcription_en: 'bred', translation_ru: 'хлеб',
    image_url: 'https://placehold.co/300x200?text=bread',
    usage_example_en: 'Buy a loaf of bread.',
    usage_example_en_translation_ru: 'Купи буханку хлеба.', mnemonic: null },
  { id: 12, word_en: 'milk', transcription_en: 'mɪlk', translation_ru: 'молоко',
    image_url: 'https://placehold.co/300x200?text=milk',
    usage_example_en: 'Drink a glass of milk.',
    usage_example_en_translation_ru: 'Выпей стакан молока.', mnemonic: null },
  { id: 13, word_en: 'egg', transcription_en: 'eɡ', translation_ru: 'яйцо',
    image_url: 'https://placehold.co/300x200?text=egg',
    usage_example_en: 'Boil an egg for breakfast.',
    usage_example_en_translation_ru: 'Свари яйцо на завтрак.', mnemonic: null },
  { id: 14, word_en: 'cheese', transcription_en: 'tʃiːz', translation_ru: 'сыр',
    image_url: 'https://placehold.co/300x200?text=cheese',
    usage_example_en: 'Add cheese to the pizza.',
    usage_example_en_translation_ru: 'Добавь сыр на пиццу.', mnemonic: null },
  { id: 15, word_en: 'butter', transcription_en: 'ˈbʌt.ər', translation_ru: 'масло',
    image_url: 'https://placehold.co/300x200?text=butter',
    usage_example_en: 'Spread butter on the bread.',
    usage_example_en_translation_ru: 'Намажь масло на хлеб.', mnemonic: null },
  { id: 16, word_en: 'salt', transcription_en: 'sɔːlt', translation_ru: 'соль',
    image_url: 'https://placehold.co/300x200?text=salt',
    usage_example_en: 'Add salt to the soup.',
    usage_example_en_translation_ru: 'Добавь соль в суп.', mnemonic: null },
  { id: 17, word_en: 'sugar', transcription_en: 'ˈʃʊɡ.ər', translation_ru: 'сахар',
    image_url: 'https://placehold.co/300x200?text=sugar',
    usage_example_en: 'Put sugar in your tea.',
    usage_example_en_translation_ru: 'Положи сахар в чай.', mnemonic: null },
  { id: 18, word_en: 'rice', transcription_en: 'raɪs', translation_ru: 'рис',
    image_url: 'https://placehold.co/300x200?text=rice',
    usage_example_en: 'Cook rice for dinner.',
    usage_example_en_translation_ru: 'Приготовь рис на ужин.', mnemonic: null },
];

const ALL_WORDS = [...WORDS_1, ...WORDS_2];

const toPreview = (w) => ({
  id: w.id, word_en: w.word_en, transcription_en: w.transcription_en,
  translation_ru: w.translation_ru, image_url: w.image_url,
  has_mnemonic: w.mnemonic !== null,
});

const toSessionWord = (w, mechanic) => ({
  id: w.id, word_en: w.word_en, transcription_en: w.transcription_en,
  translation_ru: w.translation_ru, image_url: w.image_url,
  usage_example_en: w.usage_example_en,
  usage_example_en_translation_ru: w.usage_example_en_translation_ru,
  mnemonic: mechanic === 'mnemonic_cards' ? w.mnemonic : null,
});

const MECHANICS = ['mnemonic_cards', 'flashcards', 'matching', 'filling_gaps', 'word_builder'];

const makeLevels = (currentMechanic, disabled = []) =>
  MECHANICS.filter(m => !disabled.includes(m)).map((m, i, arr) => ({
    mechanic_type: m,
    status: m === currentMechanic ? 'in_progress' : i < arr.indexOf(currentMechanic) ? 'completed' : 'locked',
    started_at: m === currentMechanic ? '2026-04-09T10:00:00Z' : null,
    completed_at: null,
  }));

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post('/api/v1/auth/register', (req, res) => {
  const { name, surname, email } = req.body;
  Object.assign(MOCK_USER, { name, surname, email, onboarding_completed: false });
  res.status(201).json({ access_token: FAKE_TOKEN, user: MOCK_USER });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.json({ access_token: FAKE_TOKEN, user: MOCK_USER });
});

app.post('/api/v1/auth/guest', (req, res) => {
  res.status(201).json({
    access_token: GUEST_TOKEN,
    user: { ...MOCK_USER, id: 2, name: null, surname: null, email: null, is_guest: true },
  });
});

app.post('/api/v1/auth/logout', (req, res) => res.sendStatus(204));

// ─── USERS ───────────────────────────────────────────────────────────────────

app.get('/api/v1/users/me', (req, res) => res.json(MOCK_USER));
app.put('/api/v1/users/me', (req, res) => {
  Object.assign(MOCK_USER, req.body);
  res.json(MOCK_USER);
});

// ─── TOPICS ──────────────────────────────────────────────────────────────────

app.get('/api/v1/topics', (req, res) => {
  res.json({
    topics: [{
      id: 1, name: 'Food & Kitchen', description: 'Everyday food and kitchen vocabulary',
      image_url: 'https://placehold.co/400x300?text=Food', sort_order: 1,
      subtopics_total: 2, subtopics_completed: 0,
    }],
    current_position: { subtopic_id: 1, mechanic_type: 'mnemonic_cards' },
  });
});

app.get('/api/v1/topics/:id', (req, res) => {
  if (req.params.id !== '1') return res.status(404).json({ code: 'NOT_FOUND', message: 'Topic not found' });
  res.json({
    id: 1, name: 'Food & Kitchen', description: 'Everyday food and kitchen vocabulary',
    image_url: 'https://placehold.co/400x300?text=Food',
    subtopic_ids: [1, 2],
  });
});

// ─── SUBTOPICS ───────────────────────────────────────────────────────────────

const SUBTOPICS_SUMMARY = [
  { id: 1, name: 'Кухонная утварь', description: 'Посуда и кухонные принадлежности',
    image_url: 'https://placehold.co/400x300?text=Kitchen', sort_order: 1,
    words_count: 9, disabled_mechanics: [], status: 'in_progress' },
  { id: 2, name: 'Продукты питания', description: 'Базовые продукты из магазина',
    image_url: 'https://placehold.co/400x300?text=Groceries', sort_order: 2,
    words_count: 9, disabled_mechanics: ['mnemonic_cards'], status: 'unblocked' },
];

app.post('/api/v1/subtopics/batch', (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) return res.status(400).json({ code: 'BAD_REQUEST', message: 'ids must not be empty' });
  const result = SUBTOPICS_SUMMARY.filter(s => ids.includes(s.id)).map(s => {
    if (isGuest(req) && s.id === 2) return { ...s, status: 'locked' };
    return s;
  });
  res.json(result);
});

app.get('/api/v1/subtopics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 1) return res.json({
    id: 1, name: 'Кухонная утварь', description: 'Посуда и кухонные принадлежности',
    image_url: 'https://placehold.co/400x300?text=Kitchen',
    words_count: 9, disabled_mechanics: [],
    levels: makeLevels('mnemonic_cards'),
  });
  if (id === 2) return res.json({
    id: 2, name: 'Продукты питания', description: 'Базовые продукты из магазина',
    image_url: 'https://placehold.co/400x300?text=Groceries',
    words_count: 9, disabled_mechanics: ['mnemonic_cards'],
    levels: makeLevels('flashcards', ['mnemonic_cards']),
  });
  res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
});

app.get('/api/v1/subtopics/:id/words', (req, res) => {
  const id = parseInt(req.params.id);
  const words = id === 1 ? WORDS_1 : id === 2 ? WORDS_2 : null;
  if (!words) return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  res.json({ words: words.map(toPreview) });
});

// ─── SESSION ─────────────────────────────────────────────────────────────────

app.get('/api/v1/subtopics/:id/session', (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 1) return res.json({
    subtopic_id: 1, mechanic_type: 'mnemonic_cards',
    words: WORDS_1.map(w => toSessionWord(w, 'mnemonic_cards')),
  });
  if (id === 2) return res.json({
    subtopic_id: 2, mechanic_type: 'flashcards',
    words: WORDS_2.map(w => toSessionWord(w, 'flashcards')),
  });
  res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
});

app.post('/api/v1/subtopics/:id/session/answer', (req, res) => {
  const { word_id, user_answer } = req.body;
  const word = ALL_WORDS.find(w => w.id === word_id);
  if (!word) return res.status(404).json({ code: 'NOT_FOUND', message: 'Word not found' });
  const is_correct = user_answer?.toLowerCase().trim() === word.word_en.toLowerCase();
  res.json({ word_id, is_correct, correct_answer: word.word_en });
});

app.post('/api/v1/subtopics/:id/session/complete', (req, res) => {
  const { mechanic_type } = req.body;
  const idx = MECHANICS.indexOf(mechanic_type);
  const next = idx >= 0 && idx < MECHANICS.length - 1 ? MECHANICS[idx + 1] : null;
  res.json({ mechanic_type, gems_earned: 5, next_mechanic: next, subtopic_completed: next === null });
});

// ─── RECALL ──────────────────────────────────────────────────────────────────

app.get('/api/v1/recall', (req, res) => {
  res.json({
    total: 3,
    words: WORDS_1.slice(0, 3).map(w => ({
      id: w.id, word_en: w.word_en, translation_ru: w.translation_ru,
      transcription_en: w.transcription_en, recall_interval: 7,
    })),
  });
});

app.post('/api/v1/recall/answer', (req, res) => {
  const { word_id, user_answer } = req.body;
  const word = ALL_WORDS.find(w => w.id === word_id);
  const is_correct = user_answer?.toLowerCase().trim() === (word?.word_en || '').toLowerCase();
  res.json({ word_id, is_correct, correct_answer: word?.word_en || '' });
});

app.post('/api/v1/recall/complete', (req, res) => {
  res.json({ total_words: 3, correct: 2, failed: 1, gems_earned: 5 });
});

// ─── VOCABULARY ───────────────────────────────────────────────────────────────

app.get('/api/v1/vocabulary', (req, res) => {
  res.json({
    total: WORDS_1.length,
    page: 1,
    words: WORDS_1.map(w => ({
      id: w.id, word_en: w.word_en, transcription_en: w.transcription_en,
      translation_ru: w.translation_ru, image_url: w.image_url,
      status: 'learning', next_recall: '2026-04-12',
    })),
  });
});

// ─── START ───────────────────────────────────────────────────────────────────

const PORT = 4010;
app.listen(PORT, () => console.log(`Mock server running on http://localhost:${PORT}/api/v1`));