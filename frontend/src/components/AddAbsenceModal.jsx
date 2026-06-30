import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap'
import EmployeePickerModal from './EmployeePickerModal'
import { formatDateRange } from '../utils/dateFormatter'

function AddAbsenceModal({ show, onHide, departments, vacationTypes, onSave, editMode = false, editingAbsence = null }) {
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    vacation_type: '',
    start_date: '',
    end_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [dateError, setDateError] = useState('')
  const [overlapError, setOverlapError] = useState('')

  useEffect(() => {
    if (editMode && editingAbsence && show) {
      setFormData({
        employee_id: editingAbsence.employee_id,
        employee_name: editingAbsence.employee_name,
        vacation_type: editingAbsence.vacation_type.toString(),
        start_date: editingAbsence.start_date,
        end_date: editingAbsence.end_date
      })
    } else if (!editMode && show) {
      setFormData({
        employee_id: '',
        employee_name: '',
        vacation_type: '',
        start_date: '',
        end_date: ''
      })
    }
    // Очищаем ошибки при открытии
    setDateError('')
    setOverlapError('')
  }, [editMode, editingAbsence, show])

  // Проверка пересечения дат
  const checkDateOverlap = (startDate, endDate, employeeId, excludeAbsenceId = null) => {
    if (!startDate || !endDate || !employeeId) return null

    const newStart = new Date(startDate)
    const newEnd = new Date(endDate)

    // Ищем отсутствия этого сотрудника во всех отделах
    for (const employees of Object.values(departments)) {
      const employee = employees.find(emp => emp.id === parseInt(employeeId))
      if (!employee) continue

      for (const vac of employee.vacations) {
        // Пропускаем текущее редактируемое отсутствие
        if (excludeAbsenceId && vac.id === excludeAbsenceId) continue

        const vacStart = new Date(vac.date_from)
        const vacEnd = new Date(vac.date_to)

        // Проверка пересечения: новый диапазон пересекается с существующим
       if (newStart <= vacEnd && newEnd >= vacStart) {
  return {
    type: vac.type,
    date_from: vac.date_from,
    date_to: vac.date_to
  }
}
      }
    }

    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
    
    // Валидация дат при изменении
    if (name === 'start_date' || name === 'end_date') {
      const newFormData = { ...formData, [name]: value }
      validateDates(newFormData.start_date, newFormData.end_date)
    }
  }

  const validateDates = (startDate, endDate) => {
    setDateError('')
    setOverlapError('')

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (end < start) {
        setDateError('Дата окончания не может быть раньше даты начала')
        return false
      }
    }

    return true
  }

  const validateOverlap = () => {
    if (!formData.start_date || !formData.end_date || !formData.employee_id) {
      return true
    }

    const overlap = checkDateOverlap(
      formData.start_date, 
      formData.end_date, 
      formData.employee_id,
      editMode ? editingAbsence?.absence_id : null
    )

    if (overlap) {
  const rangeStr = formatDateRange(overlap.date_from, overlap.date_to)
  setOverlapError(`Пересечение с отсутствием "${overlap.type}" (${rangeStr})`)
  return false
}

    return true
  }

  const handleSelectEmployee = (employee) => {
    setFormData(prev => ({
      ...prev,
      employee_id: employee.id,
      employee_name: employee.name
    }))
    // Проверяем пересечения после выбора сотрудника
    if (formData.start_date && formData.end_date) {
      setTimeout(() => validateOverlap(), 0)
    }
  }

  const handleClearEmployee = () => {
    setFormData(prev => ({
      ...prev,
      employee_id: '',
      employee_name: ''
    }))
    setOverlapError('')
  }

  const handleSubmit = async () => {
    // Базовая валидация
    if (!formData.employee_id || !formData.vacation_type || !formData.start_date || !formData.end_date) {
      setError('Заполните все обязательные поля')
      return
    }

    // Валидация дат
    if (!validateDates(formData.start_date, formData.end_date)) {
      return
    }

    // Проверка пересечений
    if (!validateOverlap()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSave(formData)
      setFormData({
        employee_id: '',
        employee_name: '',
        vacation_type: '',
        start_date: '',
        end_date: ''
      })
    } catch (err) {
      setError(err.message || 'Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      employee_id: '',
      employee_name: '',
      vacation_type: '',
      start_date: '',
      end_date: ''
    })
    setError('')
    setDateError('')
    setOverlapError('')
    onHide()
  }

  const hasErrors = dateError || overlapError

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`fas ${editMode ? 'fa-edit' : 'fa-plus-lg'} me-2`}></i>
            {editMode ? 'Редактировать отсутствие' : 'Добавить отсутствие'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form>
            {/* Выбор сотрудника */}
            <Form.Group className="mb-3">
              <Form.Label>Сотрудник <span className="text-danger">*</span></Form.Label>
              <div className="input-group">
                <Form.Control
                  type="text"
                  value={formData.employee_name}
                  readOnly
                  placeholder="Нажмите 'Выбрать'"
                  className={formData.employee_id ? 'bg-light' : ''}
                  disabled={editMode}
                />
                {!editMode && (
                  <>
                    <Button
                      variant="outline-primary"
                      onClick={() => setShowPicker(true)}
                      disabled={loading}
                    >
                      <i className="fas fa-user-plus me-1"></i> Выбрать
                    </Button>
                    {formData.employee_id && (
                      <Button
                        variant="outline-danger"
                        onClick={handleClearEmployee}
                        disabled={loading}
                      >
                        <i className="fa fa-close"></i>
                      </Button>
                    )}
                  </>
                )}
              </div>
              {editMode && (
                <Form.Text className="text-muted">
                  Сотрудник не может быть изменён
                </Form.Text>
              )}
            </Form.Group>

            {/* Тип отсутствия */}
            <Form.Group className="mb-3">
              <Form.Label>Тип отсутствия <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="vacation_type"
                value={formData.vacation_type}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">-- Выберите тип --</option>
                {vacationTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.type_name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Даты */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата начала <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    disabled={loading}
                    isInvalid={!!dateError}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата окончания <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    disabled={loading}
                    isInvalid={!!dateError}
                  />
                  {dateError && (
                    <Form.Text className="text-danger">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {dateError}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Ошибка пересечения */}
            {overlapError && (
  <Alert variant="warning" className="mt-2">
    <i className="fas fa-exclamation-triangle me-2"></i>
    {overlapError}
  </Alert>
)}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading || hasErrors}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Сохранение...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i>{editMode ? 'Обновить' : 'Сохранить'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {!editMode && (
        <EmployeePickerModal
          show={showPicker}
          onHide={() => setShowPicker(false)}
          onSelect={handleSelectEmployee}
        />
      )}
    </>
  )
}

export default AddAbsenceModal