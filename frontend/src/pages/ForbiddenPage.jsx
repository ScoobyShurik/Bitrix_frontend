import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForbiddenPage.css'

function ForbiddenPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const folder = document.querySelector('.folder')
    if (folder) {
      folder.style.opacity = '0'
      folder.style.transform = 'rotate(-2deg) translateY(20px)'

      setTimeout(() => {
        folder.style.transition = 'all 0.5s ease'
        folder.style.opacity = '1'
        folder.style.transform = 'rotate(-2deg) translateY(0)'
      }, 100)
    }
  }, [])

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="forbidden-page">
      <div className="folder">
        <div className="paperclip">📎</div>

        <div className="folder-header">
          <span className="file-number">№ 403-RESTRICTED</span>
          <span className="classification">FORBIDDEN</span>
        </div>

        <div className="lock-icon">🔒</div>

        <div className="doc-line long"></div>
        <div className="doc-line medium"></div>
        <div className="doc-line long redacted"></div>
        <div className="doc-line short redacted"></div>
        <div className="doc-line long"></div>
        <div className="doc-line medium redacted"></div>
        <div className="doc-line long"></div>

        <div className="stamp">ACCESS DENIED</div>

        <div className="message">
          <h2>Страница недоступна</h2>
          <p>У вас нет прав для просмотра этой страницы</p>
          <button className="btn" onClick={handleGoHome}>
            ВЕРНУТЬСЯ НА ГЛАВНУЮ
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForbiddenPage