import { useState, useEffect } from 'react'
import { Card, Button, Badge, Spinner, Alert, Accordion } from 'react-bootstrap'
import { getVacationIcon, getVacationColor } from '../utils/vacationIcons'
import { api } from '../services/api'
import { formatDateRange } from '../utils/dateFormatter'
import AddAbsenceModal from '../components/AddAbsenceModal'

function VacationsPage() {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  const [departments, setDepartments] = useState({})
  const [vacationTypes, setVacationTypes] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  // 👇 ДОБАВЛЕНО: состояние для редактируемого отсутствия
  const [editingAbsence, setEditingAbsence] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [stats, absences] = await Promise.all([
        api.getAbsenceStatistics(),
        api.getAbsencesByDepartment()
      ])
      
      setStatistics(stats)
      setDepartments(absences.departments)
      setVacationTypes(absences.vacation_types)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      showToast('danger', 'Ошибка', err.message)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (variant, title, message) => {
    setToast({ variant, title, message })
    setTimeout(() => setToast(null), 3000)
  }

  const recalculateStatistics = (newDepartments) => {
    let vacation = 0, sick = 0, idle = 0, all = 0;
    
    Object.values(newDepartments).forEach(employees => {
      employees.forEach(emp => {
        all++;
        emp.vacations.forEach(vac => {
          if (vac.type_id === 1 || vac.type_id === 3 || vac.type_id === 5 || vac.type_id === 7) vacation++;
          else if (vac.type_id === 2) sick++;
          else if (vac.type_id === 6 || vac.type_id === 8) idle++;
        });
      });
    });

    return { vacation, sick, idle, all };
  }

  // 👇 ИСПРАВЛЕНО: функция на верхнем уровне
  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditMode(false)
    setEditingAbsence(null)
  }

  const handleEditAbsence = (vacation, employee) => {
    setEditingAbsence({
      absence_id: vacation.id,
      employee_id: employee.id,
      employee_name: employee.name,
      vacation_type: vacation.type_id,
      start_date: vacation.date_from,
      end_date: vacation.date_to
    })
    setEditMode(true)
    setShowAddModal(true)
  }

  const handleSaveAbsence = async (absenceData) => {
    try {
      let response;
      
      if (editMode && editingAbsence) {
        // Режим редактирования
        response = await api.updateAbsence(editingAbsence.absence_id, absenceData)
        
        const newDepartments = { ...departments }
        const departmentEmployees = newDepartments[response.department]
        
        if (departmentEmployees) {
          const employeeIndex = departmentEmployees.findIndex(emp => emp.id === response.employee_id)
          
          if (employeeIndex !== -1) {
            const updatedEmployee = {
              ...departmentEmployees[employeeIndex],
              vacations: departmentEmployees[employeeIndex].vacations.map(vac =>
                vac.id === editingAbsence.absence_id ? response.absence : vac
              )
            }
            
            const updatedEmployees = [...departmentEmployees]
            updatedEmployees[employeeIndex] = updatedEmployee
            newDepartments[response.department] = updatedEmployees
            
            setDepartments(newDepartments)
            setStatistics(recalculateStatistics(newDepartments))
          }
        }
        
        showToast('success', 'Успех', 'Отсутствие обновлено')
      } else {
        // Режим добавления
        response = await api.addAbsence(absenceData)
        
        const newDepartments = { ...departments }
        const departmentEmployees = newDepartments[response.department]
        
        if (departmentEmployees) {
          const employeeIndex = departmentEmployees.findIndex(emp => emp.id === response.employee_id)
          
          if (employeeIndex !== -1) {
            const updatedEmployee = {
              ...departmentEmployees[employeeIndex],
              vacations: [...departmentEmployees[employeeIndex].vacations, response.absence]
            }
            
            const updatedEmployees = [...departmentEmployees]
            updatedEmployees[employeeIndex] = updatedEmployee
            newDepartments[response.department] = updatedEmployees
            
            setDepartments(newDepartments)
            setStatistics(recalculateStatistics(newDepartments))
          }
        }
        
        showToast('success', 'Успех', 'Отсутствие успешно добавлено')
      }
      
      setShowAddModal(false)
      setEditMode(false)
      setEditingAbsence(null)
    } catch (err) {
      throw err
    }
  }

  const handleDeleteAbsence = async (absenceId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это отсутствие?')) {
      return
    }

    setDeletingId(absenceId)
    try {
      const response = await api.deleteAbsence(absenceId)
      
      const newDepartments = { ...departments }
      const departmentEmployees = newDepartments[response.department]
      
      if (departmentEmployees) {
        const employeeIndex = departmentEmployees.findIndex(emp => emp.id === response.employeeId)
        
        if (employeeIndex !== -1) {
          const updatedEmployee = {
            ...departmentEmployees[employeeIndex],
            vacations: departmentEmployees[employeeIndex].vacations.filter(
              vac => vac.id !== response.absenceId
            )
          }
          
          const updatedEmployees = [...departmentEmployees]
          updatedEmployees[employeeIndex] = updatedEmployee
          newDepartments[response.department] = updatedEmployees
          
          setDepartments(newDepartments)
          setStatistics(recalculateStatistics(newDepartments))
        }
      }
      
      showToast('success', 'Успех', 'Отсутствие удалено')
    } catch (err) {
      showToast('danger', 'Ошибка', err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3 text-muted">Загрузка данных отсутствий...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-4">
      {/* Toast уведомление */}
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

      {/* Заголовок и кнопки */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2><i className="fas fa-calendar3"></i> Отсутствия сотрудников</h2>
        </div>
        <div className="col-auto">
          <Button variant="secondary">
            <i className="fa fa-list-alt"></i> Все данные
          </Button>
        </div>
        <div className="col-auto">
          <Button variant="primary" onClick={() => { setEditMode(false); setEditingAbsence(null); setShowAddModal(true); }}>
            <i className="fas fa-plus-circle"></i> Добавить отсутствие
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card bg="primary" text="white">
            <Card.Body>
              <h6 className="card-title">В отпуске</h6>
              <h3 className="mb-0">{statistics?.vacation || 0}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card bg="danger" text="white">
            <Card.Body>
              <h6 className="card-title">На больничном</h6>
              <h3 className="mb-0">{statistics?.sick || 0}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card bg="success" text="white">
            <Card.Body>
              <h6 className="card-title">Отгулы</h6>
              <h3 className="mb-0">{statistics?.idle || 0}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card bg="secondary" text="white">
            <Card.Body>
              <h6 className="card-title">Всего сотрудников</h6>
              <h3 className="mb-0">{statistics?.all || 0}</h3>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Отделы с сотрудниками */}
      {Object.entries(departments).map(([deptName, employees]) => (
        <Card key={deptName} className="mb-4">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0"><i className="fas fa-building"></i> {deptName}</h5>
            <Badge bg="secondary">{employees.length} сотрудников</Badge>
          </Card.Header>
          <Card.Body className="p-0">
            <Accordion>
              {employees.map((emp) => (
                <Accordion.Item key={emp.id} eventKey={emp.id.toString()}>
                  <Accordion.Header>
                    <div className="d-flex align-items-center w-100">
                      <div className="flex-grow-1">
                        <strong>{emp.name}</strong>
                        <small className="text-muted ms-2">{emp.post}</small>
                      </div>
                      <div className="me-3">
                        {emp.vacations.length > 0 ? (
                          <Badge bg="primary">{emp.vacations.length} отсутствий</Badge>
                        ) : (
                          <Badge bg="success">✓ Нет отсутствий</Badge>
                        )}
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    {emp.vacations.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Тип отсутствия</th>
                              <th>Период</th>
                              <th>Дней</th>
                              <th className="text-end">Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emp.vacations.map((vac) => (
                              <tr key={vac.id}>
                                <td>
                                  <Badge bg={getVacationColor(vac.type_id)} text={vac.type_id === 1 || vac.type_id === 3 || vac.type_id === 5 || vac.type_id === 7 ? 'dark' : null}>
                                    <i className={`fas ${getVacationIcon(vac.type_id)} me-1`}></i>
                                    {vac.type}
                                  </Badge>
                                </td>
                                <td>{formatDateRange(vac.date_from, vac.date_to)}</td>
                                <td>{vac.duration} дн.</td>
                                <td className="text-end">
                                  <div className="btn-group btn-group-sm">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleEditAbsence(vac, emp)}
                                      title="Редактировать"
                                    >
                                      <i className="fa fa-pencil"></i>
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleDeleteAbsence(vac.id)}
                                      disabled={deletingId !== null}
                                      title="Удалить"
                                    >
                                      {deletingId === vac.id ? (
                                        <Spinner animation="border" size="sm" />
                                      ) : (
                                        <i className="fa fa-trash"></i>
                                      )}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-muted">
                        <i className="fas fa-check-circle" style={{ fontSize: '1.5rem' }}></i>
                        <p className="mb-0 mt-2">Нет запланированных отсутствий</p>
                      </div>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card.Body>
        </Card>
      ))}

      <AddAbsenceModal
        show={showAddModal}
        onHide={handleCloseModal}
        departments={departments}
        vacationTypes={vacationTypes}
        onSave={handleSaveAbsence}
        editMode={editMode}
        editingAbsence={editingAbsence}
      />
    </div>
  )
}

export default VacationsPage