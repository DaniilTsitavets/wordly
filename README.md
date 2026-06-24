# Wordly

## Описание

Wordly — приложение для изучения иностранных языков с помощью звуковых мнемоник. Система сочетает персонализированное обучение, игровые механики и адаптивную сложность, помогая пользователям быстрее усваивать лексику и удерживать её в памяти, делая процесс обучения более увлекательным и эффективным.

## Команда

- Polina Trybialustava — Team Lead + Frontend + UX/UI
- Evgeniya Yankovich — Backend
- Daniil Tsitavets — Backend + DevOps
- Fiodar Viachorka — Frontend

## Технологии

- Backend: Java 21 + Spring Boot
- Frontend: React + TypeScript (Vite)
- БД: PostgreSQL 17
- Хостинг: AWS (ECS Fargate + CloudFront + RDS)
- CI/CD: GitHub Actions

## Локальный запуск

### Требования

- Docker + Docker Compose
- Java 21 (для запуска бэкенда без Docker)
- Node.js 20+ (для запуска фронтенда без Docker)

Опционально: [mise](https://mise.jdx.dev/) — упрощает запуск через короткие команды (`brew install mise`).

---

### Вариант 1 — полный стек через Docker Compose

```bash
# Поднять БД + бэкенд
docker compose up -d

# Или через mise
mise run up
```

| Сервис | URL |
|---|---|
| Backend API | http://localhost:8080/api/v1 |
| PostgreSQL | localhost:**5433** |

Миграции Flyway накатываются автоматически при старте бэкенда.

---

### Вариант 2 — фронтенд с моком бэкенда

Если бэкенд не нужен — используйте mock-сервер (Express, порт 4010):

```bash
# Запустить mock-сервер
docker compose --profile mock up --build -d mock
# или
mise run mock

# Запустить фронтенд
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Фронтенд по умолчанию смотрит на `http://localhost:4010` в режиме разработки — mock отдаёт все эндпоинты с тестовыми данными.

---

### Вариант 3 — бэкенд без Docker

```bash
# Поднять только БД
docker compose up -d db

# Запустить бэкенд (dev-профиль — Security отключён, 401 не возвращается)
cd backend
./mvnw spring-boot:run
```

Переменные окружения с дефолтами (менять не нужно для локального запуска):

| Переменная | Дефолт |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/wordly` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `yourpassword` |
| `JWT_SECRET` | `dev-secret-change-in-production-min-32-chars` |
| `OPENROUTER_API_KEY` | — обязательно для AI-чата |

---

### Полезные команды (mise)

```bash
mise run logs:backend      # логи бэкенда
mise run rebuild:backend   # пересобрать и перезапустить бэкенд
mise run down              # остановить все контейнеры
mise run down:volumes      # остановить + удалить данные БД
mise run health            # GET http://localhost:8080/health
```

---

### Тесты

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm test              # один прогон
cd frontend && npm run test:watch    # watch-режим
cd frontend && npm run test:coverage # с покрытием
```
