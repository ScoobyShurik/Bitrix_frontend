import { useState } from 'react'
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import ChangePasswordModal from './ChangePasswordModal'
import { api } from '../services/api'
import { saveUser } from '../utils/auth'

function ProfileSettingsModal({ show, onHide, user, onSave }) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    start_time: user.start_time || '09:00',
    stop_time: user.stop_time || '18:00',
    timezone: user.timezone || 'Asia/Krasnoyarsk',
    manage_workday: user.manage_workday ?? true,
    manage_start: user.manage_start ?? true,
    manage_stop: user.manage_stop ?? true,
    bitrix_token: user.bitrix_token || '',
    bitrix_id: user.bitrix_id || '',
    bitrix_status: user.bitrix_status || 'UNKNOWN'
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.updateProfile(formData);
      
      if (response.success) {
        // 👇 ИСПРАВЛЕНО: используем response.user вместо updatedUser
        saveUser(response.user);
        
        setMessage({ type: 'success', text: 'Настройки успешно сохранены!' });
        
        // 👇 Передаём response.user в callback
        if (onSave) {
          onSave(response.user);
        }

        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setMessage({ 
        type: 'danger', 
        text: err.message || 'Ошибка при сохранении настроек' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-user-cog me-2"></i>
            Настройки профиля
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {message && (
            <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <h5 className="mb-3">
              <i className="fas fa-address-card me-2 text-muted"></i>
              Общие данные
            </h5>
            
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Имя</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Фамилия</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>

            <h5 className="mb-3 mt-4">
              <i className="fas fa-clock me-2 text-muted"></i>
              Рабочий день
            </h5>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Время начала</Form.Label>
                <Form.Control
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Время окончания</Form.Label>
                <Form.Control
                  type="time"
                  name="stop_time"
                  value={formData.stop_time}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Часовой пояс</Form.Label>
              <Form.Select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Asia/Krasnoyarsk">Красноярск (UTC+7)</option>
                <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
                <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                <option value="Europe/Moscow">Москва (UTC+3)</option>
                <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="manage_workday"
                  name="manage_workday"
                  label="Управлять рабочим днем"
                  checked={formData.manage_workday}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="manage_start"
                  name="manage_start"
                  label="Управлять началом"
                  checked={formData.manage_start}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="manage_stop"
                  name="manage_stop"
                  label="Управлять окончанием"
                  checked={formData.manage_stop}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Col>
            </Row>

            <h5 className="mb-3 mt-4">
              <i className="fas fa-link me-2 text-muted"></i>
              Интеграции
            </h5>

            <Form.Group className="mb-3">
              <Form.Label>Токен Битрикс24</Form.Label>
              <Form.Control
                type="text"
                name="bitrix_token"
                value={formData.bitrix_token}
                onChange={handleChange}
                placeholder="Введите токен"
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Токен для интеграции с Битрикс24
              </Form.Text>
            </Form.Group>

            <Row>
              <Col className="mb-3">
                <Form.Label>ID пользователя Битрикс24</Form.Label>
                <Form.Control
                  type="text"
                  name="bitrix_id"
                  value={formData.bitrix_id}
                  onChange={handleChange}
                  placeholder="Например: 123"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  ID пользователя из Битрикс24
                </Form.Text>
              </Col>
              <Col className="mb-3">
                <Form.Label>Статус Битрикс24</Form.Label>
                <Form.Control
                  type="text"
                  name="bitrix_status"
                  value={formData.bitrix_status}
                  onChange={handleChange}
                  disabled
                />
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={onHide} disabled={loading}>
                <i className="fas fa-arrow-left me-1"></i>Отмена
              </Button>
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>Сохранить
                  </>
                )}
              </Button>
            </div>

            <hr className="my-3" />

            <div className="text-center">
              <Button variant="outline-primary" onClick={() => setShowChangePassword(true)} disabled={loading}>
                <i className="fas fa-key me-1"></i>Сменить пароль
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ChangePasswordModal
        show={showChangePassword}
        onHide={() => setShowChangePassword(false)}
      />
    </>
  );
}

export default ProfileSettingsModal;