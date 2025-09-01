import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import StartupListPage from './pages/StartupListPage'
import InvestorListPage from './pages/InvestorListPage'
import StartupDetailPage from './pages/StartupDetailPage'
import InvestorDetailPage from './pages/InvestorDetailPage'
import ProfilePage from './pages/ProfilePage'
import ChatPage from './pages/ChatPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import './styles/global.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/startups" element={<StartupListPage />} />
              <Route path="/startups/:id" element={<StartupDetailPage />} />
              <Route path="/investors" element={<InvestorListPage />} />
              <Route path="/investors/:id" element={<InvestorDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              
              {/* Protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/chat/:conversationId" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App