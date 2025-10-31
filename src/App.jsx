import React, { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import AuthModal from './components/AuthModal'
import ReportsModal from './components/ReportsModal'
import WelcomeSetup from './components/WelcomeSetup'
import CreateOrganizationModal from './components/CreateOrganizationModal'
import OrganizationSelector from './components/OrganizationSelector'
import OrganizationsSettingsPanel from './components/OrganizationsSettingsPanel'
import InviteMembersModal from './components/InviteMembersModal'
import SettingsPanel from './components/SettingsPanel'
import FAQs from './components/FAQs'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext'
import './App.css'

const AppContent = () => {
  const [currentView, setCurrentView] = useState('home') // 'home', 'faqs'
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false)
  const [showOrgSettings, setShowOrgSettings] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [notification, setNotification] = useState(null)
  const { user, logout, isAuthenticated } = useAuth()
  const { needsSetup, currentOrganization, loading: orgLoading, refreshOrganizations, userOrganizations } = useOrganization()

  // Manejar hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#faqs') {
        setCurrentView('faqs')
      } else {
        setCurrentView('home')
      }
    }

    // Verificar hash inicial
    handleHashChange()

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleAuthClick = () => {
    setShowAuthModal(true)
  }

  const handleAuthSuccess = async () => {
    // El modal de auth maneja internamente el setup de organización
    // Solo necesitamos refrescar las organizaciones
    await refreshOrganizations()
  }

  const handleLogout = () => {
    logout()
  }

  const handleOrgCreated = (organization) => {
    setNotification({
      type: 'success',
      message: `✅ Tu organización "${organization.name}" fue creada con éxito.`
    })
  }


  // Si necesita setup y está autenticado, mostrar WelcomeSetup como pantalla completa
  // Solo si no está mostrando el modal de setup (para evitar conflicto)
  if (isAuthenticated && needsSetup && !orgLoading && !showAuthModal && !showCreateOrgModal && currentView === 'home') {
    return (
      <WelcomeSetup
        onCreateOrganization={() => setShowCreateOrgModal(true)}
        onJoinOrganization={() => {}}
      />
    )
  }

  // Mostrar página de FAQs
  if (currentView === 'faqs') {
    return (
      <>
        <FAQs onBack={() => {
          setCurrentView('home')
          window.location.hash = ''
        }} />
      </>
    )
  }

  return (
    <div className="site">
      <div className="beta-banner">🧪 Versión beta en pruebas. Los resultados y tiempos pueden variar.</div>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="site-header">
        <div className="site-header__left">
          <div className="brand">
            <span className="brand__logo">📊</span>
            <span className="brand__name">Empower <span>Reports</span></span>
          </div>
        </div>
        <nav className="site-nav">
          <a 
            className="nav-link" 
            href="#faqs"
            onClick={(e) => {
              e.preventDefault()
              setCurrentView('faqs')
              window.location.hash = 'faqs'
            }}
          >
            FAQs
          </a>
          <a 
            className="nav-link" 
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              if (currentView === 'faqs') {
                setCurrentView('home')
                window.location.hash = ''
                setTimeout(() => {
                  const element = document.getElementById('about')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              } else {
                const element = document.getElementById('about')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }
            }}
          >
            Quiénes somos
          </a>
          <a 
            className="nav-link" 
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              if (currentView === 'faqs') {
                setCurrentView('home')
                window.location.hash = ''
                setTimeout(() => {
                  const element = document.getElementById('contact')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              } else {
                const element = document.getElementById('contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }
            }}
          >
            Contacto
          </a>
        </nav>
        <div className="site-header__actions">
          {isAuthenticated && currentOrganization && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowInviteModal(true)}
              style={{ marginRight: '12px' }}
            >
              👥 Invitar colaboradores
            </button>
          )}
          <a className="btn btn-secondary" href="#docs">Ver documentación</a>
          {isAuthenticated ? (
            <div className="user-menu">
              {currentOrganization && <OrganizationSelector />}
              <button
                className="btn btn-secondary"
                onClick={() => setShowOrgSettings(true)}
                title="Configuración"
              >
                ⚙️
              </button>
              <span className="user-greeting">Hola, {user?.name}</span>
              <button className="btn btn-primary-light" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button className="btn btn-primary-light" onClick={handleAuthClick}>
              → Iniciar sesión
            </button>
          )}
        </div>
      </header>

      <main className="hero">
        <section className="hero__left">
          <h1 className="hero__title">Empower <span>Reports</span></h1>
          <p className="hero__subtitle">Documentá la lógica interna de reportes en Power BI de manera clara y navegable. Empoderá relevamientos, análisis y nuevos desarrollos.</p>

          <ul className="hero__bullets">
            <li className="bullet bad">No más depender del desarrollador original.</li>
            <li className="bullet bad">No más navegar Power Query como una caja negra.</li>
            <li className="bullet bad">No más documentación manual en Excel o Notion.</li>
            <li className="bullet good">Hacer ingeniería inversa es rápido y visual.</li>
            <li className="bullet good">Impulsa nuevos desarrollos con coherencia.</li>
            <li className="bullet good">Promueve la estandarización del DAX y el modelo.</li>
            <li className="bullet good">Mejora el trabajo colaborativo.</li>
          </ul>
        </section>

        <section className="hero__right">
          <div className="card info">
            <h3>Sobre el archivo .pbit</h3>
            <p>El archivo .pbit es la plantilla del reporte, contiene la estructura del modelo pero no los datos. Así, Empower Reports analiza tu lógica sin acceder a información sensible.</p>
          </div>

          <div className="card upload">
            <div className="upload__title">Arrastrá tu archivo .pbit aquí</div>
            <FileUpload compact={true} onAuthRequired={handleAuthClick} />
            <button 
              className="btn btn-primary-light full"
              onClick={() => setShowReportsModal(true)}
              style={{ marginTop: '12px' }}
            >
              📋 Ver Reportes
            </button>
            <button className="btn btn-secondary full">Ver Documentación</button>
          </div>

          <div className="card help" id="faqs">
            <h3>¿Cómo obtener tu .pbit?</h3>
            <ol>
              <li>Abrí el .pbix en Power BI Desktop.</li>
              <li>Archivo → Exportar → Plantilla de Power BI (.pbit).</li>
              <li>Guardá y arrastrá aquí.</li>
            </ol>
          </div>
        </section>
      </main>

      <section id="about" className="about-section">
        <div className="about-container">
          <h2 className="about-title">¿Quiénes somos?</h2>
          <div className="about-content">
            <p>Empower Reports nace de la experiencia directa con los desafíos de mantener y comprender modelos complejos de Power BI.</p>
            <p>Somos un equipo de desarrolladores y analistas que creemos que la documentación debe ser una herramienta de crecimiento, no un obstáculo.</p>
            <p>Creamos esta plataforma para hacer visible la lógica detrás de cada modelo, acelerar la colaboración y facilitar el trabajo técnico de quienes construyen reportes día a día.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="feedback-section">
        <div className="feedback-container">
          <h2 className="feedback-title">⭐ Queremos escuchar tu experiencia</h2>
          <p className="feedback-description">
            Este proyecto está en fase de pruebas. Contanos qué te pareció, qué podríamos mejorar o cómo debería evolucionar. 
            Cada comentario nos ayuda a construir una herramienta más útil para los usuarios de Power BI.
          </p>
          
          <form className="feedback-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input type="text" id="nombre" name="nombre" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input type="email" id="email" name="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="experiencia">Tu experiencia</label>
              <textarea 
                id="experiencia" 
                name="experiencia" 
                rows="4" 
                placeholder="Contanos qué te pareció, sugerencias, ideas...."
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-feedback">Enviar Feedback</button>
          </form>
          
          <div className="feedback-footer">
            <p>🧡 Gracias por ayudarnos a mejorar 💛</p>
            <p>Empower Reports está en beta: tu aporte tiene un impacto real.</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer__brand">Empower Reports</div>
        <div className="footer__legal">© 2024 Empower Reports. Todos los derechos reservados.</div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
      />


      <SettingsPanel
        isOpen={showOrgSettings}
        onClose={() => setShowOrgSettings(false)}
      />

      <InviteMembersModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSave={(data) => {
          console.log('Invitations saved:', data)
          setNotification({
            type: 'success',
            message: `✅ Invitaciones enviadas a ${data.emails.length} colaborador${data.emails.length > 1 ? 'es' : ''}`
          })
        }}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <AppContent />
      </OrganizationProvider>
    </AuthProvider>
  )
}

export default App
