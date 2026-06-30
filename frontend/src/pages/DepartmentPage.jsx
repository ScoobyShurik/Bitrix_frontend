
import { useState, useEffect } from 'react'
import { Card, Button, Badge, Spinner, Table } from 'react-bootstrap'
import { api } from '../services/api'
import EmployeeDetailModal from '../components/EmployeeDetailModal'
import { formatDate } from '../utils/dateFormatter'

function DepartmentPage() {
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(null);
  const [workToday, setWorkToday] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [today, setToday] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // ID сотрудника + действие
  const [showModal, setShowModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  useEffect(() => {
    loadDepartment();
  }, []);

  const openEmployeeModal = (employee) => {
  setSelectedEmployee(employee)
  setShowModal(true)
}

  const loadDepartment = async () => {
    setLoading(true);
    try {
      const data = await api.getDepartment();
      setDepartment(data.department);
      setWorkToday(data.work_today);
      setEmployees(data.employees);
      setToday(data.today);
    } catch (err) {
      console.error('Ошибка загрузки отдела:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageDay = async (employeeId, action) => {
    const actionKey = `${employeeId}_${action}`;
    setLoadingAction(actionKey);

    try {
      await api.manageEmployeeDay(employeeId, action);
      
      // Обновляем список сотрудников
      setEmployees(prev => prev.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            bitrix_status: action === 'start' ? 'OPENED' : 'CLOSED',
            scheduler: {
              ...emp.scheduler,
              formatted_start_time: action === 'start' 
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : emp.scheduler.formatted_start_time,
              formatted_end_time: action === 'stop'
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : emp.scheduler.formatted_end_time
            }
          };
        }
        return emp;
      }));

      // Обновляем сводку
      const updatedEmployees = employees.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, bitrix_status: action === 'start' ? 'OPENED' : 'CLOSED' };
        }
        return emp;
      });
      
      const working = updatedEmployees.filter(e => e.bitrix_status === 'OPENED').length;
      setWorkToday({
        all: updatedEmployees.length,
        working,
        idle: updatedEmployees.length - working
      });
    } catch (err) {
      console.error('Ошибка управления днем:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPENED':
        return <Badge bg="success">Активен</Badge>;
      case 'CLOSED':
        return <Badge bg="danger">Не активен</Badge>;
      default:
        return <Badge bg="warning" text="dark">Ошибка статуса</Badge>;
    }
  };

  const getVacationBadge = (vacation) => {
    if (!vacation) {
      return <Badge bg="secondary">Нет</Badge>;
    }

    const typeId = vacation.vacation_type_id;
    let bg = 'warning';

    if ([1, 3, 5, 7].includes(typeId)) bg = 'warning';
    else if (typeId === 2) bg = 'danger';
    else if ([6, 8].includes(typeId)) bg = 'success';
    else if (typeId === 4) bg = 'info';

    return <Badge bg={bg}>{vacation.vacation_type_name}</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3 text-muted">Загрузка данных отдела...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Сводка */}
      <Card className="shadow mb-4">
        <Card.Body>
          <div className="d-flex align-items-center mb-4">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
              <i className="fas fa-tachometer-alt text-white"></i>
            </div>
            <h2 className="h4 mb-0">Сводка {department?.name}</h2>
          </div>

          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <Card bg="light">
                <Card.Body>
                  <div className="h2 text-primary mb-1">{workToday?.all}</div>
                  <div className="text-muted">Сотрудников</div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4 mb-3">
              <Card className="bg-success bg-opacity-25">
                <Card.Body>
                  <div className="h2 text-success mb-1">{workToday?.working}</div>
                  <div className="text-muted">На работе</div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4 mb-3">
              <Card className="bg-danger bg-opacity-25">
                <Card.Body>
                  <div className="h2 text-danger mb-1">{workToday?.idle}</div>
                  <div className="text-muted">Отсутствуют</div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Таблица сотрудников */}
      <Card className="shadow">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                <i className="fas fa-users text-white"></i>
              </div>
              <h3 className="h4 mb-0">Сотрудники {department?.name}</h3>
            </div>
            <div className="text-muted">
              <i className="fas fa-calendar me-1"></i>
              <span>{today}</span>
            </div>
          </div>

          <div className="table-responsive">
            <Table hover>
              <thead className="table-primary">
                <tr>
                  <th>Сотрудник</th>
                  <th>Статус</th>
                  <th>Начало</th>
                  <th>Окончание</th>
                  <th>Отработано</th>
                  <th>Отсутствия</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => {
                  const isStartLoading = loadingAction === `${employee.id}_start`;
                  const isStopLoading = loadingAction === `${employee.id}_stop`;

                  return (
                    <tr key={employee.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="fw-bold mb-0">{employee.full_name}</div>
                            <small className="text-muted">{employee.post}</small>
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(employee.bitrix_status)}</td>
                      <td className={employee.scheduler.formatted_start_time ? 'text-success fw-bold' : 'text-muted'}>
                        {employee.scheduler.formatted_start_time || '—'}
                      </td>
                      <td className={employee.scheduler.formatted_end_time ? 'text-success fw-bold' : 'text-muted'}>
                        {employee.scheduler.formatted_end_time || '—'}
                      </td>
                      <td className={employee.scheduler.workday_duration ? 'text-success fw-bold' : 'text-muted'}>
                        {employee.scheduler.workday_duration || '—'}
                      </td>
                      <td>{getVacationBadge(employee.vacation)}</td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <Button 
  variant="outline-primary" 
  size="sm" 
  title="Просмотр деталей"
  onClick={() => openEmployeeModal(employee)}
>
  <i className="fas fa-eye"></i>
</Button>
                          
                          {employee.bitrix_status === 'OPENED' ? (
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              title="Завершить день"
                              onClick={() => handleManageDay(employee.id, 'stop')}
                              disabled={isStopLoading || isStartLoading}
                            >
                              {isStopLoading ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="fas fa-stop"></i>
                              )}
                            </Button>
                          ) : (
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              title="Начать день"
                              onClick={() => handleManageDay(employee.id, 'start')}
                              disabled={isStartLoading || isStopLoading}
                            >
                              {isStartLoading ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="fas fa-play"></i>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      <EmployeeDetailModal 
  show={showModal} 
  onHide={() => setShowModal(false)} 
  employee={selectedEmployee} 
/>
    </div>
  );
}

export default DepartmentPage;