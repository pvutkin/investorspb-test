import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  MapPin, Users, Star, TrendingUp, Shield, Globe, 
  Calendar, DollarSign, MessageCircle, Heart, Share,
  ArrowLeft, Edit, Flag
} from 'lucide-react'
import { startupsAPI, messagingAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import ReviewModal from '../components/ReviewModal'
import ReportModal from '../components/ReportModal'

const StartupDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [activeTab, setActiveTab] = useState('about')

  const { data: startup, isLoading, error } = useQuery(
    ['startup', id],
    () => startupsAPI.detail(id),
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
    createConversationMutation.mutate(startup.data.user.id)
  }

  const getStageLabel = (stage) => {
    const stages = {
      'idea': 'Идея',
      'prototype': 'Прототип',
      'mvp': 'MVP',
      'early_traction': 'Ранние продажи',
      'scaling': 'Масштабирование',
      'growth': 'Рост',
      'mature': 'Зрелая компания'
    }
    return stages[stage] || stage
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
          <div className="text-red-600 text-lg mb-2">Ошибка загрузки стартапа</div>
          <Link to="/startups" className="text-blue-600 hover:text-blue-700">
            Вернуться к списку
          </Link>
        </div>
      </div>
    )
  }

  const startupData = startup.data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/startups" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{startupData.name}</h1>
            {startupData.is_verified && (
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
                {startupData.images?.[0] && (
                  <img
                    src={startupData.images[0].image}
                    alt={startupData.name}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{startupData.name}</h2>
                      <p className="text-gray-600">{startupData.short_description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user?.id === startupData.user.id && (
                        <Link
                          to={`/startups/${startupData.id}/edit`}
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
                      <div className="text-sm text-gray-600 mb-1">Стадия</div>
                      <div className="font-semibold text-gray-900">{getStageLabel(startupData.stage)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Ищет</div>
                      <div className="font-semibold text-gray-900">{formatAmount(startupData.funding_amount)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Рейтинг</div>
                      <div className="font-semibold text-gray-900 flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        {startupData.rating?.toFixed(1) || '0.0'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Отзывы</div>
                      <div className="font-semibold text-gray-900">{startupData.reviews_count || 0}</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleContact}
                      disabled={!user || user.id === startupData.user.id}
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
                  {['about', 'team', 'reviews', 'gallery'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'about' && 'О проекте'}
                      {tab === 'team' && 'Команда'}
                      {tab === 'reviews' && 'Отзывы'}
                      {tab === 'gallery' && 'Галерея'}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание</h3>
                      <p className="text-gray-700 leading-relaxed">{startupData.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Детали</h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{startupData.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span>Стадия: {getStageLabel(startupData.stage)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Основан в {startupData.founded_year} году</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>Команда: {startupData.team_size} человек</span>
                          </div>
                          {startupData.website && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Globe className="w-4 h-4 mr-2" />
                              <a
                                href={startupData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                {startupData.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Финансы</h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>Ищет инвестиций: {formatAmount(startupData.funding_amount)}</span>
                          </div>
                          {startupData.raised_amount > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Привлечено: {formatAmount(startupData.raised_amount)}</span>
                            </div>
                          )}
                          {startupData.financial_info && (
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold">Финансовая информация:</span>
                              <p className="mt-1">{startupData.financial_info}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {startupData.business_model && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Бизнес-модель</h4>
                        <p className="text-gray-700 leading-relaxed">{startupData.business_model}</p>
                      </div>
                    )}

                    {startupData.competitive_advantage && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Конкурентные преимущества</h4>
                        <p className="text-gray-700 leading-relaxed">{startupData.competitive_advantage}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Команда проекта</h3>
                    {startupData.team_members?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {startupData.team_members.map((member) => (
                          <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={member.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.role}</p>
                              {member.is_founder && (
                                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Основатель
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Информация о команде не указана</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Отзывы</h3>
                      {user && user.user_type === 'investor' && user.id !== startupData.user.id && (
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Оставить отзыв
                        </button>
                      )}
                    </div>

                    {startupData.reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {startupData.reviews.map((review) => (
                          <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3 mb-3">
                              {review.investor_avatar ? (
                                <img
                                  src={review.investor_avatar}
                                  alt={review.investor_name}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Users className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.investor_name}</h4>
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

                {activeTab === 'gallery' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Галерея</h3>
                    {startupData.images?.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {startupData.images.map((image) => (
                          <img
                            key={image.id}
                            src={image.image}
                            alt={image.caption || startupData.name}
                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Изображения не добавлены</p>
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
                    startupData.is_verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {startupData.is_verified ? 'Верифицирован' : 'На проверке'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Просмотры:</span>
                  <span className="font-medium">{startupData.views_count}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Создан:</span>
                  <span className="font-medium">
                    {new Date(startupData.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Обновлен:</span>
                  <span className="font-medium">
                    {new Date(startupData.updated_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Быстрые действия</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleContact}
                    disabled={!user || user.id === startupData.user.id}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Написать сообщение
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                    Добавить в избранное
                  </button>
                  {user?.user_type === 'investor' && user.id !== startupData.user.id && (
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
        type="startup"
        targetId={startupData.id}
        targetName={startupData.name}
      />

      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={startupData.user.id}
        reportedUserName={startupData.name}
      />
    </div>
  )
}

export default StartupDetailPage