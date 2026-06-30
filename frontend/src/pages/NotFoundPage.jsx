import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './NotFoundPage.css'

function NotFoundPage() {
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
    <div className="not-found-page">
      <div className="folder">
        <div className="paperclip">📎</div>

        <div className="folder-header">
          <span className="file-number">№ 404-MISSING</span>
          <span className="classification">УТЕРЯНО</span>
        </div>

        <div className="search-icon">🔍</div>

        <div className="doc-line long"></div>
        <div className="doc-line medium"></div>
        <div className="doc-line long erased"></div>
        <div className="doc-line short erased"></div>
        <div className="doc-line long"></div>
        <div className="doc-line medium"></div>
        <div className="doc-line long"></div>

        <div className="stamp">FILE NOT FOUND</div>

        <div className="message">
          <h2>Страница отсутствует</h2>
          <p>Такой страницы нет в данном приложении<br />Возможно, она была удалена или перемещена.</p>
          <button className="btn" onClick={handleGoHome}>
            ВЕРНУТЬСЯ НА ГЛАВНУЮ
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage