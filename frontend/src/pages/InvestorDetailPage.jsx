import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { 
  MapPin, Star, Shield, Globe, Briefcase, DollarSign, 
  MessageCircle, Heart, Share, ArrowLeft, Edit, Flag,
  TrendingUp, Calendar
} from 'lucide-react'
import { investorsAPI, messagingAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import ReviewModal from '../components/ReviewModal'
import ReportModal from '../components/ReportModal'

const InvestorDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [activeTab, setActiveTab] = useState('about')

  const { data: investor, isLoading, error } = useQuery(
    ['investor', id],
    () => investorsAPI.detail(id),
    { enabled: !!id }
  )

  const createConversationMutation = useMutation(
    (participantId) => messagingAPI.createConversation({ participant_id: participantId }),
    {
      onSuccess: (data) => {
        window.location.href = `/chat/${data.data.id}`
      }
    }
  )

  const handleContact = () => {
    if (!user) {
      // Redirect to login
      return
    }
    createConversationMutation.mutate(investor.data.user.id)
  }

  const getTypeLabel = (type) => {
    const types = {
      'angel': 'Бизнес-ангел',
      'vc': 'Венчурный фонд',
      'private': 'Частный инвестор',
      'corporate': 'Корпоративный инвестор',
      'syndicate': 'Синдикат',
      'family_office': 'Семейный офис'
    }
    return types[type] || type
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Ошибка загрузки инвестора</div>
          <Link to="/investors" className="text-blue-600 hover:text-blue-700">
            Вернуться к списку
          </Link>
        </div>
      </div>
    )
  }

  const investorData = investor.data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/investors" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{investorData.name}</h1>
            {investorData.is_verified && (
              <Shield className="w-5 h-5 text-green-500" title="Верифицирован" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {investorData.user?.avatar ? (
                  <img
                    src={investorData.user.avatar}
                    alt={investorData.name}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-12 h-12 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{investorData.name}</h2>
                      <p className="text-gray-600">{investorData.short_description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user?.id === investorData.user.id && (
                        <Link
                          to={`/investors/${investorData.id}/edit`}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Share className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setShowReportModal(true)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Flag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Тип</div>
                      <div className="font-semibold text-gray-900">{getTypeLabel(investorData.investor_type)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Чек</div>
                      <div className="font-semibold text-gray-900">
                        {formatAmount(investorData.check_size_min)} - {formatAmount(investorData.check_size_max)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Рейтинг</div>
                      <div className="font-semibold text-gray-900 flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        {investorData.rating?.toFixed(1) || '0.0'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Отзывы</div>
                      <div className="font-semibold text-gray-900">{investorData.reviews_count || 0}</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleContact}
                      disabled={!user || user.id === investorData.user.id}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Написать сообщение
                    </button>
                    <button className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {['about', 'portfolio', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'about' && 'О инвесторе'}
                      {tab === 'portfolio' && 'Портфель'}
                      {tab === 'reviews' && 'Отзывы'}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание</h3>
                      <p className="text-gray-700 leading-relaxed">{investorData.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Детали</h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{investorData.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span>Тип: {getTypeLabel(investorData.investor_type)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>Размер чека: {formatAmount(investorData.check_size_min)} - {formatAmount(investorData.check_size_max)}</span>
                          </div>
                          {investorData.website && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Globe className="w-4 h-4 mr-2" />
                              <a
                                href={investorData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                {investorData.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Инвестиции</h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 mr-2" />
                            <span>Всего инвестиций: {investorData.total_investments}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>Общая сумма: {formatAmount(investorData.total_amount_invested)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {investorData.experience && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Опыт</h4>
                        <p className="text-gray-700 leading-relaxed">{investorData.experience}</p>
                      </div>
                    )}

                    {investorData.industries?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Предпочтительные отрасли</h4>
                        <div className="flex flex-wrap gap-2">
                          {investorData.industries.map((industry) => (
                            <span
                              key={industry.id}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {industry.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {investorData.stages?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Предпочтительные стадии</h4>
                        <div className="flex flex-wrap gap-2">
                          {investorData.stages.map((stage) => (
                            <span
                              key={stage}
                              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              {stage}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Инвестиционный портфель</h3>
                    {investorData.portfolio_items?.length > 0 ? (
                      <div className="space-y-4">
                        {investorData.portfolio_items.map((item) => (
                          <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">{item.startup_name}</h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {item.industry?.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Сумма: </span>
                                <span className="font-semibold">{formatAmount(item.investment_amount)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Дата: </span>
                                <span className="font-semibold">
                                  {new Date(item.investment_date).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-gray-700 text-sm mt-3">{item.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Информация о портфеле не указана</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Отзывы</h3>
                      {user && user.user_type === 'startup' && user.id !== investorData.user.id && (
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Оставить отзыв
                        </button>
                      )}
                    </div>

                    {investorData.reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {investorData.reviews.map((review) => (
                          <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3 mb-3">
                              {review.startup_avatar ? (
                                <img
                                  src={review.startup_avatar}
                                  alt={review.startup_name}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Briefcase className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.startup_name}</h4>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(review.rating)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700">{review.comment}</p>
                            )}
                            <div className="text-sm text-gray-500 mt-2">
                              {new Date(review.created_at).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Пока нет отзывов</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Контактная информация</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Статус:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    investorData.is_verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {investorData.is_verified ? 'Верифицирован' : 'На проверке'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Просмотры:</span>
                  <span className="font-medium">{investorData.views_count}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Создан:</span>
                  <span className="font-medium">
                    {new Date(investorData.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Обновлен:</span>
                  <span className="font-medium">
                    {new Date(investorData.updated_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Быстрые действия</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleContact}
                    disabled={!user || user.id === investorData.user.id}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Написать сообщение
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                    Добавить в избранное
                  </button>
                  {user?.user_type === 'startup' && user.id !== investorData.user.id && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                    >
                      Оставить отзыв
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        type="investor"
        targetId={investorData.id}
        targetName={investorData.name}
      />

      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={investorData.user.id}
        reportedUserName={investorData.name}
      />
    </div>
  )
}

export default InvestorDetailPage