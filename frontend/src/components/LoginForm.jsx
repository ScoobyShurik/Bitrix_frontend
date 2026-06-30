import { useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { api } from '../services/api'

function LoginForm({ onLogin }) {
  const [loginInput, setLoginInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await api.login(loginInput, passwordInput)
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ width: '400px' }} className="shadow">
      <Card.Header className="bg-primary text-white text-center">
        <h3>Вход в систему</h3>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Логин</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Введите логин" 
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Введите пароль" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>

          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Вход...
                </>
              ) : 'Войти'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default LoginForm