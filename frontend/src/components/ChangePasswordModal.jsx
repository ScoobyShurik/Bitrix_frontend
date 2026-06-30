import { useState } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { api } from '../services/api'

function ChangePasswordModal({ show, onHide }) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password1: '',
    new_password2: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // 👈 Состояние загрузки

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.old_password) {
      newErrors.old_password = 'Введите текущий пароль';
    }

    if (!formData.new_password1) {
      newErrors.new_password1 = 'Введите новый пароль';
    } else if (formData.new_password1.length < 8) {
      newErrors.new_password1 = 'Пароль должен содержать минимум 8 символов';
    }

    if (!formData.new_password2) {
      newErrors.new_password2 = 'Подтвердите новый пароль';
    } else if (formData.new_password1 !== formData.new_password2) {
      newErrors.new_password2 = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true); // 👈 Начинаем загрузку

    try {
      // 👇 Вызываем API метод
      await api.changePassword(formData.old_password, formData.new_password1);

      setSuccessMessage('Пароль успешно изменен!');
      
      setFormData({
        old_password: '',
        new_password1: '',
        new_password2: ''
      });

      setTimeout(() => {
        setSuccessMessage('');
        onHide();
      }, 2000);
    } catch (err) {
      console.error('Ошибка смены пароля:', err);
      setErrors({ general: err.message || 'Ошибка при смене пароля' });
    } finally {
      setLoading(false); // 👈 Завершаем загрузку
    }
  };

  const handleClose = () => {
    setFormData({
      old_password: '',
      new_password1: '',
      new_password2: ''
    });
    setErrors({});
    setSuccessMessage('');
    setLoading(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-lock me-2"></i>
          Смена пароля
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {successMessage && (
          <Alert variant="success">
            {successMessage}
          </Alert>
        )}

        {errors.general && !successMessage && (
          <Alert variant="danger">
            {errors.general}
          </Alert>
        )}

        {Object.keys(errors).some(key => key !== 'general') && !successMessage && !errors.general && (
          <Alert variant="danger">
            Пожалуйста, исправьте ошибки ниже.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Текущий пароль</Form.Label>
            <Form.Control
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              isInvalid={!!errors.old_password}
              disabled={loading} // 👈 Блокируем поле во время загрузки
            />
            {errors.old_password && (
              <Form.Text className="text-danger">
                {errors.old_password}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Новый пароль</Form.Label>
            <Form.Control
              type="password"
              name="new_password1"
              value={formData.new_password1}
              onChange={handleChange}
              isInvalid={!!errors.new_password1}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Пароль должен содержать минимум 8 символов
            </Form.Text>
            {errors.new_password1 && (
              <Form.Text className="text-danger">
                {errors.new_password1}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Подтверждение нового пароля</Form.Label>
            <Form.Control
              type="password"
              name="new_password2"
              value={formData.new_password2}
              onChange={handleChange}
              isInvalid={!!errors.new_password2}
              disabled={loading}
            />
            {errors.new_password2 && (
              <Form.Text className="text-danger">
                {errors.new_password2}
              </Form.Text>
            )}
          </Form.Group>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              <i className="fas fa-arrow-left me-1"></i>Назад
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Смена пароля...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-1"></i>Сменить пароль
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ChangePasswordModal;