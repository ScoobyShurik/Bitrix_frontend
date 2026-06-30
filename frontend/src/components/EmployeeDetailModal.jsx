import { useState, useEffect } from 'react'
import { Modal, Card, Row, Col, Badge, Spinner, Alert, Button } from 'react-bootstrap'
import { api } from '../services/api'
import { formatDateRange } from '../utils/dateFormatter'
// 👇 Добавили импорт
import { getVacationIcon, getVacationColor } from '../utils/vacationIcons'

function EmployeeDetailModal({ show, onHide, employee }) {
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (show && employee) {
      fetchDetails()
    }
  }, [show, employee?.id])

  const fetchDetails = async () => {
    setLoading(true)
    setError(null)
    setDetails(null)
    
    try {
      const data = await api.getEmployeeDetails(employee.id)
      setDetails(data)
    } catch (err) {
      setError(err.message || 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'OPENED': return 'success'
      case 'CLOSED': return 'danger'
      default: return 'warning'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'OPENED': return 'На работе'
      case 'CLOSED': return 'День закрыт'
      default: return 'Неизвестно'
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <i className="fas fa-user-clock me-2 text-primary"></i>
          Детали сотрудника
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted">Загрузка данных рабочего дня...</div>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && details && (
          <>
            {/* Заголовок с ФИО и статусом */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <h5 className="mb-1">{details.employee.full_name}</h5>
                <small className="text-muted">{details.employee.post}</small>
              </div>
              <Badge bg={getStatusVariant(details.employee.status)} className="fs-6 px-3 py-2">
                {getStatusText(details.employee.status)}
              </Badge>
            </div>

            {/* Три карточки времени */}
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <Card className="bg-light h-100 border-0">
                  <Card.Body>
                    <h6 className="text-muted mb-3">
                      <i className="fas fa-calendar-check me-2"></i>По графику
                    </h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Начало:</span>
                      <span className="fw-bold">{details.schedule.start}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Окончание:</span>
                      <span className="fw-bold">{details.schedule.end}</span>
                    </div>
                    <div className="d-flex justify-content-between pt-2 border-top mt-2">
                      <span>Всего:</span>
                      <span className="fw-bold text-primary">{details.schedule.total}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className="bg-info bg-opacity-10 h-100 border-0">
                  <Card.Body>
                    <h6 className="text-muted mb-3">
                      <i className="fas fa-calendar-alt me-2"></i>Запланировано
                    </h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Начало:</span>
                      <span className="fw-bold">{details.planned.start}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Окончание:</span>
                      <span className="fw-bold">{details.planned.end}</span>
                    </div>
                    <div className="d-flex justify-content-between pt-2 border-top mt-2">
                      <span>Всего:</span>
                      <span className="fw-bold text-info">{details.planned.total}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4} className="mb-3">
                <Card className={`h-100 border-0 ${details.actual.total !== '—' ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                  <Card.Body>
                    <h6 className="text-muted mb-3">
                      <i className="fas fa-clock me-2"></i>Фактически
                    </h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Начало:</span>
                      <span className="fw-bold">{details.actual.start}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Окончание:</span>
                      <span className="fw-bold">{details.actual.end}</span>
                    </div>
                    <div className="d-flex justify-content-between pt-2 border-top mt-2">
                      <span>Отработано:</span>
                      <span className="fw-bold text-success">{details.actual.total}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Перерывы */}
            <Row className="mb-4">
              <Col md={12}>
                <Card className="bg-light border-0">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="text-muted mb-0">
                        <i className="fas fa-coffee me-2"></i>Перерывы
                      </h6>
                      <div className="fs-5 fw-bold">{details.actual.breaks}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Информация об отсутствии с иконкой */}
            {details.absence ? (
  <Card className={`border-${getVacationColor(details.absence.type_id)} bg-${getVacationColor(details.absence.type_id)} bg-opacity-10`}>
    <Card.Body>
      <div className="d-flex align-items-center mb-3">
        {/* 👇 Уменьшили размер с 40px до 32px */}
        <div className={`bg-${getVacationColor(details.absence.type_id)} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '32px', height: '32px' }}>
          <i className={`fas ${getVacationIcon(details.absence.type_id)} text-white`} style={{ fontSize: '14px' }}></i>
        </div>
        <h6 className="mb-0">Текущее отсутствие</h6>
      </div>
      <Row>
        <Col md={4}>
          <span className="text-muted small">Тип:</span>
          <div className="fw-bold">{details.absence.type}</div>
        </Col>
        <Col md={4}>
  <span className="text-muted small">Период:</span>
  <div className="fw-bold">
    {details.absence.date_from && details.absence.date_to
      ? formatDateRange(details.absence.date_from, details.absence.date_to)
      : '—'}
  </div>
</Col>
        <Col md={4}>
          <span className="text-muted small">Осталось дней:</span>
          <div className="fw-bold text-primary">{details.absence.days_left}</div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
) : (
  <Card className="bg-light border-0">
    <Card.Body className="text-center text-muted">
      <i className="fas fa-check-circle fa-2x mb-2 text-success"></i>
      <div>На данный момент отсутствий не запланировано</div>
    </Card.Body>
  </Card>
)}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Закрыть</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EmployeeDetailModal