import psycopg2
import os
from contextlib import contextmanager

# Настройки подключения к PostgreSQL
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'startup_platform'),
    'user': os.getenv('DB_USER', 'startup_user'),
    'password': os.getenv('DB_PASSWORD', 'ZcBm6378QeTuO'),
    'port': os.getenv('DB_PORT', '5432')
}

@contextmanager
def get_db_connection():
    """Контекстный менеджер для подключения к базе данных"""
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def init_db():
    """Инициализация базы данных"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Создание таблиц для хранения данных пользователей бота
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bot_users (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT UNIQUE NOT NULL,
                username VARCHAR(255),
                user_type VARCHAR(20),
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Создание таблицы для хранения стартапов
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bot_startups (
                id SERIAL PRIMARY KEY,
                platform_id INTEGER,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                stage VARCHAR(20),
                industry VARCHAR(100),
                funding_requested DECIMAL(12,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()

def save_user(telegram_id: int, username: str, user_type: str):
    """Сохранение пользователя бота"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO bot_users (telegram_id, username, user_type)
                VALUES (%s, %s, %s)
                ON CONFLICT (telegram_id) 
                DO UPDATE SET username = EXCLUDED.username, user_type = EXCLUDED.user_type
            ''', (telegram_id, username, user_type))
            conn.commit()
        except Exception as e:
            print(f"Ошибка сохранения пользователя: {e}")

def get_user(telegram_id: int):
    """Получение пользователя по Telegram ID"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, telegram_id, username, user_type, is_verified, created_at
            FROM bot_users 
            WHERE telegram_id = %s
        ''', (telegram_id,))
        result = cursor.fetchone()
        if result:
            return {
                'id': result[0],
                'telegram_id': result[1],
                'username': result[2],
                'user_type': result[3],
                'is_verified': result[4],
                'created_at': result[5]
            }
        return None

def save_startup(platform_id: int, name: str, description: str, stage: str, 
                industry: str, funding_requested: float = None):
    """Сохранение стартапа"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO bot_startups (platform_id, name, description, stage, industry, funding_requested)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (platform_id, name, description, stage, industry, funding_requested))
            conn.commit()
        except Exception as e:
            print(f"Ошибка сохранения стартапа: {e}")