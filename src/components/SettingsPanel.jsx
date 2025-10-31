import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../contexts/OrganizationContext'
import './SettingsPanel.css'

const SettingsPanel = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('profile')
  const { user, logout } = useAuth()
  const { currentOrganization } = useOrganization()

  // Perfil state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    language: 'es',
    timezone: 'GMT-3',
    theme: 'light'
  })

  if (!isOpen) return null

  const sections = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'security', label: 'Seguridad y Sesión', icon: '🔐' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'organization', label: 'Organización', icon: '🏢' },
    { id: 'billing', label: 'Facturación y Plan', icon: '💳' },
    { id: 'limits', label: 'Límite y Uso', icon: '📊' },
    { id: 'integrations', label: 'Integraciones', icon: '🔌' },
    { id: 'preferences', label: 'Preferencias', icon: '⚙️' }
  ]

  const handleSaveProfile = () => {
    // Aquí guardarías los cambios
    console.log('Saving profile:', profileData)
  }

  const handleCloseOtherSessions = () => {
    // Lógica para cerrar otras sesiones
    console.log('Closing other sessions')
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="settings-section">
            <h2>Perfil</h2>
            <p className="settings-description">Configuración individual, visible para todos los roles</p>
            
            <form className="settings-form">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Gonzalo Figlioli Ladux"
                />
                <small>Se muestra en reportes o dashboard</small>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="disabled-input"
                />
                <small>Read-only si viene de Google/LinkedIn</small>
              </div>

              <div className="form-group">
                <label>Foto / Avatar</label>
                <div className="avatar-upload">
                  <div className="avatar-preview">👤</div>
                  <button type="button" className="btn-upload">Subir imagen</button>
                </div>
              </div>

              <div className="form-group">
                <label>Idioma</label>
                <select
                  value={profileData.language}
                  onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>

              <div className="form-group">
                <label>Zona horaria</label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                >
                  <option value="GMT-3">GMT-3 (Argentina)</option>
                  <option value="GMT-5">GMT-5 (Colombia, Perú)</option>
                  <option value="GMT-6">GMT-6 (México)</option>
                  <option value="GMT-0">GMT+0 (UTC)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tema visual</label>
                <select
                  value={profileData.theme}
                  onChange={(e) => setProfileData({ ...profileData, theme: e.target.value })}
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary">Deshacer</button>
                <button type="button" className="btn-primary" onClick={handleSaveProfile}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        )

      case 'security':
        return (
          <div className="settings-section">
            <h2>Seguridad y Sesión</h2>
            <p className="settings-description">Para manejo de autenticación y sesiones activas</p>

            <div className="security-card">
              <h3>Cuentas vinculadas</h3>
              <div className="linked-account">
                <span>🔵 Google</span>
                <span className="account-status">Conectada</span>
              </div>
              <button type="button" className="btn-link">Desvincular cuenta</button>
            </div>

            <div className="security-card">
              <h3>Sesiones activas</h3>
              <div className="session-item">
                <div>
                  <strong>Dispositivo actual</strong>
                  <small>Windows · Chrome · Última actividad: hace 5 min</small>
                </div>
                <span className="badge-active">Activa</span>
              </div>
              <div className="session-item">
                <div>
                  <strong>iPhone 13</strong>
                  <small>iOS · Safari · Última actividad: hace 2 días</small>
                </div>
                <span className="badge-active">Activa</span>
              </div>
              <button type="button" className="btn-secondary" onClick={handleCloseOtherSessions}>
                Cerrar todas menos esta
              </button>
            </div>

            <div className="security-card">
              <h3>Autenticación en dos pasos</h3>
              <p>Agregá una capa extra de seguridad a tu cuenta</p>
              <button type="button" className="btn-secondary">Activar 2FA</button>
            </div>

            {profileData.email && !user?.authProvider && (
              <div className="security-card">
                <h3>Cambiar contraseña</h3>
                <button type="button" className="btn-secondary">Cambiar contraseña</button>
              </div>
            )}
          </div>
        )

      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notificaciones</h2>
            <p className="settings-description">Controlá cómo y cuándo recibís notificaciones</p>

            <div className="notification-group">
              <h3>Email</h3>
              <label className="toggle-label">
                <input type="checkbox" defaultChecked />
                <span>Invitaciones a organizaciones</span>
              </label>
              <label className="toggle-label">
                <input type="checkbox" defaultChecked />
                <span>Nuevos reportes compartidos</span>
              </label>
              <label className="toggle-label">
                <input type="checkbox" />
                <span>Actualizaciones de plan</span>
              </label>
            </div>

            <div className="notification-group">
              <h3>In-app</h3>
              <label className="toggle-label">
                <input type="checkbox" defaultChecked />
                <span>Notificaciones en tiempo real</span>
              </label>
            </div>
          </div>
        )

      case 'organization':
        return (
          <div className="settings-section">
            <h2>Organización</h2>
            {currentOrganization ? (
              <>
                <div className="form-group">
                  <label>Nombre de la organización</label>
                  <input type="text" value={currentOrganization.name || ''} />
                  <button type="button" className="btn-primary" style={{ marginTop: '12px' }}>
                    Actualizar nombre
                  </button>
                </div>

                <div className="organization-section">
                  <div className="section-header">
                    <h3>Miembros</h3>
                    <button type="button" className="btn-primary">Invitar miembros</button>
                  </div>
                  <p className="settings-description">
                    Administrá los miembros de tu organización y sus permisos
                  </p>
                </div>

                <div className="organization-section">
                  <h3>Roles y permisos</h3>
                  <div className="role-info">
                    <div className="role-item">
                      <strong>Admin</strong>
                      <p>Acceso completo, puede invitar y eliminar miembros</p>
                    </div>
                    <div className="role-item">
                      <strong>Miembro</strong>
                      <p>Puede crear y editar reportes</p>
                    </div>
                    <div className="role-item">
                      <strong>Viewer</strong>
                      <p>Solo lectura de reportes</p>
                    </div>
                  </div>
                </div>

                <div className="organization-section danger-zone">
                  <h3>Eliminación de organización</h3>
                  <p>Esta acción no se puede deshacer. Todos los reportes y datos serán eliminados permanentemente.</p>
                  <button type="button" className="btn-danger">Eliminar esta organización</button>
                </div>
              </>
            ) : (
              <div className="no-org-message">
                <p>No pertenecés a una organización. Creá una o unite a una existente.</p>
                <button type="button" className="btn-primary">Crear organización</button>
              </div>
            )}
          </div>
        )

      case 'billing':
        return (
          <div className="settings-section">
            <h2>Facturación y Plan</h2>
            <p className="settings-description">Control de suscripción, pagos y upgrades</p>

            <div className="billing-card">
              <div className="billing-header">
                <div>
                  <h3>Plan actual</h3>
                  <p className="plan-name">Free Trial</p>
                </div>
                <span className="badge-active">Activo</span>
              </div>
              <div className="billing-details">
                <div>
                  <small>Fecha de vencimiento</small>
                  <p>10 de diciembre de 2025</p>
                </div>
                <div>
                  <small>Límite de usuarios / reportes</small>
                  <p>3/10 usuarios · 87/300 reportes</p>
                </div>
              </div>
            </div>

            <div className="billing-card">
              <h3>Método de pago</h3>
              <p>No hay método de pago configurado</p>
              <button type="button" className="btn-secondary">Agregar método de pago</button>
            </div>

            <div className="billing-card">
              <h3>Historial de facturación</h3>
              <p className="settings-description">Todavía no hay facturas registradas</p>
            </div>

            <div className="billing-actions">
              <button type="button" className="btn-primary">Actualizar plan</button>
              <button type="button" className="btn-secondary">Cancelar suscripción</button>
            </div>

            <p className="billing-note">
              Podés cambiar o cancelar tu plan cuando quieras. Tus datos se conservan por 30 días.
            </p>
          </div>
        )

      case 'limits':
        return (
          <div className="settings-section">
            <h2>Límite y Uso</h2>
            <p className="settings-description">Transparencia total sobre tus recursos</p>

            <div className="usage-card">
              <div className="usage-header">
                <h3>Reportes subidos</h3>
                <span className="usage-count">87 / 100</span>
              </div>
              <div className="usage-bar">
                <div className="usage-bar-fill" style={{ width: '87%' }}></div>
              </div>
              <small>87% utilizado</small>
            </div>

            <div className="usage-card">
              <div className="usage-header">
                <h3>Usuarios activos</h3>
                <span className="usage-count">3 / 10</span>
              </div>
              <div className="usage-bar">
                <div className="usage-bar-fill" style={{ width: '30%', backgroundColor: '#4CAF50' }}></div>
              </div>
              <small>30% utilizado</small>
            </div>

            <div className="usage-card">
              <div className="usage-header">
                <h3>Almacenamiento total</h3>
                <span className="usage-count">1.2 GB / 5 GB</span>
              </div>
              <div className="usage-bar">
                <div className="usage-bar-fill" style={{ width: '24%', backgroundColor: '#4CAF50' }}></div>
              </div>
              <small>24% utilizado</small>
            </div>

            <div className="usage-alert">
              ⚠️ Estás cerca del límite de reportes. Considerá actualizar tu plan.
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="settings-section">
            <h2>Integraciones</h2>
            <p className="settings-description">Conectá Empower Reports con otras herramientas</p>

            <div className="integration-list">
              <div className="integration-item">
                <div>
                  <strong>Power BI Service</strong>
                  <p>Conectá directamente con tu workspace de Power BI</p>
                </div>
                <button type="button" className="btn-secondary">Conectar</button>
              </div>
              <div className="integration-item">
                <div>
                  <strong>Slack</strong>
                  <p>Recibí notificaciones de reportes en tus canales</p>
                </div>
                <button type="button" className="btn-secondary">Conectar</button>
              </div>
              <div className="integration-item">
                <div>
                  <strong>Microsoft Teams</strong>
                  <p>Integración con Teams para colaboración</p>
                </div>
                <button type="button" className="btn-secondary">Conectar</button>
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="settings-section">
            <h2>Preferencias</h2>
            <p className="settings-description">Personalizá tu experiencia en Empower Reports</p>

            <div className="form-group">
              <label>Formato de fecha</label>
              <select defaultValue="dd/mm/yyyy">
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="form-group">
              <label>Formato de número</label>
              <select defaultValue="es">
                <option value="es">1.234,56 (Español)</option>
                <option value="en">1,234.56 (Inglés)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input type="checkbox" defaultChecked />
                <span>Mostrar sugerencias y tips</span>
              </label>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input type="checkbox" defaultChecked />
                <span>Animaciones y transiciones</span>
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-sidebar">
          <div className="settings-header">
            <h2>Settings</h2>
            <button className="settings-close" onClick={onClose}>×</button>
          </div>
          <nav className="settings-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel

