import { api } from './api';
import { getAccessToken, getRefreshToken, updateAccessToken, clearAuth } from '../utils/auth';

// Базовая функция для запросов с токеном
export const authFetch = async (url, options = {}) => {
  let accessToken = getAccessToken();
  
  // Добавляем токен в заголовки
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    ...options.headers
  };

  try {
    let response = await fetch(url, { ...options, headers });

    // Если токен истёк (401), пробуем обновить
    if (response.status === 401) {
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          const { accessToken: newAccessToken } = await api.refresh(refreshToken);
          updateAccessToken(newAccessToken);
          
          // Повторяем запрос с новым токеном
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(url, { ...options, headers });
        } catch (e) {
          // Refresh token тоже истёк — выходим
          clearAuth();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};