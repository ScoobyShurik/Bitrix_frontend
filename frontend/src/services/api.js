/**
 * API сервис для работы с Django backend
 * 
 * Все методы возвращают Promise с данными ответа
 * При ошибке выбрасывается Error с сообщением от сервера
 */

import { apiClient } from './apiClient'
import { saveTokens, saveUser, clearAuth, getRefreshToken } from '../utils/auth'

export const api = {
  // ==================== АУТЕНТИФИКАЦИЯ ====================
  
  /**
   * Вход в систему
   * POST /api/token/
   */
  login: async (login, password) => {
    const data = await apiClient.post('/token/', { username: login, password })
    
    saveTokens(data.access, data.refresh)
    
    const user = await api.getMe()
    saveUser(user)
    
    return user
  },

  /**
   * Обновление access token
   * POST /api/token/refresh/
   */
  refresh: async (refreshToken) => {
    const data = await apiClient.post('/token/refresh/', { refresh: refreshToken })
    return { accessToken: data.access }
  },

  /**
   * Выход из системы
   * POST /api/logout/
   */
  logout: async () => {
    try {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await apiClient.post('/logout/', { refresh: refreshToken })
      }
    } catch (e) {
      // Игнорируем ошибки при выходе
    }
    clearAuth()
  },

  /**
   * Получить текущего пользователя
   * GET /api/me/
   */
  getMe: async () => {
    return await apiClient.get('/me/')
  },

  // ==================== ПРОФИЛЬ ====================
  
  updateProfile: async (userData) => {
    const user = await apiClient.patch('/me/', userData)
    saveUser(user)
    return { success: true, user }
  },

  changePassword: async (oldPassword, newPassword) => {
    await apiClient.post('/me/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    })
    return { success: true }
  },

  // ==================== ГЛАВНАЯ СТРАНИЦА ====================
  
  getPlannedTime: async () => {
    return await apiClient.get('/workday/planned/')
  },

  updatePlannedTime: async (plannedData) => {
    const result = await apiClient.put('/workday/planned/', plannedData)
    return { success: true, planned: result }
  },

  // ==================== ОТДЕЛ ====================
  
  getDepartment: async () => {
    return await apiClient.get('/department/')
  },

  startEmployeeDay: async (employeeId) => {
    return await apiClient.post(`/department/employees/${employeeId}/start/`)
  },

  stopEmployeeDay: async (employeeId) => {
    return await apiClient.post(`/department/employees/${employeeId}/stop/`)
  },

  getEmployeeDetails: async (employeeId) => {
    return await apiClient.get(`/department/employees/${employeeId}/details/`)
  },

  // ==================== ОТСУТСТВИЯ ====================
  
  getAbsenceStatistics: async () => {
    return await apiClient.get('/absences/statistics/')
  },

  getAbsencesByDepartment: async () => {
    return await apiClient.get('/absences/')
  },

  addAbsence: async (absenceData) => {
    return await apiClient.post('/absences/', absenceData)
  },

  updateAbsence: async (absenceId, absenceData) => {
    return await apiClient.put(`/absences/${absenceId}/`, absenceData)
  },

  deleteAbsence: async (absenceId) => {
    await apiClient.delete(`/absences/${absenceId}/`)
    return { success: true, absenceId }
  },

  getAllEmployees: async () => {
    return await apiClient.get('/employees/')
  },

  // ==================== ГРАФИК ====================
  
  getSchedule: async () => {
    return await apiClient.get('/schedule/')
  },

  createStartTask: async (employeeId) => {
    return await apiClient.post(`/schedule/${employeeId}/tasks/start/create/`)
  },

  completeStartTask: async (employeeId) => {
    return await apiClient.post(`/schedule/${employeeId}/tasks/start/complete/`)
  },

  cancelStartTask: async (employeeId) => {
    return await apiClient.post(`/schedule/${employeeId}/tasks/start/cancel/`)
  },

  createEndTask: async (employeeId) => {
    return await apiClient.post(`/schedule/${employeeId}/tasks/end/create/`)
  },

  completeEndTask: async (employeeId) => {
    return await apiClient.post(`/schedule/${employeeId}/tasks/end/complete/`)
  },

  cancelEndTask: async (employeeId) => {
    return await apiClient.post(`/schedule/${employeeId}/tasks/end/cancel/`)
  }
}