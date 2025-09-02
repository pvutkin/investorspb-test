import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from database import save_user, get_user, save_startup
from models import User, Startup
import requests
import json

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /start"""
    user = update.effective_user
    save_user(user.id, user.username, 'unknown')
    
    welcome_text = """
🤖 Привет! Я бот платформы "Стартапы и Инвесторы"

Я помогу вам находить стартапы и инвесторов, а также управлять вашим профилем.

Доступные команды:
/start - Начать работу
/help - Помощь
/profile - Ваш профиль
/search - Поиск стартапов
/register - Регистрация на платформе
    """
    
    await update.message.reply_text(welcome_text)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /help"""
    help_text = """
📚 Помощь по боту:

/start - Начать работу с ботом
/help - Показать эту справку
/profile - Показать ваш профиль
/search - Поиск стартапов и инвесторов
/register - Зарегистрироваться на платформе
/chat - Начать чат с другими пользователями
    """
    
    await update.message.reply_text(help_text)

async def profile_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /profile"""
    user = update.effective_user
    db_user = get_user(user.id)
    
    if db_user:
        profile_text = f"""
👤 Ваш профиль:
ID: {db_user['id']}
Telegram ID: {db_user['telegram_id']}
Имя: {db_user['username'] or 'Не указано'}
Тип пользователя: {db_user['user_type'] or 'Не указано'}
Дата регистрации: {db_user['created_at'] or 'Неизвестно'}
        """
    else:
        profile_text = "👤 Профиль не найден. Пожалуйста, зарегистрируйтесь."
    
    await update.message.reply_text(profile_text)

async def search_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /search"""
    keyboard = [
        [InlineKeyboardButton("🔍 Поиск стартапов", callback_data='search_startups')],
        [InlineKeyboardButton("💼 Поиск инвесторов", callback_data='search_investors')],
        [InlineKeyboardButton("🔙 Назад", callback_data='back_to_menu')]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text("Выберите тип поиска:", reply_markup=reply_markup)

async def register_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /register"""
    user = update.effective_user
    
    keyboard = [
        [InlineKeyboardButton("🏢 Регистрация как стартап", callback_data='register_startup')],
        [InlineKeyboardButton("💼 Регистрация как инвестор", callback_data='register_investor')],
        [InlineKeyboardButton("🔙 Назад", callback_data='back_to_menu')]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text("Выберите тип регистрации:", reply_markup=reply_markup)

async def chat_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /chat"""
    await update.message.reply_text("💬 Для чата с другими пользователями используйте кнопки в меню или перейдите на платформу.")

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик нажатий кнопок"""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    if data == 'search_startups':
        await query.edit_message_text("🔍 Поиск стартапов...")
        # Здесь можно реализовать поиск стартапов через API
        await query.edit_message_text("🔍 Поиск стартапов (пример):\n\n"
                                     "1. TechStart - Приложение для управления задачами\n"
                                     "2. GreenEnergy - Энергетика на возобновляемых источниках\n"
                                     "3. HealthCare Plus - Медицинская платформа")
        
    elif data == 'search_investors':
        await query.edit_message_text("💼 Поиск инвесторов...")
        await query.edit_message_text("💼 Поиск инвесторов (пример):\n\n"
                                     "1. Александр Петров - Индивидуальный инвестор\n"
                                     "2. Venture Fund - Фонд рисковых инвестиций\n"
                                     "3. Tech Investors - Корпоративный инвестор")
        
    elif data == 'register_startup':
        await query.edit_message_text("🏢 Регистрация стартапа:\n"
                                     "Пожалуйста, перейдите на платформу и зарегистрируйтесь там.\n"
                                     "Ссылка: http://investorspb.ru/register")
        
    elif data == 'register_investor':
        await query.edit_message_text("💼 Регистрация инвестора:\n"
                                     "Пожалуйста, перейдите на платформу и зарегистрируйтесь там.\n"
                                     "Ссылка: http://investorspb.ru/register")
        
    elif data == 'back_to_menu':
        await query.edit_message_text("Главное меню:")
        await start_command(update, context)

async def echo_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик текстовых сообщений"""
    user_message = update.message.text.lower()
    
    if 'привет' in user_message or 'здравствуй' in user_message:
        await update.message.reply_text("👋 Привет! Рад вас видеть!")
    elif 'помощь' in user_message or 'help' in user_message:
        await help_command(update, context)
    else:
        await update.message.reply_text("🤖 Я понимаю команды /start, /help, /profile, /search, /register\n"
                                       "Попробуйте одну из них!")

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик ошибок"""
    logger.error(f"Update {update} caused error {context.error}")