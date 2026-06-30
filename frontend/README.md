# API Contracts: Frontend ↔ Django Backend

## Общие принципы

- **Base URL**: `http://localhost:8000/api` (настраивается через `VITE_API_URL`)
- **Аутентификация**: JWT токены в заголовке `Authorization: Bearer <access_token>`
- **Формат данных**: JSON
- **Кодировка**: UTF-8
- **Даты**: ISO 8601 (`2026-07-10`)
- **Время**: 24-часовой формат (`09:00`, `18:30`)

---

## 1. Аутентификация

### 1.1. Вход в систему

**Endpoint**: `POST /token/`  
**Описание**: Получение JWT токенов по логину и паролю  
**Авторизация**: Не требуется

**Request**:
```json
{
  "username": "admin",
  "password": "123"
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Ошибки**:
- `401 Unauthorized`: Неверный логин или пароль
  ```json
  { "detail": "No active account found with the given credentials" }
  ```

---

### 1.2. Обновление access token

**Endpoint**: `POST /token/refresh/`  
**Описание**: Получение нового access token по refresh token  
**Авторизация**: Не требуется

**Request**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Ошибки**:
- `401 Unauthorized`: Refresh token недействителен или истёк

---

### 1.3. Выход из системы

**Endpoint**: `POST /logout/`  
**Описание**: Добавление refresh token в blacklist  
**Авторизация**: Требуется

**Request**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

---

### 1.4. Получить текущего пользователя

**Endpoint**: `GET /me/`  
**Описание**: Получение данных авторизованного пользователя  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Админ",
  "last_name": "истратор",
  "name": "Администратор",
  "is_staff": true,
  "post": {
    "id": 1,
    "name": "Ведущий разработчик",
    "is_manager": true
  },
  "bitrix_status": "OPENED",
  "start_time": "09:00",
  "stop_time": "18:00",
  "timezone": "Asia/Krasnoyarsk",
  "manage_workday": true,
  "manage_start": true,
  "manage_stop": true,
  "bitrix_token": "",
  "bitrix_id": ""
}
```

**Поля**:
- `name`: Полное имя для отображения (`first_name + last_name`)
- `is_staff`: Администратор системы
- `post.is_manager`: Менеджер отдела
- `bitrix_status`: Статус рабочего дня (`OPENED` | `CLOSED` | `EXPIRED` | `ABSENT` | `UNKNOWN`)

**Ошибки**:
- `401 Unauthorized`: Токен недействителен

---

## 2. Профиль

### 2.1. Обновить профиль

**Endpoint**: `PATCH /me/`  
**Описание**: Частичное обновление данных профиля  
**Авторизация**: Требуется

**Request**:
```json
{
  "first_name": "Иван",
  "last_name": "Иванов",
  "email": "ivan@example.com",
  "start_time": "09:00",
  "stop_time": "18:00",
  "timezone": "Asia/Krasnoyarsk",
  "manage_workday": true,
  "manage_start": true,
  "manage_stop": true,
  "bitrix_token": "token123",
  "bitrix_id": "123"
}
```

**Response** (200 OK):  
Возвращает обновлённые данные пользователя (как в `GET /me/`)

---

### 2.2. Сменить пароль

**Endpoint**: `POST /me/change-password/`  
**Описание**: Изменение пароля с проверкой текущего  
**Авторизация**: Требуется

**Request**:
```json
{
  "old_password": "123",
  "new_password": "456"
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Ошибки**:
- `400 Bad Request`: Неверный текущий пароль
  ```json
  { "detail": "Неверный текущий пароль" }
  ```

---

## 3. Главная страница

### 3.1. Получить план на день

**Endpoint**: `GET /workday/planned/`  
**Описание**: Получение запланированного времени работы текущего пользователя  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):
```json
{
  "start": "09:00",
  "end": "18:00",
  "total": "8 ч 00 мин"
}
```

---

### 3.2. Обновить план на день

**Endpoint**: `PUT /workday/planned/`  
**Описание**: Обновление запланированного времени  
**Авторизация**: Требуется

**Request**:
```json
{
  "start": "09:00",
  "end": "18:00"
}
```

**Response** (200 OK):
```json
{
  "start": "09:00",
  "end": "18:00",
  "total": "8 ч 00 мин"
}
```

**Валидация**:
- `end` должен быть позже `start`
- Возвращает ошибку `400`, если время некорректно

---

## 4. Отдел

### 4.1. Получить данные отдела

**Endpoint**: `GET /department/`  
**Описание**: Получение сотрудников отдела текущего пользователя с их статусами  
**Авторизация**: Требуется  
**Доступ**: Только для менеджеров и администраторов

**Request**: -

**Response** (200 OK):
```json
{
  "department": {
    "name": "Отдел разработки"
  },
  "work_today": {
    "all": 5,
    "working": 3,
    "idle": 2
  },
  "employees": [
    {
      "id": 1,
      "full_name": "Иванов Иван Иванович",
      "post": "Ведущий разработчик",
      "bitrix_status": "OPENED",
      "scheduler": {
        "formatted_start_time": "09:00",
        "formatted_end_time": null,
        "workday_duration": "4 ч 30 мин"
      },
      "vacation": null
    },
    {
      "id": 2,
      "full_name": "Петров Петр Петрович",
      "post": "Разработчик",
      "bitrix_status": "CLOSED",
      "scheduler": {
        "formatted_start_time": "09:15",
        "formatted_end_time": "18:00",
        "workday_duration": "8 ч 45 мин"
      },
      "vacation": {
        "vacation_type_id": 1,
        "vacation_type_name": "Ежегодный отпуск"
      }
    }
  ],
  "today": "30 июня 2026"
}
```

**Поля**:
- `work_today.all`: Общее количество сотрудников
- `work_today.working`: Количество работающих (статус `OPENED`)
- `work_today.idle`: Количество отсутствующих
- `scheduler.formatted_start_time`: Фактическое время начала (или `null`)
- `scheduler.formatted_end_time`: Фактическое время окончания (или `null`)
- `scheduler.workday_duration`: Отработанное время (или `null`)
- `vacation`: Текущее отсутствие (или `null`)

---

### 4.2. Начать рабочий день сотрудника

**Endpoint**: `POST /department/employees/{employee_id}/start/`  
**Описание**: Открыть рабочий день сотрудника  
**Авторизация**: Требуется  
**Доступ**: Только для менеджеров

**Request**: -

**Response** (200 OK):
```json
{
  "success": true,
  "employee": {
    "id": 1,
    "full_name": "Иванов Иван Иванович",
    "post": "Ведущий разработчик",
    "bitrix_status": "OPENED",
    "scheduler": {
      "formatted_start_time": "09:05",
      "formatted_end_time": null,
      "workday_duration": null
    },
    "vacation": null
  }
}
```

**Ошибки**:
- `404 Not Found`: Сотрудник не найден
- `400 Bad Request`: Рабочий день уже открыт

---

### 4.3. Завершить рабочий день сотрудника

**Endpoint**: `POST /department/employees/{employee_id}/stop/`  
**Описание**: Закрыть рабочий день сотрудника  
**Авторизация**: Требуется  
**Доступ**: Только для менеджеров

**Request**: -

**Response** (200 OK):  
Аналогично `start/`, но `bitrix_status` = `CLOSED`, `formatted_end_time` заполнено

---

### 4.4. Получить детали сотрудника

**Endpoint**: `GET /department/employees/{employee_id}/details/`  
**Описание**: Получение детальной информации для модального окна  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):
```json
{
  "employee": {
    "full_name": "Иванов Иван Иванович",
    "post": "Ведущий разработчик",
    "status": "OPENED"
  },
  "schedule": {
    "start": "09:00",
    "end": "18:00",
    "total": "8 ч 00 мин"
  },
  "planned": {
    "start": "09:00",
    "end": "18:00",
    "total": "8 ч 00 мин"
  },
  "actual": {
    "start": "09:05",
    "end": null,
    "total": null,
    "breaks": "0 ч 20 мин"
  },
  "absence": null
}
```

**Поля**:
- `schedule`: Время по графику (норматив)
- `planned`: Запланированное время
- `actual`: Фактическое время
- `absence`: Информация об отсутствии (или `null`)

---

## 5. Отсутствия

### 5.1. Получить статистику отсутствий

**Endpoint**: `GET /absences/statistics/`  
**Описание**: Подсчёт отсутствий по типам  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):
```json
{
  "vacation": 3,
  "sick": 1,
  "idle": 2,
  "all": 10
}
```

**Поля**:
- `vacation`: Отпуска (type_id: 1, 3, 5, 7)
- `sick`: Больничные (type_id: 2)
- `idle`: Отгулы (type_id: 6, 8)
- `all`: Общее количество сотрудников

---

### 5.2. Получить отсутствия по отделам

**Endpoint**: `GET /absences/`  
**Описание**: Получение всех отсутствий, сгруппированных по отделам  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):
```json
{
  "departments": {
    "Отдел разработки": [
      {
        "id": 1,
        "name": "Иванов Иван Иванович",
        "post": "Ведущий разработчик",
        "vacations": [
          {
            "id": 101,
            "type_id": 1,
            "type": "Ежегодный отпуск",
            "date_from": "2026-07-10",
            "date_to": "2026-07-24",
            "duration": 14
          }
        ]
      }
    ],
    "Отдел дизайна": [
      {
        "id": 4,
        "name": "Козлов Дмитрий Александрович",
        "post": "Дизайнер",
        "vacations": []
      }
    ]
  },
  "vacation_types": [
    { "id": 1, "type_name": "Ежегодный отпуск" },
    { "id": 2, "type_name": "Больничный" },
    { "id": 3, "type_name": "Учебный отпуск" },
    { "id": 4, "type_name": "По уходу за больным" },
    { "id": 5, "type_name": "Административный отпуск" },
    { "id": 6, "type_name": "Отгул" },
    { "id": 7, "type_name": "Декрет" },
    { "id": 8, "type_name": "Другое" }
  ]
}
```

---

### 5.3. Добавить отсутствие

**Endpoint**: `POST /absences/`  
**Описание**: Создание нового отсутствия  
**Авторизация**: Требуется

**Request**:
```json
{
  "employee_id": 1,
  "vacation_type": 1,
  "start_date": "2026-07-10",
  "end_date": "2026-07-24"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "absence": {
    "id": 105,
    "type_id": 1,
    "type": "Ежегодный отпуск",
    "date_from": "2026-07-10",
    "date_to": "2026-07-24",
    "duration": 14
  },
  "employee_id": 1,
  "department": "Отдел разработки"
}
```

**Валидация**:
- Все поля обязательны
- `end_date` >= `start_date`
- Отсутствие не должно пересекаться с существующими
- Возвращает `400`, если есть пересечение

---

### 5.4. Обновить отсутствие

**Endpoint**: `PUT /absences/{absence_id}/`  
**Описание**: Изменение существующего отсутствия  
**Авторизация**: Требуется

**Request**: Аналогично `POST /absences/`

**Response** (200 OK): Аналогично `POST /absences/`

**Валидация**:
- При проверке пересечений исключается текущее отсутствие

---

### 5.5. Удалить отсутствие

**Endpoint**: `DELETE /absences/{absence_id}/`  
**Описание**: Удаление отсутствия  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):
```json
{
  "success": true,
  "absenceId": 101,
  "employeeId": 1,
  "department": "Отдел разработки"
}
```

**Ошибки**:
- `404 Not Found`: Отсутствие не найдено

---

### 5.6. Получить всех сотрудников

**Endpoint**: `GET /employees/`  
**Описание**: Получение плоского списка всех сотрудников для выбора  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):
```json
{
  "employees": [
    {
      "id": 1,
      "name": "Иванов Иван Иванович",
      "post": "Ведущий разработчик",
      "department": "Отдел разработки"
    },
    {
      "id": 2,
      "name": "Петров Петр Петрович",
      "post": "Разработчик",
      "department": "Отдел разработки"
    }
  ],
  "departments": [
    "Отдел разработки",
    "Отдел дизайна",
    "Отдел продаж"
  ]
}
```

---

## 6. График

### 6.1. Получить график всех сотрудников

**Endpoint**: `GET /schedule/`  
**Описание**: Получение всех сотрудников с их задачами и статусами  
**Авторизация**: Требуется  
**Доступ**: Только для менеджеров и администраторов

**Request**: -

**Response** (200 OK):
```json
{
  "departments": {
    "Отдел разработки": [
      {
        "id": 1,
        "name": "Иванов Иван Иванович",
        "post": "Ведущий разработчик",
        "planned": {
          "start": "09:00",
          "end": "18:00",
          "total": "8 ч 00 мин"
        },
        "actual": {
          "start": "09:05",
          "end": null,
          "total": null
        },
        "workday_status": "OPENED",
        "start_task_status": "done",
        "end_task_status": "pending",
        "absence": null
      },
      {
        "id": 3,
        "name": "Сидорова Анна Сергеевна",
        "post": "Тестировщик",
        "planned": {
          "start": "10:00",
          "end": "19:00",
          "total": "8 ч 00 мин"
        },
        "actual": {
          "start": null,
          "end": null,
          "total": null
        },
        "workday_status": "ABSENT",
        "start_task_status": "not_applicable",
        "end_task_status": "not_applicable",
        "absence": {
          "type": "Ежегодный отпуск",
          "type_id": 1,
          "period": "10 июля — 24 июля 2026"
        }
      }
    ]
  }
}
```

**Статусы задач**:
- `not_created`: Задача не создана
- `pending`: Задача создана, ожидает выполнения
- `done`: Задача выполнена
- `not_applicable`: Сотрудник отсутствует

**Статусы рабочего дня**:
- `OPENED`: Рабочий день открыт
- `CLOSED`: Рабочий день закрыт
- `EXPIRED`: Закрыт с нарушением
- `ABSENT`: Сотрудник отсутствует
- `UNKNOWN`: День не начат

---

### 6.2. Создать задачу на начало рабочего дня

**Endpoint**: `POST /schedule/{employee_id}/tasks/start/create/`  
**Описание**: Создание задачи типа "start"  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):
```json
{
  "success": true,
  "employee": {
    "id": 1,
    "name": "Иванов Иван Иванович",
    "post": "Ведущий разработчик",
    "planned": { "start": "09:00", "end": "18:00", "total": "8 ч 00 мин" },
    "actual": { "start": null, "end": null, "total": null },
    "workday_status": "UNKNOWN",
    "start_task_status": "pending",
    "end_task_status": "not_created",
    "absence": null
  }
}
```

**Ошибки**:
- `400 Bad Request`: Задача уже существует

---

### 6.3. Выполнить задачу на начало рабочего дня

**Endpoint**: `POST /schedule/{employee_id}/tasks/start/complete/`  
**Описание**: Выполнение задачи типа "start"  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):  
Аналогично `create/`, но:
- `start_task_status` = `done`
- `actual.start` = текущее время
- `workday_status` = `OPENED`

**Ошибки**:
- `400 Bad Request`: Задача не в статусе ожидания

---

### 6.4. Отменить задачу на начало рабочего дня

**Endpoint**: `POST /schedule/{employee_id}/tasks/start/cancel/`  
**Описание**: Отмена задачи типа "start"  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):  
Возвращает обновлённые данные сотрудника

**Логика**:
- Если статус `pending` → удаляет задачу (→ `not_created`)
- Если статус `done` → откатывает выполнение (→ `pending`, очищает `actual.start`)

**Ошибки**:
- `400 Bad Request`: Нельзя отменить (например, если выполнена задача завершения)

---

### 6.5. Создать задачу на завершение рабочего дня

**Endpoint**: `POST /schedule/{employee_id}/tasks/end/create/`  
**Описание**: Создание задачи типа "end"  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):  
Аналогично `start/create/`, но для задачи завершения

**Ошибки**:
- `400 Bad Request`: Задача уже существует
- `400 Bad Request`: Задача на начало не выполнена

---

### 6.6. Выполнить задачу на завершение рабочего дня

**Endpoint**: `POST /schedule/{employee_id}/tasks/end/complete/`  
**Описание**: Выполнение задачи типа "end"  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):  
Аналогично `start/complete/`, но:
- `end_task_status` = `done`
- `actual.end` = текущее время
- `actual.total` = пересчитанное время
- `workday_status` = `CLOSED`

**Ошибки**:
- `400 Bad Request`: Задача на начало не выполнена

---

### 6.7. Отменить задачу на завершение рабочего дня

**Endpoint**: `POST /schedule/{employee_id}/tasks/end/cancel/`  
**Описание**: Отмена задачи типа "end"  
**Авторизация**: Требуется

**Request**: -

**Response** (200 OK):  
Аналогично `start/cancel/`

---

## Примечания для реализации

### Валидация пересечений отсутствий

При создании/обновлении отсутствия проверять пересечение с существующими:

```python
def check_overlap(employee_id, start_date, end_date, exclude_id=None):
    vacations = Vacation.objects.filter(employee_id=employee_id)
    if exclude_id:
        vacations = vacations.exclude(id=exclude_id)
    
    for vac in vacations:
        if start_date <= vac.date_to and end_date >= vac.date_from:
            return True
    return False
```

### Логика задач

**Создание задачи**:
- Проверить, что задача не существует
- Установить статус `pending`

**Выполнение задачи**:
- Проверить, что статус `pending`
- Для задачи завершения проверить, что задача начала выполнена
- Установить статус `done`
- Записать фактическое время
- Обновить `workday_status`

**Отмена задачи**:
- Если `pending` → удалить задачу
- Если `done` → откатить статус на `pending`, очистить фактическое время
- Проверить зависимости (нельзя отменить начало, если выполнено завершение)

### Статусы рабочего дня

Обновляются автоматически при выполнении задач:
- Выполнена задача начала → `OPENED`
- Выполнена задача завершения → `CLOSED`
- Сотрудник в отпуске → `ABSENT`
- Нет задач → `UNKNOWN`

---

## Сводная таблица всех endpoints

| Метод | Endpoint | Назначение |
|---|---|---|
| POST | `/token/` | Вход в систему |
| POST | `/token/refresh/` | Обновление access token |
| POST | `/logout/` | Выход из системы |
| GET | `/me/` | Получить текущего пользователя |
| PATCH | `/me/` | Обновить профиль |
| POST | `/me/change-password/` | Сменить пароль |
| GET | `/workday/planned/` | Получить план на день |
| PUT | `/workday/planned/` | Обновить план на день |
| GET | `/department/` | Данные отдела |
| POST | `/department/employees/{id}/start/` | Начать день сотрудника |
| POST | `/department/employees/{id}/stop/` | Завершить день сотрудника |
| GET | `/department/employees/{id}/details/` | Детали сотрудника |
| GET | `/absences/statistics/` | Статистика отсутствий |
| GET | `/absences/` | Список отсутствий по отделам |
| POST | `/absences/` | Добавить отсутствие |
| PUT | `/absences/{id}/` | Обновить отсутствие |
| DELETE | `/absences/{id}/` | Удалить отсутствие |
| GET | `/employees/` | Все сотрудники для выбора |
| GET | `/schedule/` | График всех сотрудников |
| POST | `/schedule/{id}/tasks/start/create/` | Создать задачу на начало |
| POST | `/schedule/{id}/tasks/start/complete/` | Выполнить задачу на начало |
| POST | `/schedule/{id}/tasks/start/cancel/` | Отменить задачу на начало |
| POST | `/schedule/{id}/tasks/end/create/` | Создать задачу на завершение |
| POST | `/schedule/{id}/tasks/end/complete/` | Выполнить задачу на завершение |
| POST | `/schedule/{id}/tasks/end/cancel/` | Отменить задачу на завершение |