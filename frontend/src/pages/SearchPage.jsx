import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Search, Filter, Grid, List, X } from 'lucide-react'
import { startupsAPI, investorsAPI } from '../services/api'
import StartupCard from '../components/StartupCard'
import InvestorCard from '../components/InvestorCard'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    type: 'all',
    stage: '',
    industry: '',
    location: '',
    min_amount: '',
    max_amount: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const { data: startups, isLoading: startupsLoading } = useQuery(
    ['search-startups', searchQuery, filters],
    () => startupsAPI.list({
      search: searchQuery,
      stage: filters.stage,
      industry: filters.industry,
      location: filters.location,
      min_funding: filters.min_amount,
      max_funding: filters.max_amount
    }),
    { enabled: filters.type !== 'investors' }
  )

  const { data: investors, isLoading: investorsLoading } = useQuery(
    ['search-investors', searchQuery, filters],
    () => investorsAPI.list({
      search: searchQuery,
      location: filters.location,
      min_check: filters.min_amount,
      max_check: filters.max_amount
    }),
    { enabled: filters.type !== 'startups' }
  )

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery })
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: 'all',
      stage: '',
      industry: '',
      location: '',
      min_amount: '',
      max_amount: ''
    })
  }

  const isLoading = startupsLoading || investorsLoading
  const hasStartups = startups?.data.results.length > 0
  const hasInvestors = investors?.data.results.length > 0
  const hasResults = hasStartups || hasInvestors

  const stages = [
    { value: 'idea', label: 'Идея' },
    { value: 'prototype', label: 'Прототип' },
    { value: 'mvp', label: 'MVP' },
    { value: 'early_traction', label: 'Ранние продажи' },
    { value: 'scaling', label: 'Масштабирование' }
  ]

  const industries = [
    { value: '1', label: 'Технологии' },
    { value: '2', label: 'Здравоохранение' },
    { value: '3', label: 'Финансы' },
    { value: '4', label: 'Образование' },
    { value: '5', label: 'E-commerce' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Поиск</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск стартапов, инвесторов, отраслей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Filters and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Сбросить
                </button>
              </div>

              <div className="space-y-6">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Все</option>
                    <option value="startups">Стартапы</option>
                    <option value="investors">Инвесторы</option>
                  </select>
                </div>

                {/* Stage Filter */}
                {filters.type !== 'investors' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Стадия</label>
                    <select
                      value={filters.stage}
                      onChange={(e) => handleFilterChange('stage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Все стадии</option>
                      {stages.map(stage => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Industry Filter */}
                {filters.type !== 'investors' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Отрасль</label>
                    <select
                      value={filters.industry}
                      onChange={(e) => handleFilterChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Все отрасли</option>
                      {industries.map(industry => (
                        <option key={industry.value} value={industry.value}>
                          {industry.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Локация</label>
                  <input
                    type="text"
                    placeholder="Город, страна"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Amount Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {filters.type === 'investors' ? 'Размер чека' : 'Сумма инвестиций'}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="От"
                      value={filters.min_amount}
                      onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="До"
                      value={filters.max_amount}
                      onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Результаты поиска</h2>
                  <p className="text-sm text-gray-600">
                    {isLoading ? 'Загрузка...' : `Найдено ${startups?.data.count + investors?.data.count} результатов`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && !hasResults && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                <p className="text-gray-600 mb-4">
                  Попробуйте изменить параметры поиска или использовать другие ключевые слова
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}

            {/* Results */}
            {!isLoading && hasResults && (
              <div className="space-y-8">
                {/* Startups Results */}
                {hasStartups && filters.type !== 'investors' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Стартапы ({startups.data.count})</h3>
                    <div className={`grid ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1'
                    } gap-6`}>
                      {startups.data.results.map(startup => (
                        <StartupCard key={startup.id} startup={startup} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Investors Results */}
                {hasInvestors && filters.type !== 'startups' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Инвесторы ({investors.data.count})</h3>
                    <div className={`grid ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1'
                    } gap-6`}>
                      {investors.data.results.map(investor => (
                        <InvestorCard key={investor.id} investor={investor} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {hasResults && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    Назад
                  </button>
                  <span className="text-sm text-gray-600">
                    Страница 1 из 10
                  </span>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    Вперед
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

export default SearchPage