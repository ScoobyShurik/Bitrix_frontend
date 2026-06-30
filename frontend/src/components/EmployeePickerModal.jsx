import { useState, useEffect } from 'react'
import { Modal, Form, ListGroup, Spinner, Badge, Alert, Button } from 'react-bootstrap'
import { api } from '../services/api'

function EmployeePickerModal({ show, onHide, onSelect }) {
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [globalSearch, setGlobalSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (show) {
      loadEmployees()
    }
  }, [show])

  const loadEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getAllEmployees()
      setEmployees(data.employees)
      setDepartments(data.departments)
    } catch (err) {
      setError(err.message || 'Ошибка загрузки сотрудников')
    } finally {
      setLoading(false)
    }
  }

  // Фильтрация для глобального поиска
  const filteredGlobal = employees.filter(emp =>
    emp.name.toLowerCase().includes(globalSearch.toLowerCase())
  )

  // Фильтрация по отделу и поиску внутри отдела
  const filteredByDepartment = employees.filter(emp => {
    const matchesDept = !selectedDepartment || emp.department === selectedDepartment
    const matchesSearch = !departmentSearch || 
      emp.name.toLowerCase().includes(departmentSearch.toLowerCase())
    return matchesDept && matchesSearch
  })

  const handleSelect = (employee) => {
    onSelect(employee)
    // Сбрасываем состояние при закрытии
    setGlobalSearch('')
    setDepartmentSearch('')
    setSelectedDepartment('')
    onHide()
  }

  const handleClose = () => {
    setGlobalSearch('')
    setDepartmentSearch('')
    setSelectedDepartment('')
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header className="bg-primary text-white" closeButton closeVariant="white">
        <Modal.Title>
          <i className="fas fa-user-plus me-2"></i>
          Выбор сотрудника
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted">Загрузка сотрудников...</div>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <>
            {/* Глобальный поиск */}
            <div className="mb-4">
              <Form.Label className="fw-bold">
                <i className="fas fa-globe me-2"></i>Глобальный поиск
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Фамилия или имя..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                autoFocus
              />

              {globalSearch && (
                <ListGroup className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredGlobal.length > 0 ? (
                    filteredGlobal.map(emp => (
                      <ListGroup.Item
                        key={emp.id}
                        action
                        onClick={() => handleSelect(emp)}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-bold">{emp.name}</div>
                          <small className="text-muted">{emp.post}</small>
                        </div>
                        <Badge bg="secondary">{emp.department}</Badge>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item className="text-muted text-center">
                      Ничего не найдено
                    </ListGroup.Item>
                  )}
                </ListGroup>
              )}
            </div>

            <hr />

            {/* Выбор отдела */}
            <div className="mb-3">
              <Form.Label className="fw-bold">Подразделение</Form.Label>
              <Form.Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">-- Все отделы --</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </div>

            {/* Поиск внутри отдела */}
            {selectedDepartment && (
              <div className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Поиск в подразделении..."
                  value={departmentSearch}
                  onChange={(e) => setDepartmentSearch(e.target.value)}
                />
              </div>
            )}

            {/* Список сотрудников отдела */}
            {(selectedDepartment || !globalSearch) && (
              <div>
                <Form.Label className="fw-bold">
                  Сотрудники
                  {selectedDepartment && (
                    <Badge bg="secondary" className="ms-2">
                      {filteredByDepartment.length}
                    </Badge>
                  )}
                </Form.Label>
                <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredByDepartment.length > 0 ? (
                    filteredByDepartment.map(emp => (
                      <ListGroup.Item
                        key={emp.id}
                        action
                        onClick={() => handleSelect(emp)}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-bold">{emp.name}</div>
                          <small className="text-muted">{emp.post}</small>
                        </div>
                        {!selectedDepartment && (
                          <Badge bg="secondary">{emp.department}</Badge>
                        )}
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item className="text-muted text-center">
                      Нет сотрудников
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EmployeePickerModal