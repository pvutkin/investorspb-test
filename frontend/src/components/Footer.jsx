import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-xl font-bold">StartupPlatform</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Платформа для соединения стартапов и инвесторов. Создаем возможности для роста и развития бизнеса.
            </p>
            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@startupplatform.ru</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+7 (800) 123-45-67</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li><Link to="/startups" className="text-gray-400 hover:text-white transition-colors">Стартапы</Link></li>
              <li><Link to="/investors" className="text-gray-400 hover:text-white transition-colors">Инвесторы</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">О нас</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Контакты</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Правовая информация</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Политика конфиденциальности</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Условия использования</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Политика cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 StartupPlatform. Все права защищены.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Сделано с</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span className="text-gray-400 text-sm">для стартапов</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer