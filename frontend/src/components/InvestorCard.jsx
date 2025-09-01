import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Star, TrendingUp, Shield, DollarSign } from 'lucide-react'

const InvestorCard = ({ investor }) => {
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
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount}`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <Link to={`/investors/${investor.id}`} className="hover:text-blue-600">
                {investor.name}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">{investor.short_description}</p>
          </div>
          {investor.is_verified && (
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span>{getTypeLabel(investor.investor_type)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{investor.location}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>Чек: {formatAmount(investor.check_size_min)} - {formatAmount(investor.check_size_max)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
              <span className="font-semibold">{investor.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-500 ml-1">({investor.reviews_count || 0})</span>
            </div>
            <div className="text-sm font-semibold text-green-600">
              {investor.total_investments || 0} инвестиций
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(investor.created_at).toLocaleDateString('ru-RU')}
            </span>
            <span className="text-xs text-gray-500">
              {investor.views_count} просмотров
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestorCard