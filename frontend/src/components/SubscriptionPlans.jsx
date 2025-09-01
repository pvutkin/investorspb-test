import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { Check, Crown, Star, Zap, Shield } from 'lucide-react'
import { paymentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const SubscriptionPlans = () => {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedPlan, setSelectedPlan] = useState(null)

  const { data: plans, isLoading } = useQuery(
    ['plans', user?.user_type],
    () => paymentsAPI.plans({ user_type: user?.user_type }),
    { enabled: !!user }
  )

  const createPaymentMutation = useMutation(
    (planId) => paymentsAPI.createPayment({
      plan_id: planId,
      payment_method: 'yookassa',
      period: selectedPeriod
    }),
    {
      onSuccess: (data) => {
        window.location.href = data.data.payment_url
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Ошибка при создании платежа')
      }
    }
  )

  const features = {
    messaging: 'Неограниченные сообщения',
    contacts: 'Расширенный доступ к контактам',
    search: 'Расширенный поиск',
    visibility: 'Повышенная видимость',
    support: 'Приоритетная поддержка',
    analytics: 'Расширенная аналитика'
  }

  const getPlanFeatures = (plan) => {
    const planFeatures = []
    if (plan.max_messages === null) planFeatures.push('messaging')
    if (plan.max_connections > 5) planFeatures.push('contacts')
    if (plan.advanced_search) planFeatures.push('search')
    if (plan.can_see_premium_profiles) planFeatures.push('visibility')
    if (plan.priority_support) planFeatures.push('support')
    if (plan.features?.analytics) planFeatures.push('analytics')
    return planFeatures
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Выберите подходящий тариф
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Расширьте возможности вашего аккаунта с нашими премиум-тарифами
        </p>
      </div>

      {/* Period Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
          {['monthly', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-md font-medium text-sm ${
                selectedPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {period === 'monthly' ? 'Ежемесячно' : 'Ежегодно (—20%)'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans?.data?.map((plan) => {
          const planFeatures = getPlanFeatures(plan)
          const isPopular = plan.plan_type === 'pro'
          const price = selectedPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly
          const monthlyPrice = selectedPeriod === 'yearly' ? price / 12 : price

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 ${
                isPopular
                  ? 'border-blue-500 shadow-xl bg-white'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Самый популярный
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    {Math.floor(price)}₽
                  </span>
                  <span className="text-gray-500 ml-2">
                    /{selectedPeriod === 'yearly' ? 'год' : 'месяц'}
                  </span>
                </div>
                {selectedPeriod === 'yearly' && (
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.floor(monthlyPrice)}₽ в месяц
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {Object.entries(features).map(([key, label]) => (
                  <div
                    key={key}
                    className={`flex items-center ${
                      planFeatures.includes(key) ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    <Check
                      className={`w-5 h-5 mr-3 ${
                        planFeatures.includes(key)
                          ? 'text-green-500'
                          : 'text-gray-300'
                      }`}
                    />
                    <span
                      className={
                        planFeatures.includes(key) ? '' : 'line-through'
                      }
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(plan.id)
                  createPaymentMutation.mutate(plan.id)
                }}
                disabled={createPaymentMutation.isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold ${
                  isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {createPaymentMutation.isLoading && selectedPlan === plan.id
                  ? 'Обработка...'
                  : 'Выбрать тариф'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Features Comparison */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Сравнение возможностей
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 font-semibold text-gray-900">Возможность</th>
                {plans?.data?.map(plan => (
                  <th key={plan.id} className="text-center py-4 font-semibold text-gray-900">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(features).map(([key, label]) => (
                <tr key={key}>
                  <td className="py-4 font-medium text-gray-900">{label}</td>
                  {plans?.data?.map(plan => {
                    const planFeatures = getPlanFeatures(plan)
                    return (
                      <td key={plan.id} className="text-center py-4">
                        {planFeatures.includes(key) ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlans