import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { 
  Bell, Shield, CreditCard, Globe, 
  MessageSquare, Mail, Trash2, Save
} from 'lucide-react'
import { authAPI, paymentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const SettingsPage = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('notifications')
  const [isLoading, setIsLoading] = useState(false)

  const { register: registerNotif, handleSubmit: handleNotifSubmit } = useForm({
    defaultValues: {
      email_notifications: true,
      message_notifications: true,
      project_updates: true,
      marketing_emails: false
    }
  })

  const { register: registerPrivacy, handleSubmit: handlePrivacySubmit } = useForm({
    defaultValues: {
      profile_visibility: 'public',
      show_online_status: true,
      allow_messages: 'everyone',
      search_visibility: true
    }
  })

  const updateSettingsMutation = useMutation(
    (data) => authAPI.updateProfile({ profile: data }),
    {
      onSuccess: () => {
        toast.success('Настройки сохранены')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Ошибка сохранения настроек')
      }
    }
  )

  const cancelSubscriptionMutation = useMutation(
    () => paymentsAPI.cancelSubscription(),
    {
      onSuccess: () => {
        toast.success('Подписка отменена')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Ошибка отмены подписки')
      }
    }
  )

  const onSubmitNotifications = (data) => {
    updateSettingsMutation.mutate(data)
  }

  const onSubmitPrivacy = (data) => {
    updateSettingsMutation.mutate(data)
  }

  const handleCancelSubscription = () => {
    if (window.confirm('Вы уверены, что хотите отменить подписку?')) {
      cancelSubscriptionMutation.mutate()
    }
  }

  const tabs = [
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'privacy', label: 'Приватность', icon: Shield },
    { id: 'billing', label: 'Оплата', icon: CreditCard },
    { id: 'language', label: 'Язык', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки</h1>
          <p className="text-gray-600">Управление настройками вашего аккаунта</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Notifications */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleNotifSubmit(onSubmitNotifications)}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки уведомлений</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">Email уведомления</h4>
                            <p className="text-sm text-gray-600">Важные обновления и уведомления</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerNotif('email_notifications')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">Уведомления о сообщениях</h4>
                            <p className="text-sm text-gray-600">Новые сообщения в чате</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerNotif('message_notifications')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">Обновления проектов</h4>
                            <p className="text-sm text-gray-600">Уведомления о ваших проектах</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerNotif('project_updates')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">Маркетинговые рассылки</h4>
                            <p className="text-sm text-gray-600">Новости и предложения</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerNotif('marketing_emails')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateSettingsMutation.isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Сохранить настройки</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <form onSubmit={handlePrivacySubmit(onSubmitPrivacy)}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки приватности</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Видимость профиля</h4>
                        <p className="text-sm text-gray-600 mb-3">Кто может видеть ваш профиль</p>
                        <select
                          {...registerPrivacy('profile_visibility')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="public">Публичный (все пользователи)</option>
                          <option value="registered">Только зарегистрированные пользователи</option>
                          <option value="none">Только я</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Показывать статус онлайн</h4>
                          <p className="text-sm text-gray-600">Другие пользователи видят, когда вы онлайн</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerPrivacy('show_online_status')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Кто может писать вам</h4>
                        <p className="text-sm text-gray-600 mb-3">Кто может отправлять вам сообщения</p>
                        <select
                          {...registerPrivacy('allow_messages')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="everyone">Все пользователи</option>
                          <option value="verified">Только верифицированные пользователи</option>
                          <option value="none">Никто</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Видимость в поиске</h4>
                          <p className="text-sm text-gray-600">Показывать ваш профиль в результатах поиска</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerPrivacy('search_visibility')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateSettingsMutation.isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Сохранить настройки</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Управление подпиской</h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-blue-900">Текущая подписка</h4>
                        <p className="text-blue-600">Premium план</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">₽2,990/месяц</p>
                        <p className="text-blue-600 text-sm">Следующее списание: 15.01.2024</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-900">∞</div>
                        <div className="text-blue-600">Сообщений</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-900">50</div>
                        <div className="text-blue-600">Контактов в день</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-900">✓</div>
                        <div className="text-blue-600">Премиум-поддержка</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Обновить способ оплаты
                    </button>
                    
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelSubscriptionMutation.isLoading}
                      className="w-full px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Отменить подписку</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">История платежей</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Дата</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Сумма</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Статус</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">15.12.2023</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₽2,990</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Успешно
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-700">
                              Скачать чек
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">15.11.2023</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₽2,990</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Успешно
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-700">
                              Скачать чек
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Language */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Языковые настройки</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Язык интерфейса</h4>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Часовой пояс</h4>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Europe/Moscow">Москва (GMT+3)</option>
                        <option value="Europe/London">Лондон (GMT+0)</option>
                        <option value="Europe/Berlin">Берлин (GMT+1)</option>
                        <option value="America/New_York">Нью-Йорк (GMT-5)</option>
                      </select>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Формат даты</h4>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="ru-RU">ДД.ММ.ГГГГ (русский)</option>
                        <option value="en-US">ММ/ДД/ГГГГ (американский)</option>
                        <option value="en-GB">ДД/ММ/ГГГГ (европейский)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Сохранить настройки
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage