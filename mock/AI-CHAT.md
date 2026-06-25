# AI Chat — Mock

Mock-реализация AI-чата для разработки фронтенда без реального бэкенда и без вызовов OpenRouter.

Данные подтопика тянутся из in-memory хранилища мока, ответы возвращаются мгновенно (без задержки 5 сек как у реального AI).

---

## Эндпоинт

```
POST /ai/chat
Header: Authorization: Bearer <token>
```

### Тело запроса

```json
{
  "subtopicId": 1,
  "history": [
    { "role": "assistant", "content": "Welcome! Let's practice..." },
    { "role": "user",      "content": "I need a plate and a fork" }
  ],
  "message": "Also a cup"
}
```

| Поле | Тип | Обязательное | Описание |
|------|-----|:---:|---------|
| `subtopicId` | integer | ✅ | ID подтемы из мока (1 или 2) |
| `history` | array | ✅ | История диалога. Пустой массив `[]` для первого сообщения |
| `message` | string | ✅ | Текущее сообщение пользователя |

### Ответ

```json
{
  "reply": "Great sentence! ..."
}
```

---

## Поведение мока

### Первое сообщение (`history: []`)

Мок динамически генерирует вступительную реплику на основе реальных слов из подтемы:

```
POST /ai/chat
{ "subtopicId": 1, "history": [], "message": "Hello!" }

→ {
    "reply": "Great choice! Let's practice words from \"Кухонная утварь\".
              Today we'll work with: plate, cup, fork, knife, spoon, bowl, glass, pot, pan.
              Imagine you're in the kitchen preparing dinner — what do you need to set the table?"
  }
```

### Последующие сообщения

Мок циклически возвращает 4 захардкоженных ответа, имитирующих поведение реального AI-тьютора:

| # | Ответ |
|---|-------|
| 1 | Указывает на ошибку в правописании + хвалит за употребление слова в контексте |
| 2 | Просит использовать конкретное слово из списка (nudge) |
| 3 | Хвалит за естественное использование слов |
| 4 | Указывает на опечатку + продолжает диалог |

---

## Примеры

### Начало сессии

```
POST /ai/chat
{
  "subtopicId": 1,
  "history": [],
  "message": "Let's start!"
}

→ {
    "reply": "Great choice! Let's practice words from \"Кухонная утварь\".
              Today we'll work with: plate, cup, fork, knife, spoon, bowl, glass, pot, pan.
              Imagine you're in the kitchen preparing dinner — what do you need to set the table?"
  }
```

### Продолжение диалога

```
POST /ai/chat
{
  "subtopicId": 1,
  "history": [
    { "role": "assistant", "content": "Great choice! Let's practice..." },
    { "role": "user", "content": "I need a plate and a frok" }
  ],
  "message": "Also a cup and a spoon"
}

→ {
    "reply": "Great sentence! Just a small spelling note: it's 'fork', not 'frok'.
              But using it in that context is perfect — well done!
              What else would you find in the kitchen?"
  }
```

### Подтема 2

```
POST /ai/chat
{ "subtopicId": 2, "history": [], "message": "Start" }

→ {
    "reply": "Great choice! Let's practice words from \"Продукты питания\".
              Today we'll work with: apple, bread, milk, egg, cheese, butter, salt, sugar, rice.
              Imagine you're in the kitchen preparing dinner — what do you need to set the table?"
  }
```

---

## Коды ошибок

| Статус | Код | Когда |
|--------|-----|-------|
| 400 | `BAD_REQUEST` | Отсутствует `subtopicId` или `message` |
| 404 | `NOT_FOUND` | Подтема с таким `subtopicId` не найдена |

---

## Отличия от реального бэкенда

| | Мок | Реальный бэкенд |
|--|-----|-----------------|
| Скорость | Мгновенно | ~5 сек (запрос к OpenRouter) |
| Ответы | Захардкожены, циклические | Генерирует AI на основе контекста |
| Recast | Только имитация в тексте | Настоящая коррекция через промпт |
| Завершение сессии | Не поддерживается | Триггерится словами "stop", "finish" и т.д. |
| Зависимости | Нет | Требует `OPENROUTER_API_KEY` |