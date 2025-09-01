import React, { useState } from 'react'
import { X, Star } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { startupsAPI, investorsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const ReviewModal = ({ show, onClose, type, targetId, targetName }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const createReviewMutation = useMutation(
    (data) => {
      if (type === 'startup') {
        return startupsAPI.createReview(targetId, data)
      } else {
        return investorsAPI.createReview(targetId, data)
      }
    },
    {
      onSuccess: () => {
        toast.success('Отзыв успешно добавлен!')
        queryClient.invalidateQueries([type, targetId])
        reset()
        setRating(0)
        onClose()
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Ошибка при добавлении отзыва')
      }
    }
  )

  const onSubmit = (data) => {
    if (rating === 0) {
      toast.error('Пожалуйста, поставьте оценку')
      return
    }

    createReviewMutation.mutate({
      rating: rating,
      comment: data.comment
    })
  }

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Оставить отзыв
          </h2>
          <p className="text-gray-600 mb-6">
            {type === 'startup' ? 'О стартапе' : 'Об инвесторе'}: {targetName}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Оценка *
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий
              </label>
              <textarea
                {...register('comment', {
                  maxLength: {
                    value: 1000,
                    message: 'Комментарий не должен превышать 1000 символов'
                  }
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Поделитесь вашим опытом взаимодействия..."
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createReviewMutation.isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createReviewMutation.isLoading ? 'Отправка...' : 'Оставить отзыв'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal