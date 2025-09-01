import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Rocket, Users, TrendingUp, Shield, MessageCircle, Star, ArrowRight } from 'lucide-react'
import { startupsAPI, investorsAPI, utilityAPI } from '../services/api'
import StartupCard from '../components/StartupCard'
import InvestorCard from '../components/InvestorCard'

const HomePage = () => {
  const [stats, setStats] = useState({
    startups: 0,
    investors: 0,
    online: 0
  })

  const { data: featuredStartups } = useQuery(
    'featured-startups',
    () => startupsAPI.list({ ordering: '-rating', is_verified: true, limit: 6 }),
    { staleTime: 5 * 60 * 1000 }
  )

  const { data: featuredInvestors } = useQuery(
    'featured-investors',
    () => investorsAPI.list({ ordering: '-rating', is_verified: true, limit: 6 }),
    { staleTime: 5 * 60 * 1000 }
  )

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [startupsRes, investorsRes, onlineRes] = await Promise.all([
          startupsAPI.stats(),
          investorsAPI.stats(),
          utilityAPI.onlineCount()
        ])
        
        setStats({
          startups: startupsRes.data.total_startups,
          investors: investorsRes.data.total_investors,
          online: onlineRes.data.total_online
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Shield,
      title: 'Безопасность',
      description: 'Многоуровневая верификация и модерация всех пользователей'
    },
    {
      icon: MessageCircle,
      title: 'Мессенджер',
      description: 'Встроенная система безопасного общения'
    },
    {
      icon: TrendingUp,
      title: 'Аналитика',
      description: 'Расширенные фильтры и аналитика проектов'
    },
    {
      icon: Users,
      title: 'Сообщество',
      description: 'Крупнейшее сообщество стартапов и инвесторов'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Платформа для поиска<br />стартапов и инвесторов
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Соединяем перспективные проекты с надежными инвесторами для взаимного роста и успеха
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register?type=startup"
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Я стартап
              </Link>
              <Link
                to="/register?type=investor"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-colors"
              >
                Я инвестор
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.startups}+</div>
              <div className="text-gray-600">Стартапов</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.investors}+</div>
              <div className="text-gray-600">Инвесторов</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.online}</div>
              <div className="text-gray-600">Сейчас онлайн</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Почему выбирают нас
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Современная платформа со всеми необходимыми инструментами для успешного сотрудничества
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Startups */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Популярные стартапы</h2>
            <Link to="/startups" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
              Смотреть все <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStartups?.data.results?.slice(0, 3).map(startup => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Investors */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Топ инвесторы</h2>
            <Link to="/investors" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
              Смотреть все <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredInvestors?.data.results?.slice(0, 3).map(investor => (
              <InvestorCard key={investor.id} investor={investor} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Готовы начать?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Присоединяйтесь к тысячам стартапов и инвесторов, которые уже нашли друг друга на нашей платформе
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?type=startup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Зарегистрировать стартап
            </Link>
            <Link
              to="/register?type=investor"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Стать инвестором
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage