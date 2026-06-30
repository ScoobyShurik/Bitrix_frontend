/**
 * Форматирует дату в читаемый вид: "30 июня 2026"
 * @param {string|Date} date - дата в формате ISO или объект Date
 * @returns {string} - отформатированная дата
 */
export const formatDate = (date) => {
  if (!date) return '—'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Проверяем валидность даты
    if (isNaN(dateObj.getTime())) return '—'
    
    return dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    console.error('Ошибка форматирования даты:', e)
    return '—'
  }
}

/**
 * Форматирует период: "10 июля — 24 июля 2026"
 * Если год одинаковый, не повторяет его
 */
export const formatDateRange = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) return '—'
  
  try {
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return '—'
    
    const fromYear = from.getFullYear()
    const toYear = to.getFullYear()
    
    if (fromYear === toYear) {
      // Один год: "10 июля — 24 июля 2026"
      const fromStr = from.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
      const toStr = to.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      return `${fromStr} — ${toStr}`
    } else {
      // Разные годы: показываем оба полностью
      return `${formatDate(from)} — ${formatDate(to)}`
    }
  } catch (e) {
    console.error('Ошибка форматирования периода:', e)
    return '—'
  }
}