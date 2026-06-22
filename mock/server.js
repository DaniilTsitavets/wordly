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

const DEFAULT_USER = {
  id: 1, name: 'Alex', surname: 'Smith', email: 'mock@test.com',
  is_guest: false, role: 'ADMIN', interface_language: 'ru', daily_goal_min: 10, daily_goal_words: 10,
  notifications_enabled: true, color_theme: 'system',
  onboarding_completed: false,
  streak: 0, gems: 150,
  last_active_date: null, created_at: '2026-01-01T00:00:00Z',
};

const MOCK_USER = { ...DEFAULT_USER };
let MOCK_PASSWORD = 'secret123';

const resetMockUser = (overrides = {}) => {
  Object.keys(MOCK_USER).forEach((key) => delete MOCK_USER[key]);
  Object.assign(MOCK_USER, DEFAULT_USER, overrides);
};

// ─── MUTABLE DATA STORES ─────────────────────────────────────────────────────

const topics = [
  { id: 1, name: 'Food & Drinks',
    description: 'Master essential vocabulary for everyday meals and beverages',
    image_url: 'https://placehold.co/600x340/f97316/ffffff/png?text=Food+%26+Drinks&font=raleway',
    sort_order: 1 },
  { id: 2, name: 'Numbers',
    description: 'Master essential vocabulary for everyday meals and beverages',
    image_url: 'https://placehold.co/600x340/8b5cf6/ffffff/png?text=Numbers&font=raleway',
    sort_order: 2 },
];

const subtopics = [
  { id: 1, topic_id: 1, name: 'Food',
    description: 'Learn essential food vocabulary, from fruits and vegetables to main dishes',
    image_url: 'https://placehold.co/600x340/fb923c/ffffff/png?text=Food&font=raleway',
    sort_order: 1, words_count_override: 50,
    disabled_mechanics: [], status: 'in_progress' },
  { id: 2, topic_id: 1, name: 'Drinks',
    description: 'Master beverage vocabulary including hot drinks, cold drinks, and more',
    image_url: 'https://placehold.co/600x340/3b82f6/ffffff/png?text=Drinks&font=raleway',
    sort_order: 2, words_count_override: 35,
    disabled_mechanics: ['mnemonic_cards'], status: 'unblocked' },
  { id: 3, topic_id: 1, name: 'Desserts',
    description: 'Explore sweet treats and dessert vocabulary from around the world',
    image_url: 'https://placehold.co/600x340/ec4899/ffffff/png?text=Desserts&font=raleway',
    sort_order: 3, words_count_override: 40,
    disabled_mechanics: [], status: 'locked' },
  { id: 4, topic_id: 2, name: '1-10',
    description: 'Learn the basic numbers from one to ten',
    image_url: 'https://placehold.co/600x340/8b5cf6/ffffff/png?text=1-10&font=raleway',
    sort_order: 1, words_count_override: 10,
    disabled_mechanics: [], status: 'locked' },
];

// Unified word format — flat mnemonic fields, subtopic_id
const words = [
  { id: 1,  subtopic_id: 1, word_en: 'plate',  transcription_en: 'pleɪt',   translation_ru: 'тарелка',
    image_url: 'https://placehold.co/300x200?text=plate',
    usage_example_en: 'Put the plate on the table.',
    usage_example_en_translation_ru: 'Поставь тарелку на стол.',
    mnemonic_image_url: 'https://placehold.co/600x400/fce7f3/ec4899/png?text=ПЛЕТЁТ&font=raleway', mnemo_text: 'ПЛЕТЁТ — тарелка плетёт узоры' },
  { id: 2,  subtopic_id: 1, word_en: 'cup',    transcription_en: 'kʌp',     translation_ru: 'чашка',
    image_url: 'https://placehold.co/300x200?text=cup',
    usage_example_en: 'Fill the cup with tea.',
    usage_example_en_translation_ru: 'Наполни чашку чаем.',
    mnemonic_image_url: 'https://placehold.co/600x400/dbeafe/3b82f6/png?text=КАП&font=raleway', mnemo_text: 'КАП — капает в чашку' },
  { id: 3,  subtopic_id: 1, word_en: 'fork',   transcription_en: 'fɔːrk',   translation_ru: 'вилка',
    image_url: 'https://placehold.co/300x200?text=fork',
    usage_example_en: 'Use a fork to eat salad.',
    usage_example_en_translation_ru: 'Используй вилку чтобы есть салат.',
    mnemonic_image_url: 'https://placehold.co/600x400/dcfce7/16a34a/png?text=ФОРК&font=raleway', mnemo_text: 'ФОРК — вилка ветвится как дерево' },
  { id: 4,  subtopic_id: 1, word_en: 'knife',  transcription_en: 'naɪf',    translation_ru: 'нож',
    image_url: 'https://placehold.co/300x200?text=knife',
    usage_example_en: 'Cut bread with a knife.',
    usage_example_en_translation_ru: 'Нарежь хлеб ножом.',
    mnemonic_image_url: 'https://placehold.co/600x400/fef3c7/d97706/png?text=НАЙФ&font=raleway', mnemo_text: 'НАЙФ — найди нож на кухне' },
  { id: 5,  subtopic_id: 1, word_en: 'spoon',  transcription_en: 'spuːn',   translation_ru: 'ложка',
    image_url: 'https://placehold.co/300x200?text=spoon',
    usage_example_en: 'Stir with a spoon.',
    usage_example_en_translation_ru: 'Помешай ложкой.',
    mnemonic_image_url: 'https://placehold.co/600x400/ede9fe/8b5cf6/png?text=СПУН&font=raleway', mnemo_text: 'СПУН — спуниться над тарелкой с ложкой' },
  { id: 6,  subtopic_id: 1, word_en: 'bowl',   transcription_en: 'boʊl',    translation_ru: 'миска',
    image_url: 'https://placehold.co/300x200?text=bowl',
    usage_example_en: 'Pour soup into the bowl.',
    usage_example_en_translation_ru: 'Налей суп в миску.',
    mnemonic_image_url: 'https://placehold.co/600x400/fee2e2/dc2626/png?text=БОУЛ&font=raleway', mnemo_text: 'БОУЛ — круглая как для боулинга' },
  { id: 7,  subtopic_id: 1, word_en: 'glass',  transcription_en: 'ɡlæs',    translation_ru: 'стакан',
    image_url: 'https://placehold.co/300x200?text=glass',
    usage_example_en: 'Drink water from a glass.',
    usage_example_en_translation_ru: 'Пей воду из стакана.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 8,  subtopic_id: 1, word_en: 'pot',    transcription_en: 'pɒt',     translation_ru: 'кастрюля',
    image_url: 'https://placehold.co/300x200?text=pot',
    usage_example_en: 'Boil water in a pot.',
    usage_example_en_translation_ru: 'Вскипяти воду в кастрюле.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 9,  subtopic_id: 1, word_en: 'pan',    transcription_en: 'pæn',     translation_ru: 'сковорода',
    image_url: 'https://placehold.co/300x200?text=pan',
    usage_example_en: 'Fry eggs in a pan.',
    usage_example_en_translation_ru: 'Пожарь яйца на сковороде.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 10, subtopic_id: 2, word_en: 'apple',  transcription_en: 'ˈæp.əl',  translation_ru: 'яблоко',
    image_url: 'https://placehold.co/300x200?text=apple',
    usage_example_en: 'Eat an apple every day.',
    usage_example_en_translation_ru: 'Ешь яблоко каждый день.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 11, subtopic_id: 2, word_en: 'bread',  transcription_en: 'bred',    translation_ru: 'хлеб',
    image_url: 'https://placehold.co/300x200?text=bread',
    usage_example_en: 'Buy a loaf of bread.',
    usage_example_en_translation_ru: 'Купи буханку хлеба.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 12, subtopic_id: 2, word_en: 'milk',   transcription_en: 'mɪlk',   translation_ru: 'молоко',
    image_url: 'https://placehold.co/300x200?text=milk',
    usage_example_en: 'Drink a glass of milk.',
    usage_example_en_translation_ru: 'Выпей стакан молока.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 13, subtopic_id: 2, word_en: 'egg',    transcription_en: 'eɡ',      translation_ru: 'яйцо',
    image_url: 'https://placehold.co/300x200?text=egg',
    usage_example_en: 'Boil an egg for breakfast.',
    usage_example_en_translation_ru: 'Свари яйцо на завтрак.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 14, subtopic_id: 2, word_en: 'cheese', transcription_en: 'tʃiːz',  translation_ru: 'сыр',
    image_url: 'https://placehold.co/300x200?text=cheese',
    usage_example_en: 'Add cheese to the pizza.',
    usage_example_en_translation_ru: 'Добавь сыр на пиццу.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 15, subtopic_id: 2, word_en: 'butter', transcription_en: 'ˈbʌt.ər', translation_ru: 'масло',
    image_url: 'https://placehold.co/300x200?text=butter',
    usage_example_en: 'Spread butter on the bread.',
    usage_example_en_translation_ru: 'Намажь масло на хлеб.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 16, subtopic_id: 2, word_en: 'salt',   transcription_en: 'sɔːlt',  translation_ru: 'соль',
    image_url: 'https://placehold.co/300x200?text=salt',
    usage_example_en: 'Add salt to the soup.',
    usage_example_en_translation_ru: 'Добавь соль в суп.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 17, subtopic_id: 2, word_en: 'sugar',  transcription_en: 'ˈʃʊɡ.ər', translation_ru: 'сахар',
    image_url: 'https://placehold.co/300x200?text=sugar',
    usage_example_en: 'Put sugar in your tea.',
    usage_example_en_translation_ru: 'Положи сахар в чай.',
    mnemonic_image_url: null, mnemo_text: null },
  { id: 18, subtopic_id: 2, word_en: 'rice',   transcription_en: 'raɪs',   translation_ru: 'рис',
    image_url: 'https://placehold.co/300x200?text=rice',
    usage_example_en: 'Cook rice for dinner.',
    usage_example_en_translation_ru: 'Приготовь рис на ужин.',
    mnemonic_image_url: null, mnemo_text: null },
];

let nextTopicId = 3;
let nextSubtopicId = 5;
let nextWordId = 19;

const dailyGames = [
  { id: 1, idiom: 'Break a leg', option_1: 'Сломать ногу', option_2: 'Пожелать удачи', option_3: 'Убежать', option_4: 'Упасть', correct_option: 2, scheduled_date: null },
  { id: 2, idiom: 'Hit the sack', option_1: 'Ударить мешок', option_2: 'Идти на рынок', option_3: 'Лечь спать', option_4: 'Уволиться', correct_option: 3, scheduled_date: null },
  { id: 3, idiom: 'Bite the bullet', option_1: 'Стрелять в цель', option_2: 'Смириться и терпеть', option_3: 'Съесть быстро', option_4: 'Испугаться', correct_option: 2, scheduled_date: null },
];
let nextDailyGameId = 4;

const mockUsers = [
  { id: 1, name: 'Alex', surname: 'Smith', email: 'mock@test.com',
    is_guest: false, role: 'ADMIN', streak: 0, gems: 150,
    last_active_date: '2026-04-09', created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: null, surname: null, email: null,
    is_guest: true, role: 'USER', streak: 0, gems: 0,
    last_active_date: null, created_at: '2026-04-09T08:00:00Z' },
];

// ─── MAPPERS ─────────────────────────────────────────────────────────────────

const toPreview = (w) => ({
  id: w.id, word_en: w.word_en, transcription_en: w.transcription_en,
  translation_ru: w.translation_ru, image_url: w.image_url,
  has_mnemonic: !!(w.mnemonic_image_url || w.mnemo_text),
  mnemonic_image_url: w.mnemonic_image_url || null,
  mnemonic_text: w.mnemo_text || null,
});

const toSessionWord = (w, mechanic) => ({
  id: w.id, word_en: w.word_en, transcription_en: w.transcription_en,
  translation_ru: w.translation_ru, image_url: w.image_url,
  usage_example_en: w.usage_example_en,
  usage_example_en_translation_ru: w.usage_example_en_translation_ru,
  mnemonic: mechanic === 'mnemonic_cards' && w.mnemonic_image_url
    ? { image_url: w.mnemonic_image_url, mnemo_text: w.mnemo_text }
    : null,
});

const toAdminWord = (w) => ({
  id: w.id, subtopic_id: w.subtopic_id,
  word_en: w.word_en, transcription_en: w.transcription_en,
  translation_ru: w.translation_ru, image_url: w.image_url,
  usage_example_en: w.usage_example_en,
  usage_example_en_translation_ru: w.usage_example_en_translation_ru,
  mnemonic_image_url: w.mnemonic_image_url || null,
  mnemo_text: w.mnemo_text || null,
});

const toAdminTopic = (t) => ({
  ...t,
  subtopics_count: subtopics.filter(s => s.topic_id === t.id).length,
});

const toAdminSubtopic = (s) => ({
  id: s.id, topic_id: s.topic_id, name: s.name, description: s.description,
  image_url: s.image_url, sort_order: s.sort_order,
  words_count: words.filter(w => w.subtopic_id === s.id).length,
  disabled_mechanics: s.disabled_mechanics,
});

const MECHANICS = ['mnemonic_cards', 'flashcards', 'matching', 'filling_gaps', 'word_builder'];

// Track current mechanic per subtopic (in-memory state)
const subtopicProgress = {
  1: 'word_builder', // subtopic 1 - set to word_builder for testing
  2: 'flashcards',   // subtopic 2 starts with flashcards (mnemonic_cards disabled)
};

// Track words learned today (resets on server restart)
const dailyProgress = {
  completedSubtopicFirstMechanics: new Set([1]), // subtopic 1 already passed first mechanic
};

// Gem-award bookkeeping (all reset on server restart; mock has no persistence)
const awardedTopicBonus = new Set();   // topic ids that already granted the +15 bonus
const recallAnswers = new Map();       // word_id -> is_correct for the current recall session
let dailyGoalClaimed = false;          // dedupes the +10 daily-goal bonus (per server run)

function getWordsLearnedToday() {
  let total = 0;
  for (const subtopicId of dailyProgress.completedSubtopicFirstMechanics) {
    total += words.filter(w => w.subtopic_id === subtopicId).length;
  }
  return total;
}

const makeLevels = (currentMechanic, disabled = []) => {
  const available = MECHANICS.filter(m => !disabled.includes(m));
  if (!currentMechanic) {
    return available.map(m => ({
      mechanic_type: m, status: 'completed',
      started_at: '2026-04-09T10:00:00Z', completed_at: '2026-04-09T11:00:00Z',
    }));
  }
  const currentIdx = available.indexOf(currentMechanic);
  return available.map((m, i) => ({
    mechanic_type: m,
    status: i < currentIdx ? 'completed' : i === currentIdx ? 'in_progress' : 'locked',
    started_at: i <= currentIdx ? '2026-04-09T10:00:00Z' : null,
    completed_at: i < currentIdx ? '2026-04-09T11:00:00Z' : null,
  }));
};

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post('/api/v1/auth/register', (req, res) => {
  const { name, surname, email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'email and password are required' });
  }
  resetMockUser({ name: name ?? '', surname: surname ?? '', email });
  MOCK_PASSWORD = password;
  res.status(201).json({ access_token: FAKE_TOKEN, user: MOCK_USER });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email !== MOCK_USER.email || password !== MOCK_PASSWORD) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
  }
  res.json({ access_token: FAKE_TOKEN, user: MOCK_USER });
});

app.post('/api/v1/auth/guest', (req, res) => {
  res.status(201).json({
    access_token: GUEST_TOKEN,
    user: { ...MOCK_USER, id: 2, name: null, surname: null, email: null, is_guest: true, role: 'USER' },
  });
});

app.post('/api/v1/auth/logout', (req, res) => res.sendStatus(204));

app.post('/api/v1/auth/oauth/google', (req, res) => {
  const { code, redirect_uri } = req.body;
  if (!code || !redirect_uri) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'code and redirect_uri are required' });
  }
  Object.assign(MOCK_USER, { name: 'Alex', surname: 'Smith', email: 'mock@google.com', onboarding_completed: true });
  res.json({ access_token: FAKE_TOKEN, user: MOCK_USER });
});

// ─── USERS ───────────────────────────────────────────────────────────────────

app.get('/api/v1/users/me', (req, res) => {
  if (isGuest(req)) {
    return res.json({ ...MOCK_USER, id: 2, name: null, surname: null, email: null, is_guest: true, role: 'USER', streak: 0, gems: 0 });
  }
  res.json(MOCK_USER);
});
app.put('/api/v1/users/me', (req, res) => {
  Object.assign(MOCK_USER, req.body);
  res.json(MOCK_USER);
});

app.get('/api/v1/users/me/daily-progress', (req, res) => {
  res.json({
    words_learned_today: getWordsLearnedToday(),
    daily_goal_words: MOCK_USER.daily_goal_words,
  });
});

app.post('/api/v1/users/me/daily-goal/claim', (req, res) => {
  // Guests never accumulate gems (mirrors backend UserService.claimDailyGoal)
  if (MOCK_USER.is_guest) return res.json({ reached: false, gems_awarded: 0 });

  const reached = getWordsLearnedToday() >= MOCK_USER.daily_goal_words;
  if (!reached || dailyGoalClaimed) return res.json({ reached, gems_awarded: 0 });

  dailyGoalClaimed = true;
  MOCK_USER.gems = (MOCK_USER.gems ?? 0) + 10;
  res.json({ reached: true, gems_awarded: 10 });
});

// ─── TOPICS ──────────────────────────────────────────────────────────────────

app.get('/api/v1/topics', (req, res) => {
  res.json({
    topics: topics.map(t => ({
      id: t.id, name: t.name, description: t.description,
      image_url: t.image_url, sort_order: t.sort_order,
      subtopics_total: subtopics.filter(s => s.topic_id === t.id).length,
      subtopics_completed: 0,
    })),
    current_position: { subtopic_id: 1, mechanic_type: 'mnemonic_cards' },
  });
});

app.get('/api/v1/topics/:id', (req, res) => {
  const topic = topics.find(t => t.id === parseInt(req.params.id));
  if (!topic) return res.status(404).json({ code: 'NOT_FOUND', message: 'Topic not found' });
  res.json({
    ...topic,
    subtopic_ids: subtopics.filter(s => s.topic_id === topic.id).map(s => s.id),
  });
});

// ─── SUBTOPICS ───────────────────────────────────────────────────────────────

app.post('/api/v1/subtopics/batch', (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) return res.status(400).json({ code: 'BAD_REQUEST', message: 'ids must not be empty' });
  const result = subtopics.filter(s => ids.includes(s.id)).map(s => {
    const currentMechanic = subtopicProgress[s.id] !== undefined
      ? subtopicProgress[s.id]
      : (s.disabled_mechanics.includes('mnemonic_cards') ? 'flashcards' : 'mnemonic_cards');
    const levels = makeLevels(currentMechanic, s.disabled_mechanics);
    const totalMechanics = levels.length;
    const completedMechanics = levels.filter(l => l.status === 'completed').length;
    const summary = {
      id: s.id, name: s.name, description: s.description,
      image_url: s.image_url, sort_order: s.sort_order,
      words_count: s.words_count_override ?? words.filter(w => w.subtopic_id === s.id).length,
      disabled_mechanics: s.disabled_mechanics,
      status: isGuest(req) && s.id !== 1 ? 'locked' : s.status,
      completed_mechanics_count: completedMechanics,
      total_mechanics_count: totalMechanics,
    };
    return summary;
  });
  res.json(result);
});

app.get('/api/v1/subtopics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const s = subtopics.find(sub => sub.id === id);
  if (!s) return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  const currentMechanic = subtopicProgress[id] !== undefined
    ? subtopicProgress[id]
    : (s.disabled_mechanics.includes('mnemonic_cards') ? 'flashcards' : 'mnemonic_cards');
  res.json({
    id: s.id, name: s.name, description: s.description, image_url: s.image_url,
    words_count: words.filter(w => w.subtopic_id === id).length,
    disabled_mechanics: s.disabled_mechanics,
    levels: makeLevels(currentMechanic, s.disabled_mechanics),
  });
});

app.get('/api/v1/subtopics/:id/words', (req, res) => {
  const id = parseInt(req.params.id);
  const s = subtopics.find(sub => sub.id === id);
  if (!s) return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  res.json({ words: words.filter(w => w.subtopic_id === id).map(toPreview) });
});

// ─── SESSION ─────────────────────────────────────────────────────────────────

app.get('/api/v1/subtopics/:id/session', (req, res) => {
  const id = parseInt(req.params.id);
  const s = subtopics.find(sub => sub.id === id);
  if (!s) return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  const mechanic = subtopicProgress[id] !== undefined
    ? subtopicProgress[id]
    : (s.disabled_mechanics.includes('mnemonic_cards') ? 'flashcards' : 'mnemonic_cards');
  const subWords = words.filter(w => w.subtopic_id === id);
  const sessionWords = mechanic === 'mnemonic_cards'
    ? subWords.filter(w => w.mnemonic_image_url || w.mnemo_text)
    : subWords;
  res.json({ subtopic_id: id, mechanic_type: mechanic, words: sessionWords.map(w => toSessionWord(w, mechanic)) });
});

app.post('/api/v1/subtopics/:id/session/answer', (req, res) => {
  const { word_id, user_answer } = req.body;
  const word = words.find(w => w.id === word_id);
  if (!word) return res.status(404).json({ code: 'NOT_FOUND', message: 'Word not found' });
  const is_correct = user_answer?.toLowerCase().trim() === word.word_en.toLowerCase();
  res.json({ word_id, is_correct, correct_answer: word.word_en });
});

app.post('/api/v1/subtopics/:id/session/complete', (req, res) => {
  const id = parseInt(req.params.id);
  const { mechanic_type } = req.body;
  const s = subtopics.find(sub => sub.id === id);
  const disabled = s ? s.disabled_mechanics : [];
  const availableMechanics = MECHANICS.filter(m => !disabled.includes(m));
  const idx = availableMechanics.indexOf(mechanic_type);
  const next = idx >= 0 && idx < availableMechanics.length - 1 ? availableMechanics[idx + 1] : null;
  subtopicProgress[id] = next;
  // Track words learned today: first mechanic of a subtopic = new words
  if (idx === 0) {
    dailyProgress.completedSubtopicFirstMechanics.add(id);
  }
  console.log(`Subtopic ${id}: completed ${mechanic_type}, next is ${next}, words today: ${getWordsLearnedToday()}`);

  // +5 per level; +15 once when this completion finishes the whole topic (mirrors LearningService)
  let gemsEarned = 5;
  const subtopicCompleted = next === null;
  if (subtopicCompleted && s) {
    const siblings = subtopics.filter(sub => sub.topic_id === s.topic_id);
    const topicCompleted = siblings.every(sub => subtopicProgress[sub.id] === null);
    if (topicCompleted && !awardedTopicBonus.has(s.topic_id)) {
      awardedTopicBonus.add(s.topic_id);
      gemsEarned += 15;
    }
  }
  MOCK_USER.gems = (MOCK_USER.gems ?? 0) + gemsEarned;
  res.json({ mechanic_type, gems_earned: gemsEarned, next_mechanic: next, subtopic_completed: subtopicCompleted });
});

// ─── RECALL ──────────────────────────────────────────────────────────────────

app.get('/api/v1/recall', (req, res) => {
  // Distribute due words across the first three intervals: 5×1d, 3×3d, 2×7d
  const intervals = [1, 1, 1, 1, 1, 3, 3, 3, 7, 7];
  const due = words.slice(0, intervals.length).map((w, i) => ({
    id: w.id, word_en: w.word_en, translation_ru: w.translation_ru,
    transcription_en: w.transcription_en, recall_interval: intervals[i],
  }));
  res.json({ total: due.length, words: due });
});

app.post('/api/v1/recall/answer', (req, res) => {
  const { word_id, user_answer } = req.body;
  const word = words.find(w => w.id === word_id);
  const is_correct = user_answer?.toLowerCase().trim() === (word?.word_en || '').toLowerCase();
  recallAnswers.set(word_id, is_correct); // remember for gem scoring on complete
  res.json({ word_id, is_correct, correct_answer: word?.word_en || '' });
});

app.post('/api/v1/recall/complete', (req, res) => {
  const total = recallAnswers.size;
  const correct = [...recallAnswers.values()].filter(Boolean).length;
  const failed = total - correct;
  recallAnswers.clear(); // session is consumed

  if (total === 0) return res.json({ total_words: 0, correct: 0, failed: 0, gems_earned: 0 });

  // +10 if every word was correct, otherwise +5 (mirrors RecallService)
  const gemsEarned = failed === 0 ? 10 : 5;
  MOCK_USER.gems = (MOCK_USER.gems ?? 0) + gemsEarned;
  res.json({ total_words: total, correct, failed, gems_earned: gemsEarned });
});

// ─── VOCABULARY ───────────────────────────────────────────────────────────────

app.get('/api/v1/vocabulary', (req, res) => {
  const subWords = words.filter(w => w.subtopic_id === 1);
  res.json({
    total: subWords.length, page: 1,
    words: subWords.map(w => ({
      id: w.id, word_en: w.word_en, transcription_en: w.transcription_en,
      translation_ru: w.translation_ru, image_url: w.image_url,
      status: 'learning', next_recall: '2026-04-12',
    })),
  });
});

// ─── ADMIN: TOPICS ───────────────────────────────────────────────────────────

app.get('/api/v1/admin/topics', (req, res) => {
  res.json(topics.map(toAdminTopic));
});

app.post('/api/v1/admin/topics', (req, res) => {
  const { name, description, image_url, sort_order } = req.body;
  if (!name) return res.status(400).json({ code: 'BAD_REQUEST', message: 'name is required' });
  const topic = { id: nextTopicId++, name, description: description || null, image_url: image_url || null, sort_order: sort_order ?? null };
  topics.push(topic);
  res.status(201).json(toAdminTopic(topic));
});

app.put('/api/v1/admin/topics/:topicId', (req, res) => {
  const id = parseInt(req.params.topicId);
  const idx = topics.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ code: 'NOT_FOUND', message: 'Topic not found' });
  const { name, description, image_url, sort_order } = req.body;
  if (!name) return res.status(400).json({ code: 'BAD_REQUEST', message: 'name is required' });
  topics[idx] = { ...topics[idx], name, description: description ?? topics[idx].description, image_url: image_url ?? topics[idx].image_url, sort_order: sort_order ?? topics[idx].sort_order };
  res.json(toAdminTopic(topics[idx]));
});

app.delete('/api/v1/admin/topics/:topicId', (req, res) => {
  const id = parseInt(req.params.topicId);
  const idx = topics.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ code: 'NOT_FOUND', message: 'Topic not found' });
  if (subtopics.some(s => s.topic_id === id))
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Topic still has subtopics' });
  topics.splice(idx, 1);
  res.sendStatus(204);
});

// ─── ADMIN: SUBTOPICS ────────────────────────────────────────────────────────

app.get('/api/v1/admin/subtopics', (req, res) => {
  const topicId = parseInt(req.query.topic_id);
  if (!topicId) return res.status(400).json({ code: 'BAD_REQUEST', message: 'topic_id is required' });
  if (!topics.find(t => t.id === topicId)) return res.status(404).json({ code: 'NOT_FOUND', message: 'Topic not found' });
  res.json(subtopics.filter(s => s.topic_id === topicId).map(toAdminSubtopic));
});

app.post('/api/v1/admin/subtopics', (req, res) => {
  const { topic_id, name, description, image_url, sort_order, disabled_mechanics } = req.body;
  if (!topic_id || !name) return res.status(400).json({ code: 'BAD_REQUEST', message: 'topic_id and name are required' });
  if (!topics.find(t => t.id === topic_id)) return res.status(404).json({ code: 'NOT_FOUND', message: 'Topic not found' });
  const subtopic = { id: nextSubtopicId++, topic_id, name, description: description || null, image_url: image_url || null, sort_order: sort_order ?? null, disabled_mechanics: disabled_mechanics || [], status: 'locked' };
  subtopics.push(subtopic);
  res.status(201).json(toAdminSubtopic(subtopic));
});

app.put('/api/v1/admin/subtopics/:subtopicId', (req, res) => {
  const id = parseInt(req.params.subtopicId);
  const idx = subtopics.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  const { topic_id, name, description, image_url, sort_order, disabled_mechanics } = req.body;
  if (!topic_id || !name) return res.status(400).json({ code: 'BAD_REQUEST', message: 'topic_id and name are required' });
  subtopics[idx] = { ...subtopics[idx], topic_id, name, description: description ?? subtopics[idx].description, image_url: image_url ?? subtopics[idx].image_url, sort_order: sort_order ?? subtopics[idx].sort_order, disabled_mechanics: disabled_mechanics ?? subtopics[idx].disabled_mechanics };
  res.json(toAdminSubtopic(subtopics[idx]));
});

app.delete('/api/v1/admin/subtopics/:subtopicId', (req, res) => {
  const id = parseInt(req.params.subtopicId);
  const idx = subtopics.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  if (words.some(w => w.subtopic_id === id))
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Subtopic still has words' });
  subtopics.splice(idx, 1);
  res.sendStatus(204);
});

// ─── ADMIN: WORDS ─────────────────────────────────────────────────────────────
// Note: /bulk must be registered before /:wordId to avoid route conflict

app.post('/api/v1/admin/words/bulk', (req, res) => {
  const { subtopic_id, words: items } = req.body;
  if (!subtopic_id || !items || items.length === 0)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'subtopic_id and words are required' });
  if (!subtopics.find(s => s.id === subtopic_id))
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  const created = items.map(item => {
    const word = { id: nextWordId++, subtopic_id, word_en: item.word_en, transcription_en: item.transcription_en || null, translation_ru: item.translation_ru, image_url: item.image_url || null, usage_example_en: item.usage_example_en || null, usage_example_en_translation_ru: item.usage_example_en_translation_ru || null, mnemonic_image_url: item.mnemonic_image_url || null, mnemo_text: item.mnemo_text || null };
    words.push(word);
    return word;
  });
  res.status(201).json({ subtopic_id, created: created.length, words: created.map(toAdminWord) });
});

app.get('/api/v1/admin/words', (req, res) => {
  const subtopicId = parseInt(req.query.subtopic_id);
  if (!subtopicId) return res.status(400).json({ code: 'BAD_REQUEST', message: 'subtopic_id is required' });
  if (!subtopics.find(s => s.id === subtopicId)) return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  res.json(words.filter(w => w.subtopic_id === subtopicId).map(toAdminWord));
});

app.post('/api/v1/admin/words', (req, res) => {
  const { subtopic_id, word_en, translation_ru, transcription_en, image_url, usage_example_en, usage_example_en_translation_ru, mnemonic_image_url, mnemo_text } = req.body;
  if (!subtopic_id || !word_en || !translation_ru)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'subtopic_id, word_en and translation_ru are required' });
  if (!subtopics.find(s => s.id === subtopic_id))
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  const word = { id: nextWordId++, subtopic_id, word_en, transcription_en: transcription_en || null, translation_ru, image_url: image_url || null, usage_example_en: usage_example_en || null, usage_example_en_translation_ru: usage_example_en_translation_ru || null, mnemonic_image_url: mnemonic_image_url || null, mnemo_text: mnemo_text || null };
  words.push(word);
  res.status(201).json(toAdminWord(word));
});

app.put('/api/v1/admin/words/:wordId', (req, res) => {
  const id = parseInt(req.params.wordId);
  const idx = words.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ code: 'NOT_FOUND', message: 'Word not found' });
  const { subtopic_id, word_en, translation_ru, transcription_en, image_url, usage_example_en, usage_example_en_translation_ru, mnemonic_image_url, mnemo_text } = req.body;
  if (!subtopic_id || !word_en || !translation_ru)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'subtopic_id, word_en and translation_ru are required' });
  words[idx] = { ...words[idx], subtopic_id, word_en, transcription_en: transcription_en ?? words[idx].transcription_en, translation_ru, image_url: image_url ?? words[idx].image_url, usage_example_en: usage_example_en ?? words[idx].usage_example_en, usage_example_en_translation_ru: usage_example_en_translation_ru ?? words[idx].usage_example_en_translation_ru, mnemonic_image_url: mnemonic_image_url ?? words[idx].mnemonic_image_url, mnemo_text: mnemo_text ?? words[idx].mnemo_text };
  res.json(toAdminWord(words[idx]));
});

app.delete('/api/v1/admin/words/:wordId', (req, res) => {
  const id = parseInt(req.params.wordId);
  const idx = words.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ code: 'NOT_FOUND', message: 'Word not found' });
  words.splice(idx, 1);
  res.sendStatus(204);
});

// ─── ADMIN: USERS ────────────────────────────────────────────────────────────

app.get('/api/v1/admin/users', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const start = (page - 1) * limit;
  res.json({ total: mockUsers.length, page, limit, users: mockUsers.slice(start, start + limit) });
});

// ─── ADMIN: DAILY GAMES ──────────────────────────────────────────────────────

app.get('/api/v1/admin/daily-games', (req, res) => {
  res.json(dailyGames);
});

app.post('/api/v1/admin/daily-games', (req, res) => {
  const { idiom, option_1, option_2, option_3, option_4, correct_option } = req.body;
  if (!idiom || !option_1 || !option_2 || !option_3 || !option_4 || !correct_option)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'idiom, option_1-4 and correct_option are required' });
  if (correct_option < 1 || correct_option > 4)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'correct_option must be between 1 and 4' });
  const game = { id: nextDailyGameId++, idiom, option_1, option_2, option_3, option_4, correct_option, scheduled_date: null };
  dailyGames.push(game);
  res.status(201).json(game);
});

app.put('/api/v1/admin/daily-games/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = dailyGames.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ code: 'NOT_FOUND', message: 'Daily game not found' });
  const { idiom, option_1, option_2, option_3, option_4, correct_option } = req.body;
  if (!idiom || !option_1 || !option_2 || !option_3 || !option_4 || !correct_option)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'idiom, option_1-4 and correct_option are required' });
  if (correct_option < 1 || correct_option > 4)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'correct_option must be between 1 and 4' });
  dailyGames[idx] = { ...dailyGames[idx], idiom, option_1, option_2, option_3, option_4, correct_option };
  res.json(dailyGames[idx]);
});

app.delete('/api/v1/admin/daily-games/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = dailyGames.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ code: 'NOT_FOUND', message: 'Daily game not found' });
  dailyGames.splice(idx, 1);
  res.sendStatus(204);
});

// ─── DAILY GAME (public) ──────────────────────────────────────────────────────

app.get('/api/v1/daily-game', (req, res) => {
  const today = new Date().toLocaleDateString('sv', { timeZone: 'Europe/Paris' });
  let game = dailyGames.find(g => g.scheduled_date === today);
  if (!game) {
    const unassigned = dailyGames.filter(g => !g.scheduled_date);
    if (!unassigned.length) return res.status(404).json({ code: 'NOT_FOUND', message: 'No daily games available' });
    game = unassigned[Math.floor(Math.random() * unassigned.length)];
    game.scheduled_date = today;
  }
  res.json({
    id: game.id,
    idiom: game.idiom,
    options: [game.option_1, game.option_2, game.option_3, game.option_4],
  });
});

app.post('/api/v1/daily-game/answer', (req, res) => {
  const { daily_game_id, selected_option } = req.body;
  if (!daily_game_id || !selected_option)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'daily_game_id and selected_option are required' });
  if (selected_option < 1 || selected_option > 4)
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'selected_option must be between 1 and 4' });
  const game = dailyGames.find(g => g.id === daily_game_id);
  if (!game) return res.status(404).json({ code: 'NOT_FOUND', message: 'Daily game not found' });
  res.json({ is_correct: selected_option === game.correct_option, correct_option: game.correct_option });
});

// ─── AI CHAT ─────────────────────────────────────────────────────────────────

const MOCK_CHAT_REPLIES = [
  "Great sentence! Just a small spelling note: it's 'knife', not 'nife'. But using it in that context is perfect — well done! What else would you find in the kitchen?",
  "Nice try! The word 'plate' fits well here. Could you also use the word for 'ложка' in your next reply?",
  "Excellent use of vocabulary! Your sentence sounds very natural. Now, imagine you're setting the table — what do you need?",
  "Almost perfect! Watch the spelling: it's 'spoon', not 'spun'. The meaning came through clearly though. Keep going!",
];

let mockChatReplyIndex = 0;

app.post('/api/v1/ai/chat', (req, res) => {
  const { subtopicId, history, message } = req.body;
  if (!subtopicId || !message) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'subtopicId and message are required' });
  }
  const subtopic = subtopics.find(s => s.id === subtopicId);
  if (!subtopic) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Subtopic not found' });
  }
  if (history.length === 0) {
    const subtopicWords = words.filter(w => w.subtopic_id === subtopicId).map(w => w.word_en).join(', ');
    return res.json({
      reply: `Great choice! Let's practice words from "${subtopic.name}". Today we'll work with: ${subtopicWords}. Imagine you're in the kitchen preparing dinner — what do you need to set the table?`,
    });
  }
  const reply = MOCK_CHAT_REPLIES[mockChatReplyIndex % MOCK_CHAT_REPLIES.length];
  mockChatReplyIndex++;
  res.json({ reply });
});

// ─── START ───────────────────────────────────────────────────────────────────

const PORT = 4010;
app.listen(PORT, () => console.log(`Mock server running on http://localhost:${PORT}/api/v1`));