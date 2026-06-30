import { Navigate } from 'react-router-dom'

function ProtectedRoute({ user, allowedRoles = [], children }) {
  // 1. Не авторизован → редирект на /login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 2. Нет нужной роли → редирект на /forbidden
  if (allowedRoles.length > 0) {
    const hasAccess = checkUserRole(user, allowedRoles)
    if (!hasAccess) {
      return <Navigate to="/forbidden" replace />
    }
  }

  // 3. Доступ разрешён
  return children
}

function checkUserRole(user, roles) {
  for (const role of roles) {
    if (role === 'staff' && user.is_staff) return true
    if (role === 'manager' && user.post?.is_manager) return true
  }
  return false
}

export default ProtectedRoute