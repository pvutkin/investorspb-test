import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters
from handlers import start_command, help_command, profile_command, search_command, register_command, chat_command, button_handler, echo_message, error_handler
from database import init_db

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

def main():
    """Основная функция запуска бота"""
    
    # Инициализация базы данных
    init_db()
    
    # Создание приложения бота
    app = Application.builder().token('6175580135:AAGPW-Pg_kp_5GiTU5YJ-fe4SYJWV6J7Zbo').build()
    
    # Регистрация обработчиков команд
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("profile", profile_command))
    app.add_handler(CommandHandler("search", search_command))
    app.add_handler(CommandHandler("register", register_command))
    app.add_handler(CommandHandler("chat", chat_command))
    
    # Регистрация обработчика кнопок
    app.add_handler(CallbackQueryHandler(button_handler))
    
    # Регистрация обработчика текстовых сообщений
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo_message))
    
    # Регистрация обработчика ошибок
    app.add_error_handler(error_handler)
    
    # Запуск бота
    logger.info("Бот запускается...")
    app.run_polling()

if __name__ == '__main__':
    main()