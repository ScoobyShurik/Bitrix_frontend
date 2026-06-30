/**
 * Базовый HTTP-клиент для работы с Django API
 * 
 * Функции:
 * - Добавляет Authorization header с access token
 * - Автоматически обновляет access token при 401
 * - При ошибке refresh — очищает auth и редиректит на /login
 * - Обрабатывает ошибки ответа
 */

import { getAccessToken, getRefreshToken, updateAccessToken, clearAuth } from '../utils/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const apiClient = {
  /**
   * Выполнить запрос с авторизацией
   */
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`
    
    let accessToken = getAccessToken()
    
    const headers = {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers
      })

      // Если токен истёк (401), пробуем обновить
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshAccessToken()
        
        if (refreshed) {
          // Повторяем запрос с новым токеном
          headers['Authorization'] = `Bearer ${getAccessToken()}`
          response = await fetch(url, { ...options, headers })
        } else {
          // Refresh token тоже истёк — выходим
          clearAuth()
          window.location.href = '/login'
          throw new Error('Сессия истекла')
        }
      }

      // Обработка ошибок ответа
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || errorData.message || `Ошибка ${response.status}`
        throw new Error(errorMessage)
      }

      // Для 204 No Content
      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (error) {
      // Сетевые ошибки
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Нет соединения с сервером')
      }
      throw error
    }
  },

  /**
   * Обновить access token через refresh token
   */
  async refreshAccessToken() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      })

      if (!response.ok) return false

      const data = await response.json()
      updateAccessToken(data.access)
      return true
    } catch (e) {
      console.error('Refresh token error:', e)
      return false
    }
  },

  // Удобные методы
  get: (endpoint, options = {}) => apiClient.request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiClient.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) => apiClient.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) => apiClient.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => apiClient.request(endpoint, { ...options, method: 'DELETE' }),
}