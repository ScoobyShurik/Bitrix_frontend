import { useState, useEffect } from 'react'
import { Card, Button, Badge, Spinner, Table, Alert, ButtonGroup } from 'react-bootstrap'
import { getVacationIcon, getVacationColor } from '../utils/vacationIcons'
import { api } from '../services/api'

function SchedulePage() {
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState({})
  const [updatingKey, setUpdatingKey] = useState(null) // "employeeId_taskType_action"
  const [toast, setToast] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getSchedule()
      setDepartments(data.departments)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (variant, title, message) => {
    setToast({ variant, title, message })
    setTimeout(() => setToast(null), 3000)
  }

  // Универсальный обработчик действий с задачей
  const handleTaskAction = async (employee, taskType, action) => {
    const key = `${employee.id}_${taskType}_${action}`
    setUpdatingKey(key)
    
    try {
      let response
      
      // Вызываем соответствующий метод API
      if (taskType === 'start') {
        if (action === 'create') response = await api.createStartTask(employee.id)
        else if (action === 'complete') response = await api.completeStartTask(employee.id)
        else if (action === 'cancel') response = await api.cancelStartTask(employee.id)
      } else if (taskType === 'end') {
        if (action === 'create') response = await api.createEndTask(employee.id)
        else if (action === 'complete') response = await api.completeEndTask(employee.id)
        else if (action === 'cancel') response = await api.cancelEndTask(employee.id)
      }
      
      // Локальное обновление
      const newDepartments = { ...departments }
      for (const [deptName, employees] of Object.entries(newDepartments)) {
        const empIndex = employees.findIndex(e => e.id === employee.id)
        if (empIndex !== -1) {
          const updatedEmployees = [...employees]
          updatedEmployees[empIndex] = response.employee
          newDepartments[deptName] = updatedEmployees
          break
        }
      }
      setDepartments(newDepartments)
      
      const taskName = taskType === 'start' ? 'начала рабочего дня' : 'завершения рабочего дня'
      const actionNames = { create: 'создана', complete: 'выполнена', cancel: 'отменена' }
      showToast('success', 'Успех', `Задача ${taskName} ${actionNames[action]}`)
    } catch (err) {
      showToast('danger', 'Ошибка', err.message)
    } finally {
      setUpdatingKey(null)
    }
  }

  // Маппинг статуса рабочего дня на бейдж
  const getWorkdayStatus = (workdayStatus) => {
    switch (workdayStatus) {
      case 'OPENED':
        return { label: 'Открыт', variant: 'success', icon: 'fa-play-circle' }
      case 'CLOSED':
        return { label: 'Закрыт', variant: 'secondary', icon: 'fa-stop-circle' }
      case 'EXPIRED':
        return { label: 'Закрыт с нарушением', variant: 'danger', icon: 'fa-exclamation-triangle' }
      case 'ABSENT':
        return { label: 'Отсутствует', variant: 'info', icon: 'fa-umbrella-beach' }
      case 'UNKNOWN':
      default:
        return { label: 'Не начат', variant: 'warning', icon: 'fa-clock' }
    }
  }

  // Бейдж статуса задачи
  const getTaskBadge = (status) => {
    switch (status) {
      case 'done':
        return <Badge bg="success"><i className="fas fa-check me-1"></i>Выполнена</Badge>
      case 'pending':
        return <Badge bg="warning" text="dark"><i className="fas fa-clock me-1"></i>Ожидает</Badge>
      case 'not_created':
        return <Badge bg="light" text="muted" border="secondary"><i className="fas fa-minus me-1"></i>Не создана</Badge>
      case 'not_applicable':
        return <Badge bg="light" text="muted"><i className="fas fa-ban me-1"></i>Не применимо</Badge>
      default:
        return <Badge bg="secondary">—</Badge>
    }
  }

  // Кнопки управления задачей
  const getTaskButtons = (employee, taskType) => {
    const status = taskType === 'start' ? employee.start_task_status : employee.end_task_status
    const isAnyUpdating = updatingKey !== null

    // Для отсутствующих — нет кнопок
    if (status === 'not_applicable') {
      return null
    }

    const makeKey = (action) => `${employee.id}_${taskType}_${action}`

    if (status === 'not_created') {
      // Только "Создать"
      const key = makeKey('create')
      const isUpdating = updatingKey === key
      return (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => handleTaskAction(employee, taskType, 'create')}
          disabled={isAnyUpdating}
        >
          {isUpdating ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <>
              <i className="fas fa-plus me-1"></i>Создать
            </>
          )}
        </Button>
      )
    }

    if (status === 'pending') {
      // "Выполнить" + "Удалить"
      const completeKey = makeKey('complete')
      const cancelKey = makeKey('cancel')
      return (
        <ButtonGroup size="sm">
          <Button
            variant="outline-success"
            onClick={() => handleTaskAction(employee, taskType, 'complete')}
            disabled={isAnyUpdating}
          >
            {updatingKey === completeKey ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <i className="fas fa-check me-1"></i>Выполнить
              </>
            )}
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => handleTaskAction(employee, taskType, 'cancel')}
            disabled={isAnyUpdating}
            title="Удалить задачу"
          >
            {updatingKey === cancelKey ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="fas fa-trash"></i>
            )}
          </Button>
        </ButtonGroup>
      )
    }

    // Для done — никаких кнопок, только бейдж
    if (status === 'done') {
      return null
    }

    return null
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3 text-muted">Загрузка графика...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid mt-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-4">
      {/* Toast */}
      {toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className={`toast show bg-${toast.variant} text-white`}>
            <div className="toast-header bg-transparent text-white border-0">
              <strong className="me-auto">{toast.title}</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setToast(null)}></button>
            </div>
            <div className="toast-body">{toast.message}</div>
          </div>
        </div>
      )}

      {/* Заголовок */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2><i className="fas fa-calendar-week me-2"></i>График работы</h2>
        </div>
      </div>

      {/* Отделы */}
      {Object.entries(departments).map(([deptName, employees]) => (
        <Card key={deptName} className="mb-4">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-building me-2"></i>{deptName}
            </h5>
            <Badge bg="secondary">{employees.length} сотрудников</Badge>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '20%' }}>Сотрудник</th>
                    <th>План</th>
                    <th>Факт</th>
                    <th>Статус рабочего дня</th>
                    <th>Задача: Начало</th>
                    <th>Задача: Завершение</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const isAbsent = emp.workday_status === 'ABSENT'
                    const workdayStatus = getWorkdayStatus(emp.workday_status)

                    return (
                      <tr 
                        key={emp.id}
                        style={{ opacity: isAbsent ? 0.6 : 1 }}
                      >
                        <td>
                          <div className="fw-bold">{emp.name}</div>
                          <small className="text-muted">{emp.post}</small>
                          {isAbsent && emp.absence && (
                            <div className="mt-1">
                              <Badge bg={getVacationColor(emp.absence.type_id)}>
                                <i className={`fas ${getVacationIcon(emp.absence.type_id)} me-1`}></i>
                                {emp.absence.type}
                              </Badge>
                              <div className="small text-muted mt-1">
                                {emp.absence.period}
                              </div>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="text-muted small">
                            {emp.planned.start} — {emp.planned.end}
                          </div>
                          <div className="fw-bold">{emp.planned.total}</div>
                        </td>
                        <td>
                          {emp.actual.start || emp.actual.end ? (
                            <div>
                              <div className="text-success">
                                <i className="fas fa-play me-1 small"></i>
                                {emp.actual.start || '—'}
                              </div>
                              <div className="text-danger">
                                <i className="fas fa-stop me-1 small"></i>
                                {emp.actual.end || '—'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={workdayStatus.variant} className="px-3 py-2">
                            <i className={`fas ${workdayStatus.icon} me-1`}></i>
                            {workdayStatus.label}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-2">
                            {getTaskBadge(emp.start_task_status)}
                            {getTaskButtons(emp, 'start')}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-2">
                            {getTaskBadge(emp.end_task_status)}
                            {getTaskButtons(emp, 'end')}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  )
}

export default SchedulePage