import React from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { moderationAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const ReportModal = ({ show, onClose, reportedUserId, reportedUserName }) => {
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const createReportMutation = useMutation(
    (data) => moderationAPI.createReport(data),
    {
      onSuccess: () => {
        toast.success('Жалоба отправлена на рассмотрение')
        reset()
        onClose()
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Ошибка при отправке жалобы')
      }
    }
  )

  const onSubmit = (data) => {
    if (!user) {
      toast.error('Необходимо авторизоваться')
      return
    }

    createReportMutation.mutate({
      reported_user: reportedUserId,
      report_type: data.report_type,
      description: data.description,
      evidence: data.evidence
    })
  }

  const reportTypes = [
    { value: 'spam', label: 'Спам' },
    { value: 'fraud', label: 'Мошенничество' },
    { value: 'inappropriate', label: 'Неуместный контент' },
    { value: 'fake', label: 'Фейковый профиль' },
    { value: 'other', label: 'Другое' }
  ]

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Пожаловаться</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Пользователь: <span className="font-semibold">{reportedUserName}</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Report Type */}
            <div>
              <label htmlFor="report_type" className="block text-sm font-medium text-gray-700 mb-2">
                Причина жалобы *
              </label>
              <select
                {...register('report_type', { required: 'Выберите причину жалобы' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите причину</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.report_type && (
                <p className="mt-1 text-sm text-red-600">{errors.report_type.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                {...register('description', {
                  required: 'Опишите причину жалобы',
                  minLength: {
                    value: 10,
                    message: 'Описание должно содержать минимум 10 символов'
                  },
                  maxLength: {
                    value: 1000,
                    message: 'Описание не должно превышать 1000 символов'
                  }
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Подробно опишите причину вашей жалобы..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Evidence */}
            <div>
              <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-2">
                Доказательства (если есть)
              </label>
              <input
                type="file"
                {...register('evidence')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createReportMutation.isLoading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createReportMutation.isLoading ? 'Отправка...' : 'Отправить жалобу'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReportModal