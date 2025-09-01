import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Send, Paperclip, Smile, Search, MoreVertical, 
  ArrowLeft, Image, File, User, Clock
} from 'lucide-react'
import { messagingAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { toast } from 'react-toastify'

const ChatPage = () => {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const { data: conversations } = useQuery(
    'conversations',
    messagingAPI.conversations,
    { enabled: !!user }
  )

  const { data: messages, isLoading: messagesLoading } = useQuery(
    ['messages', conversationId],
    () => messagingAPI.messages(conversationId),
    { enabled: !!conversationId }
  )

  const sendMessageMutation = useMutation(
    (data) => messagingAPI.sendMessage(conversationId, data),
    {
      onSuccess: () => {
        setMessage('')
        queryClient.invalidateQueries(['messages', conversationId])
        queryClient.invalidateQueries('conversations')
      }
    }
  )

  const { connect, disconnect, emit, on, off } = useWebSocket(
    import.meta.env.VITE_WS_URL,
    {
      auth: {
        token: localStorage.getItem('token')
      }
    }
  )

  useEffect(() => {
    connect()

    on('chat_message', (data) => {
      queryClient.invalidateQueries(['messages', data.conversation_id])
      queryClient.invalidateQueries('conversations')
    })

    return () => {
      off('chat_message')
      disconnect()
    }
  }, [connect, disconnect, on, off, queryClient])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (conversationId && conversations?.data) {
      const conversation = conversations.data.find(c => c.id === parseInt(conversationId))
      setSelectedConversation(conversation)
    }
  }, [conversationId, conversations])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    sendMessageMutation.mutate({
      content: message.trim(),
      message_type: 'text'
    })

    emit('send_message', {
      conversation_id: conversationId,
      content: message.trim(),
      message_type: 'text'
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('message_type', 'file')

    sendMessageMutation.mutate(formData)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOtherUser = (conversation) => {
    return conversation.other_user
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Необходимо авторизоваться</div>
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Сообщения</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations?.data?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Нет активных диалогов
            </div>
          ) : (
            conversations?.data?.map(conversation => (
              <Link
                key={conversation.id}
                to={`/chat/${conversation.id}`}
                className={`flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  conversationId === conversation.id.toString() ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {getOtherUser(conversation)?.avatar ? (
                    <img
                      src={getOtherUser(conversation).avatar}
                      alt={getOtherUser(conversation).username}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {getOtherUser(conversation)?.first_name || getOtherUser(conversation)?.username}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conversation.last_message_time && formatTime(conversation.last_message_time)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message}
                  </p>
                </div>
                {conversation.unread_count > 0 && (
                  <div className="ml-2 flex-shrink-0">
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </span>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {conversationId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Link to="/chat" className="lg:hidden mr-3 text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                {selectedConversation && (
                  <div className="flex items-center">
                    {getOtherUser(selectedConversation)?.avatar ? (
                      <img
                        src={getOtherUser(selectedConversation).avatar}
                        alt={getOtherUser(selectedConversation).username}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherUser(selectedConversation)?.first_name || getOtherUser(selectedConversation)?.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getOtherUser(selectedConversation)?.user_type === 'startup' ? 'Стартап' : 'Инвестор'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages?.data.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Нет сообщений. Начните диалог!
                </div>
              ) : (
                messages?.data.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === user.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      {msg.message_type === 'file' ? (
                        <div className="flex items-center">
                          <File className="w-4 h-4 mr-2" />
                          <span>Файл</span>
                        </div>
                      ) : (
                        <p className="break-words">{msg.content}</p>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender === user.id ? 'text-blue-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <div className="flex-1 bg-gray-100 rounded-lg">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    rows={1}
                    className="w-full bg-transparent px-4 py-2 resize-none focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isLoading}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Выберите диалог</h3>
              <p>Начните общение с другими пользователями</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage