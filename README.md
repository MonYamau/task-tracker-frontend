# Taskspace — Task Tracker frontend

ТЕКУЩИЙ СЕРВИС БЫЛ ПОЛНОСТЬЮ РЕАЛИЗОВАН С ПОМОЩЬЮ ИИ ИНСТРУМЕНТА!

Адаптивный клиент Task Tracker на React + TypeScript + Vite. Интерфейс тёмный; HTTP-запросы к backend выполняются через
Axios.

## Запуск без установки Node.js в Windows (Docker — рекомендуемый вариант)

Понадобится только установленный и запущенный **Docker Desktop** с поддержкой `docker compose`. Node.js и npm будут
работать внутри временного Docker build-контейнера; отдельно устанавливать их на компьютер не требуется.

1. Распакуйте архив и откройте PowerShell в каталоге `task-tracker-frontend`.
2. При необходимости создайте `.env` из шаблона:

   ```powershell
   Copy-Item .env.example .env
   ```

   В `.env` укажите корневой адрес backend:

   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

   Это адрес, по которому **браузер на компьютере** может обратиться к backend. Не используйте здесь имя Docker-сервиса
   вроде `backend`: браузер не находится в Docker-сети.

3. Соберите образ и запустите контейнер:

   ```powershell
   docker compose up --build -d
   ```

4. Откройте **http://localhost:5173**.

Полезные команды:

```powershell
# Посмотреть состояние контейнера
docker compose ps

# Посмотреть логи Nginx
docker compose logs -f frontend

# Остановить и удалить контейнер (образ останется)
docker compose down

# Пересобрать после изменения исходников или .env
docker compose up --build -d
```

Если команда `docker compose` не распознаётся, проверьте Docker Desktop и команду `docker compose version`. В Docker
Desktop должен быть запущен Docker Engine.

### Как устроен Docker-запуск

- На этапе сборки Docker запускает `node:22-alpine`, устанавливает npm-зависимости и выполняет `npm run build`.
- На этапе запуска используется только `nginx:alpine`, который раздаёт готовые файлы из `dist/`. Node.js внутри
  работающего frontend-контейнера не нужен.
- Порт компьютера `5173` перенаправляется на порт `80` контейнера.
- Nginx настроен на отдачу `index.html` для маршрутов React Router (`/login`, `/register`, `/tasks/...`).

**Важно:** `VITE_API_BASE_URL` встраивается в JS-файлы при сборке. После изменения `.env` обязательно пересоберите образ
командой `docker compose up --build -d`.

## Локальный запуск с Node.js (необязательно)

Если Node.js уже установлен, можно работать без Docker:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

По умолчанию Vite откроется по адресу http://localhost:5173.

## Используемые endpoints

| Действие             |   HTTP | Путь          |
|----------------------|-------:|---------------|
| Регистрация          |   POST | `/user`       |
| Вход                 |   POST | `/auth/login` |
| Текущий пользователь |    GET | `/user`       |
| Список задач         |    GET | `/tasks`      |
| Создать задачу       |   POST | `/task`       |
| Получить задачу      |    GET | `/task/{id}`  |
| Изменить задачу      |  PATCH | `/task/{id}`  |
| Удалить задачу       | DELETE | `/task/{id}`  |

Фронтенд ожидает, что регистрация и вход возвращают JWT в response header `Authorization`, а не в теле ответа. Клиент
читает заголовок, добавляет префикс `Bearer ` при необходимости и сохраняет токен в `localStorage`.

Для `/user` и `/task(s)` типы запросов/ответов описаны в `src/api/types.ts`. В DTO задачи используются поля `id`,
`title`, `text`, `plannedCompletionAt`, `isReady`; `completedAt` поддерживается как необязательное поле, если backend
его возвращает.

## Обязательная настройка CORS на backend

Поскольку браузер открывает frontend с origin `http://localhost:5173`, а backend работает, например, на
`http://localhost:8080`, backend должен разрешить этот origin и чтение JWT из response header.

Нужно разрешить методы `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`; request headers `Authorization`, `Content-Type`,
`Accept`; и обязательно expose response header `Authorization`.

Если frontend открывается с другого адреса (например, с IP компьютера на смартфоне), добавьте этот точный origin в
`allowedOrigins` backend. Origin включает схему, хост и порт, например `http://192.168.1.20:5173`.

## Поведение и ограничения

- Защищённые страницы доступны после входа; при `401` токен очищается, пользователь перенаправляется на `/login`.
- Выход — клиентское удаление токена, так как отдельный logout endpoint в предоставленном API отсутствует.
- Дата и время отправляются как ISO-8601 `OffsetDateTime`; поле даты отображает локальное время устройства.
- Отметка выполнения отправляет `PATCH /task/{id}` с текущими полями задачи и изменённым `isReady`.
- JWT в `localStorage` удобен для учебного проекта, но доступен JavaScript; при XSS это повышает риск кражи токена.
