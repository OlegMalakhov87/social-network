# SocialNet

Социальная сеть с профилями, записями, музыкой, видео, новостями, друзьями и диалогами в реальном времени.

Клиент — React 18 (Feature-Sliced Design).  
Сервер — Node.js, Express 5, Sequelize и PostgreSQL.

Клиент: [http://localhost:3000](http://localhost:3000)  
API и WebSocket: [http://localhost:5000](http://localhost:5000)

## Возможности

- **Вход и сессия.** JWT с ротацией, сессия обновления в httpOnly cookie, повторное использование маркера отслеживается, Axios сам обновляет доступ, вкладки синхронизируются.
- **Диалоги.** Сообщения по HTTP и уведомления по WebSocket. Соединение авторизуется JWT и проверяется по серверной сессии.
- **Медиа.** Загрузка в два этапа: временное хранение, затем публикация. Незакреплённые файлы чистит фоновая задача.
- **Новости.** Сбор RSS, разбор через Gemini с проверкой схемы Zod, публикация от имени бота. Повторы отсекаются.
- **Музыка и видео.** Загрузка, обложки и превью, личные библиотеки и избранное.
- **Приватность.** Записи, видео и новости видны владельцу, всем или только друзьям автора.
- **Погода.** Город и прогноз кэшируются в Redis.
- **Тема.** Светлая, тёмная или системная.

## Стек

| Слой | Технологии |
| --- | --- |
| Клиент | React 18, Redux Toolkit, React Router 6, Axios, Zod, Framer Motion, CSS Modules |
| Сервер | Node.js, Express 5, Sequelize 6, PostgreSQL 16, Redis 7, WebSocket (`ws`), JWT, Multer, fluent-ffmpeg, sharp |
| Инфраструктура | Docker Compose, `node:test`, Create React App |

Для превью видео нужен **FFmpeg**. Без него сервер запускается, но генерация кадров не работает.

## Структура

```text
fullstack-app/
├── client/                 # React-приложение
│   └── src/
│       ├── app/            # точка входа, хранилище, маршруты, WebSocket
│       ├── entities/       # сущности: auth, post, dialog, user, …
│       ├── features/       # сценарии: вход, загрузка файлов, настройки, …
│       ├── pages/          # страницы
│       ├── widgets/        # крупные блоки интерфейса
│       └── shared/         # общие UI, запросы, хуки, утилиты
├── server/
│   ├── src/                # маршруты, контроллеры, службы, промежуточные обработчики
│   ├── db/                 # модели, миграции, наполнители
│   ├── jobs/               # очистка и сбор новостей
│   ├── config/             # настройки медиа, Redis, новостей
│   └── tests/
├── docker-compose.yml      # PostgreSQL и Redis
└── .env.example            # переменные для Docker
```

Страницы после входа: `/profile`, `/messages`, `/friends`, `/news`, `/music`, `/videos`, `/settings`.

Основные маршруты API:

```text
/api/auth
/api/profile
/api/messages
/api/posts
/api/friends
/api/music
/api/usermusiclibrary
/api/videos
/api/uservideolibrary
/api/news
/api/likes
/api/comments
/api/widgets
```

## Требования

- Node.js 20+
- Yarn
- Docker и Docker Compose
- FFmpeg (для превью видео)

## Запуск

Два терминала: сервер и клиент. PostgreSQL и Redis поднимаются через Docker.

### 1. Инфраструктура

В корне репозитория:

```bash
cp .env.example .env
```

Заполните `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` и `REDIS_PASSWORD`. Затем:

```bash
docker compose up -d
```

PostgreSQL слушает порт `5432`, Redis — `6379`.

### 2. Сервер

```bash
cd server
yarn install
cp .env.example .env
```

В `server/.env` задайте как минимум:

- `NODE_ENV=development`
- `PORT=5000`
- `CLIENT_URL=http://localhost:3000`
- `JWT_SECRET` и `JWT_EXPIRES_IN`
- те же данные PostgreSQL и Redis, что в корневом `.env`
- `DB_URL` в формате `postgres://USER:PASS@localhost:5432/DB_NAME`

`GEMINI_API_KEY` нужен только для автоматических новостей. Без ключа остальное приложение работает.

Создайте базу, примените миграции и наполнители:

```bash
yarn dev:db
yarn dev
```

Сервер слушает `http://localhost:5000`.

### 3. Клиент

```bash
cd client
yarn install
yarn start
```

Адреса API уже заданы в `client/.env.development`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

Откройте [http://localhost:3000](http://localhost:3000).

### Тестовые учётки

После `yarn dev:db` пароль у демо-пользователей: `654321`.

| Почта | Имя |
| --- | --- |
| `alex92@example.com` | Алексей Иванов |
| `maria@example.com` | Мария Петрова |
| `dmitry@example.com` | Дмитрий Сидоров |

## Скрипты

**Сервер** (`server/`)

| Команда | Назначение |
| --- | --- |
| `yarn dev` | Запуск с nodemon |
| `yarn start` | Обычный запуск |
| `yarn dev:db` | Пересоздать базу разработки, миграции и наполнители |
| `yarn test:db` | Пересоздать тестовую базу `socialnet_test` |
| `yarn test` | Все серверные тесты |
| `yarn test:watch` | Тесты в режиме наблюдения |

**Клиент** (`client/`)

| Команда | Назначение |
| --- | --- |
| `yarn start` | Режим разработки, порт 3000 |
| `yarn test` | Тесты React |
| `yarn build` | Сборка для публикации |

Тестовая база сервера должна называться `socialnet_test`. Интеграционные тесты в другой базе не запускаются.

На клиенте покрыты обновление JWT в Axios, гонки запросов, слайс и действия авторизации, синхронизация вкладок и WebSocket.

## Фоновые задачи

- Очистка временных медиа, сиротских файлов, удалённых сообщений, истекших сессий и старых новостей — ежедневно.
- Сбор RSS и публикация новостей — каждый час, если задан `GEMINI_API_KEY`.

## Известные ограничения

- При ротации JWT WebSocket закрывается и открывается заново (около 15 минут). Непрочитанные сообщения подгружаются при следующем открытии диалога.
- Новости старше 30 дней архивируются и остаются в поиске. Их файлы фоновая очистка не удаляет.
- Защита cron от параллельного запуска работает в одном процессе. Несколько экземпляров сервера требуют блокировки через Redis.
