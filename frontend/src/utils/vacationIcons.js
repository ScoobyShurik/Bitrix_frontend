export const getVacationIcon = (typeId) => {
  const icons = {
    1: 'fa-plane',           // Ежегодный отпуск
    2: 'fa-procedures',      // Больничный
    3: 'fa-graduation-cap',  // Учебный отпуск
    4: 'fa-hospital',        // По уходу за больным
    5: 'fa-plane',           // Административный отпуск
    6: 'fa-person-walking',  // Прогул/отгул
    7: 'fa-child',           // Декрет
    8: 'fa-person-walking',  // Другое
  };
  return icons[typeId] || 'fa-plane';
};

// Цвета для типов отсутствий (для бейджей)
export const getVacationColor = (typeId) => {
  if ([1, 3, 5, 7].includes(typeId)) return 'warning';
  if (typeId === 2) return 'danger';
  if ([6, 8].includes(typeId)) return 'success';
  if (typeId === 4) return 'info';
  return 'secondary';
};

// Названия типов отсутствий
export const getVacationTypeName = (typeId) => {
  const names = {
    1: 'Ежегодный отпуск',
    2: 'Больничный',
    3: 'Учебный отпуск',
    4: 'По уходу за больным',
    5: 'Административный отпуск',
    6: 'Отгул',
    7: 'Декрет',
    8: 'Другое',
  };
  return names[typeId] || 'Неизвестно';
};