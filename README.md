# SocialN Backend

Бэкенд для моего пет-проекта — соцсети.

## что тут есть

* регистрация / логин (jwt)
* чаты между пользователями
* сообщения/чаты на websocket
* infinite scroll / пагинация во всех вкладках где необходимо
* аватарки (upload + ресайз через sharp)
* музыка:

    * загрузка треков
    * парсинг метаданных (artist/title)
    * обложки
    * лайки
* профиль пользователя (пока на начальной стадии реализации)

## стек

node.js, express, ws, sqlite (better-sqlite3), multer, sharp

---

## как запустить

```bash
git clone https://github.com/your-username/socialn-backend.git
cd socialn-backend
npm install
```

создать `.env`:

```bash
cp .env.example .env
```

запуск:

```bash
npm run dev
```

---

## api (основное)

auth:

* POST /auth/register
* POST /auth/login

users:

* GET /users

chats:

* GET /chats
* POST /chats

messages:

* GET /messages?chatId=...&page=1&limit=40
* websocket для новых сообщений

music:

* GET /music/all
* GET /music/my
* POST /music
* DELETE /music/:id
* POST /music/:id/like

---

## заметки

* сообщения грузятся с пагинацией в infinite scroll
* список сообщений на фронте виртуализирован
* картинки ужимаются через sharp
* часть логики на ws, часть на rest

---

## frontend

https://github.com/yunglaver/socialn-frontend
