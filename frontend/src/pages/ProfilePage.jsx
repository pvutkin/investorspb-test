import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  User, Mail, Phone, MapPin, Globe, 
  Edit, Save, X, Camera, Shield,
  Briefcase, TrendingUp, DollarSign
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, startupsAPI, investorsAPI } from '../services/api'
import { toast } from 'react-toastify'

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [activeTab, setActiveTab] = useState('profile')

  const { data: userStartups } = useQuery(
    'user-startups',
    startupsAPI.userStartups,
    { enabled: user?.user_type === 'startup' }
  )

  const { data: userInvestors } = useQuery(
    'user-investors',
    investorsAPI.userInvestors,
    { enabled: user?.user_type === 'investor' }
  )

  const updateProfileMutation = useMutation(
    (data) => authAPI.updateProfile(data),
    {
      onSuccess: (data) => {
        updateProfile(data.data)
        setIsEditing(false)
        toast.success('Профиль успешно обновлен')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Ошибка при обновлении профиля')
      }
    }
  )

  const handleEdit = () => {
    setEditData({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      profile: {
        location: user.profile?.location,
        website: user.profile?.website,
        bio: user.profile?.bio
      }
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handleSave = () => {
    updateProfileMutation.mutate(editData)
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfileInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }))
  }

  const getVerificationStatus = () => {
    if (user.is_verified) {
      return { text: 'Верифицирован', color: 'green' }
    }
    if (user.verification_level === 'advanced') {
      return { text: 'На расширенной проверке', color: 'blue' }
    }
    return { text: 'Требуется верификация', color: 'yellow' }
  }

  const verificationStatus = getVerificationStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Мой профиль</h1>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                <span>Редактировать</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  <span>Отмена</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateProfileMutation.isLoading ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                      placeholder="Имя"
                    />
                  ) : (
                    user.first_name || user.username
                  )}
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${verificationStatus.color}-100 text-${verificationStatus.color}-800`}>
                  {verificationStatus.text}
                </span>
              </div>

              <p className="text-gray-600 mb-4">@{user.username}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{user.email}</span>
                  {user.email_verified && (
                    <Shield className="w-4 h-4 ml-2 text-green-500" />
                  )}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 flex-1"
                      placeholder="Телефон"
                    />
                  ) : (
                    <span>{user.phone || 'Не указан'}</span>
                  )}
                  {user.phone_verified && user.phone && (
                    <Shield className="w-4 h-4 ml-2 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['profile', 'projects', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'profile' && 'Профиль'}
                  {tab === 'projects' && user?.user_type === 'startup' && 'Мои стартапы'}
                  {tab === 'projects' && user?.user_type === 'investor' && 'Мои профили'}
                  {tab === 'settings' && 'Настройки'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о себе</h3>
                  {isEditing ? (
                    <textarea
                      value={editData.profile?.bio || ''}
                      onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Расскажите о себе..."
                    />
                  ) : (
                    <p className="text-gray-700">
                      {user.profile?.bio || 'Информация не добавлена'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Контактная информация</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.profile?.location || ''}
                            onChange={(e) => handleProfileInputChange('location', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 flex-1"
                            placeholder="Местоположение"
                          />
                        ) : (
                          <span>{user.profile?.location || 'Не указано'}</span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2" />
                        {isEditing ? (
                          <input
                            type="url"
                            value={editData.profile?.website || ''}
                            onChange={(e) => handleProfileInputChange('website', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 flex-1"
                            placeholder="Вебсайт"
                          />
                        ) : (
                          user.profile?.website ? (
                            <a
                              href={user.profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {user.profile.website}
                            </a>
                          ) : (
                            <span>Не указан</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Статистика</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}</div>
                      <div>Последнее обновление: {new Date(user.updated_at).toLocaleDateString('ru-RU')}</div>
                      <div>Тип пользователя: {user.user_type === 'startup' ? 'Стартап' : 'Инвестор'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {user.user_type === 'startup' ? 'Мои стартапы' : 'Мои инвестиционные профили'}
                </h3>

                {user.user_type === 'startup' ? (
                  userStartups?.data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>У вас пока нет созданных стартапов</p>
                      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Создать стартап
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userStartups.data.map(startup => (
                        <div key={startup.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{startup.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{startup.short_description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{startup.stage}</span>
                            <span className="font-semibold text-blue-600">
                              Ищет: {new Intl.NumberFormat('ru-RU').format(startup.funding_amount)} ₽
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  userInvestors?.data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>У вас пока нет инвестиционных профилей</p>
                      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Создать профиль инвестора
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userInvestors.data.map(investor => (
                        <div key={investor.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{investor.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{investor.short_description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{investor.investor_type}</span>
                            <span className="font-semibold text-green-600">
                              Чек: {new Intl.NumberFormat('ru-RU').format(investor.check_size_min)}-{new Intl.NumberFormat('ru-RU').format(investor.check_size_max)} ₽
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Настройки аккаунта</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Безопасность</h4>
                    <p className="text-sm text-gray-600 mb-3">Управление настройками безопасности вашего аккаунта</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Сменить пароль
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Уведомления</h4>
                    <p className="text-sm text-gray-600 mb-3">Настройте получение уведомлений</p>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Настроить уведомления
                    </button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-semibold text-red-900 mb-2">Опасная зона</h4>
                    <p className="text-sm text-red-600 mb-3">Эти действия нельзя отменить</p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Удалить аккаунт
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage