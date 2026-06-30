import { useState, useEffect } from 'react'
import { Card, Button, Badge, ListGroup, Spinner, Row, Col } from 'react-bootstrap'
import { getVacationIcon } from '../utils/vacationIcons'
import { api } from '../services/api'
import { formatDateRange } from '../utils/dateFormatter'

function HomePage({ user }) {
  const [status, setStatus] = useState(user.bitrix_status || 'UNKNOWN');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [duration, setDuration] = useState('0 ч 00 мин');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  // 👇 Упрощённое состояние для плана
  const [planned, setPlanned] = useState({ start: '', end: '', total: '' });
  const [plannedLoading, setPlannedLoading] = useState(false);

  const vacations = [
    { 
      id: 1, 
      type_name: 'Ежегодный отпуск', 
      type_id: 1, 
      is_official: true,
      date_from: '2026-07-10', 
      date_to: '2026-07-24', 
      days: 14 
    },
    { 
      id: 2, 
      type_name: 'Отгул', 
      type_id: 6, 
      is_official: false,
      date_from: '2026-08-01', 
      date_to: '2026-08-01', 
      days: 1 
    }
  ];

  useEffect(() => {
    loadPlannedTime();
  }, []);

  const loadPlannedTime = async () => {
    setPlannedLoading(true);
    try {
      const data = await api.getPlannedTime();
      setPlanned(data);
    } catch (err) {
      console.error('Ошибка загрузки плана:', err);
    } finally {
      setPlannedLoading(false);
    }
  };

  const sendRequest = async (action) => {
    setLoading(true);
    setLoadingAction(action);
    
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (action === 'start_day') {
      setStatus('OPENED');
      setStartTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else if (action === 'stop_day') {
      setStatus('CLOSED');
      setEndTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    
    setLoading(false);
    setLoadingAction(null);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'OPENED': return 'success';
      case 'CLOSED': return 'danger';
      case 'EXPIRED': return 'danger';
      default: return 'warning';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'OPENED': return 'Открыт';
      case 'CLOSED': return 'Закрыт';
      case 'EXPIRED': return 'Закрыт с нарушением';
      default: return 'Ошибка получения статуса!';
    }
  };

  return (
    <div className="row">
      <div className="col-lg-8">
        <Card className="shadow mb-4">
          <Card.Body>
            <div className="d-flex align-items-center mb-4">
              <div className="border border-3 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                <i className="fas fa-play-circle"></i>
              </div>
              <h2 className="h4 mb-0">Управление рабочим днем</h2>
            </div>

            {/* Статус */}
            <div className="text-center mb-4 d-flex justify-content-center align-items-center gap-2">
              <Badge bg={getStatusColor()} className="fs-5 px-4 py-2">
                {getStatusText()}
              </Badge>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="rounded-circle p-0" 
                style={{ width: '32px', height: '32px' }}
                title="Обновить статус"
                onClick={() => sendRequest('status')}
                disabled={loading}
              >
                {loading && loadingAction === 'status' ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <i className="fas fa-sync-alt"></i>
                )}
              </Button>
            </div>

            {/* Фактическое время */}
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <Card bg="light">
                  <Card.Body className="text-center">
                    <div className="text-muted small">Начало рабочего дня</div>
                    <div className="fw-bold fs-5">{startTime || '—'}</div>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-6 mb-3">
                <Card bg="light">
                  <Card.Body className="text-center">
                    <div className="text-muted small">Окончание рабочего дня</div>
                    <div className="fw-bold fs-5">{endTime || '—'}</div>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-6 mb-3">
                <Card bg="light">
                  <Card.Body className="text-center">
                    <div className="text-muted small">Отработано</div>
                    <div className="fw-bold fs-5">{duration}</div>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-6 mb-3">
                <Card bg="light">
                  <Card.Body className="text-center">
                    <div className="text-muted small">Перерывы</div>
                    <div className="fw-bold fs-5">0 ч 00 мин</div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* 👇 НОВЫЙ БЛОК: Запланированное время (только просмотр) */}
            <div className="mb-4">
              <h6 className="text-muted mb-3">
                <i className="fas fa-calendar-alt me-2"></i>Запланированное время
              </h6>
              
              {plannedLoading ? (
                <div className="text-center py-3 bg-light rounded">
                  <Spinner animation="border" size="sm" variant="secondary" />
                  <span className="ms-2 text-muted">Загрузка...</span>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <Card bg="light">
                      <Card.Body className="text-center">
                        <div className="text-muted small">Начало</div>
                        <div className="fw-bold fs-5">{planned.start || '—'}</div>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-4 mb-3">
                    <Card bg="light">
                      <Card.Body className="text-center">
                        <div className="text-muted small">Окончание</div>
                        <div className="fw-bold fs-5">{planned.end || '—'}</div>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-4 mb-3">
                    <Card bg="light">
                      <Card.Body className="text-center">
                        <div className="text-muted small">Всего</div>
                        <div className="fw-bold fs-5">{planned.total || '—'}</div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Кнопки управления */}
            <div className="row g-2">
              <div className="col-md-4">
                <Button 
                  variant="success" 
                  className="w-100 py-3" 
                  onClick={() => sendRequest('start_day')}
                  disabled={status === 'OPENED' || loading}
                >
                  {loading && loadingAction === 'start_day' ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Запуск...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play me-2"></i>Начать день
                    </>
                  )}
                </Button>
              </div>
              <div className="col-md-4">
                <Button 
                  variant="danger" 
                  className="w-100 py-3" 
                  onClick={() => sendRequest('stop_day')}
                  disabled={status !== 'OPENED' || loading}
                >
                  {loading && loadingAction === 'stop_day' ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Остановка...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-stop me-2"></i>Закончить день
                    </>
                  )}
                </Button>
              </div>
              <div className="col-md-4">
                <Button 
                  variant="warning" 
                  className="w-100 py-3" 
                  onClick={() => sendRequest('break')}
                  disabled={status !== 'OPENED' || loading}
                >
                  {loading && loadingAction === 'break' ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Перерыв...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-coffee me-2"></i>Перерыв
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Правая колонка с отпусками */}
      <div className="col-lg-4">
        <Card className="shadow mb-4">
          <Card.Body>
            <div className="d-flex align-items-center mb-4">
              <div className="border border-3 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h2 className="h4 mb-0">Планирование и события</h2>
            </div>

            {vacations.length > 0 ? (
              <ListGroup>
                {vacations.map((vacation) => (
                  <ListGroup.Item 
                    key={vacation.id}
                    className={`border-start border-4 mb-1 ${vacation.is_official ? 'border-danger list-group-item-danger' : 'border-warning list-group-item-warning'}`}
                    style={{ borderTop: 0, borderBottom: 0, borderRight: 0 }}
                  >
                    <div className="d-flex align-items-center mb-2">
                      <i className={`fas ${getVacationIcon(vacation.type_id)} me-2`}></i>
                      <strong>{vacation.type_name}</strong>
                    </div>
                    <div className="small text-muted">
                      {formatDateRange(vacation.date_from, vacation.date_to)}<br/>
                      {vacation.days} календарных дней
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted">Ближайших событий нет</p>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default HomePage;