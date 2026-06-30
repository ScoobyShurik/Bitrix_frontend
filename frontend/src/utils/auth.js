/**
 * Утилиты для работы с аутентификацией
 * Хранит токены и данные пользователя в localStorage
 */

const TOKENS_KEY = 'auth_tokens'
const USER_KEY = 'currentUser'

// ==================== ТОКЕНЫ ====================

/**
 * Сохранить access и refresh токены
 */
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem(TOKENS_KEY, JSON.stringify({ accessToken, refreshToken }))
}

/**
 * Получить объект с токенами
 * @returns {{ accessToken: string, refreshToken: string } | null}
 */
export const getTokens = () => {
  const data = localStorage.getItem(TOKENS_KEY)
  if (!data) return null
  
  try {
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

/**
 * Получить только access token
 */
export const getAccessToken = () => getTokens()?.accessToken || null

/**
 * Получить только refresh token
 */
export const getRefreshToken = () => getTokens()?.refreshToken || null

/**
 * Обновить access token (при refresh)
 */
export const updateAccessToken = (newAccessToken) => {
  const tokens = getTokens()
  if (tokens) {
    tokens.accessToken = newAccessToken
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  }
}

// ==================== ПОЛЬЗОВАТЕЛЬ ====================

/**
 * Сохранить данные пользователя
 */
export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Получить данные пользователя
 */
export const getUser = () => {
  const data = localStorage.getItem(USER_KEY)
  if (!data) return null
  
  try {
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

// ==================== ОЧИСТКА ====================

/**
 * Полная очистка данных аутентификации (при выходе)
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKENS_KEY)
  localStorage.removeItem(USER_KEY)
}