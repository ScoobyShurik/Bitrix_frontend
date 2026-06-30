import { useState } from 'react'
import { NavDropdown } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import ProfileSettingsModal from './ProfileSettingsModal'

function Layout({ children, user, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    navigate('/login');
  };

  // 👇 ИСПРАВЛЕНО: используем newData вместо updatedUser
  const handleSaveSettings = (newData) => {
    if (onUpdateUser) {
      onUpdateUser(newData);
    }
  };

  if (!user) {
    return (
      <div className="container-fluid">
        <main className="container mt-4">
          {children}
        </main>
      </div>
    );
  }

  const isManager = user.post?.is_manager || false;
  const isStaff = user.is_staff || false;

  return (
    <>
      <header className="p-3 text-bg-dark">
        <div className="container-fluid">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            
            <div className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              <Link to="/" className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
                <img src="/images/favicon.svg" alt="" style={{ height: '32px' }} />
                <h3 className="ms-2 mt-2">Рабочее время</h3>
              </Link>

              <ul className="nav col-12 col-lg-auto mb-2 justify-content-center mb-md-0 ms-lg-5 mt-lg-2">
                {(isManager || isStaff) && (
                  <li><Link to="/department" className="nav-link px-2 text-white">Отдел</Link></li>
                )}
                {(isManager || isStaff) && (
                <li><Link to="/vacations" className="nav-link px-2 text-white">Отпуска</Link></li>
                )}
                <li><Link to="/schedule" className="nav-link px-2 text-white">График</Link></li>
                <li><Link to="/reports" className="nav-link px-2 text-white">Отчёты</Link></li>
              </ul>
            </div>

            <div className="text-end">
              <NavDropdown
                title={user.name || 'Пользователь'}
                id="userDropdown"
                align="end"
                className="text-white"
              >
                <NavDropdown.Item onClick={() => setShowSettings(true)}>
                  <i className="fas fa-user me-2"></i> Редактировать профиль
                </NavDropdown.Item>

                {isStaff && (
                  <NavDropdown.Item as={Link} to="/admin">
                    <i className="fas fa-cog me-2"></i> Админка
                  </NavDropdown.Item>
                )}

                <NavDropdown.Divider />

                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="fas fa-sign-out-alt me-2"></i> Выйти
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid">
        <main className="container mt-4">
          {children}
        </main>
      </div>

      <ProfileSettingsModal
        show={showSettings}
        onHide={() => setShowSettings(false)}
        user={user}
        onSave={handleSaveSettings}
      />
    </>
  );
}

export default Layout;