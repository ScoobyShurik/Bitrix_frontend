import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import HomePage from './pages/HomePage'
import DepartmentPage from './pages/DepartmentPage'
import VacationsPage from './pages/VacationsPage'
import SchedulePage from './pages/SchedulePage'
import ForbiddenPage from './pages/ForbiddenPage'
import NotFoundPage from './pages/NotFoundPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { getTokens, clearAuth } from './utils/auth'
import { api } from './services/api'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const tokens = getTokens()

      if (!tokens) {
        setLoading(false)
        return
      }

      try {
        // Проверяем сессию через реальный API
        const user = await api.getMe()
        setCurrentUser(user)
      } catch (error) {
        console.error('Auth check failed:', error)
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser)
  }

  const handleLogin = (user) => {
    setCurrentUser(user)
  }
  
  const handleLogout = async () => {
    try {
      await api.logout()
    } catch (e) {
      console.error('Logout error:', e)
    }
    setCurrentUser(null)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
      
      <Route element={<LayoutWrapper user={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />}>
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={currentUser}>
              <HomePage user={currentUser} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/" />
            ) : (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <LoginForm onLogin={handleLogin} />
              </div>
            )
          } 
        />

        <Route 
          path="/department" 
          element={
            <ProtectedRoute user={currentUser} allowedRoles={['manager', 'staff']}>
              <DepartmentPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/vacations" 
          element={
            <ProtectedRoute user={currentUser}>
              <VacationsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute user={currentUser} allowedRoles={['manager', 'staff']}>
              <SchedulePage />
            </ProtectedRoute>
          } 
        />

        <Route path="/reports" element={<div className="alert alert-info">Страница "Отчёты" (в разработке)</div>} />
        <Route path="/profile/settings" element={<div className="alert alert-info">Настройки профиля (в разработке)</div>} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute user={currentUser} allowedRoles={['staff']}>
              <div className="alert alert-info">Админка (в разработке)</div>
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  )
}

function LayoutWrapper({ user, onLogout, onUpdateUser }) {
  return (
    <Layout user={user} onLogout={onLogout} onUpdateUser={onUpdateUser}>
      <Outlet />
    </Layout>
  )
}

export default App