# Startup Platform MVP

## Описание
Минимальная версия платформы для поиска стартапов и инвесторов с базовыми функциями.

## Функционал
- Регистрация и авторизация пользователей
- Создание профилей стартапов и инвесторов
- Поиск и фильтрация
- Внутренний мессенджер
- Модерация и безопасность
- Подписки и оплаты

## Установка
1. Создайте виртуальное окружение
2. Установите зависимости: `pip install -r requirements.txt`
3. Настройте базу данных PostgreSQL
4. Выполните миграции: `python manage.py migrate`
5. Запустите сервер: `python manage.py runserver`

## API Endpoints
- `/api/users/register/` - Регистрация
- `/api/users/login/` - Вход
- `/api/startups/` - Стартапы
- `/api/investors/` - Инвесторы
- `/api/messaging/messages/` - Сообщения
- `/api/moderation/complaints/` - Жалобы
- `/api/payments/subscriptions/` - Подписки

## Структура проекта
- `users/` - Пользователи
- `startups/` - Стартапы
- `investors/` - Инвесторы
- `messaging/` - Чат
- `moderation/` - Модерация
- `payments/` - Оплаты