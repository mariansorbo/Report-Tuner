import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../contexts/OrganizationContext'
import './AuthModal.css'

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [step, setStep] = useState('auth') // 'auth', 'org-setup', 'create-org', 'join-org', 'join-confirm'
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [orgName, setOrgName] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [invitationPreview, setInvitationPreview] = useState(null)
  
  const { login, register, loading, isAuthenticated } = useAuth()
  const { createOrganization, joinOrganization, archiveAndJoin, keepBothOrganizations, needsSetup, loading: orgLoading } = useOrganization()

  // Reset cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setStep('auth')
      setError('')
      setSuccess('')
      setFormData({ email: '', password: '', confirmPassword: '' })
      setOrgName('')
      setInvitationCode('')
      setInvitationPreview(null)
    }
  }, [isOpen])

  // Si está autenticado y necesita setup, mostrar opciones de organización
  useEffect(() => {
    if (isAuthenticated && needsSetup && !orgLoading && step === 'auth') {
      setStep('org-setup')
    }
    // Si no está autenticado, siempre mostrar paso de auth
    if (!isAuthenticated && step !== 'auth') {
      setStep('auth')
    }
  }, [isAuthenticated, needsSetup, orgLoading, step])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      let result
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData.email, formData.password, formData.confirmPassword)
      }

      if (result.success) {
        setSuccess(isLogin ? '¡Inicio de sesión exitoso!' : '¡Cuenta creada exitosamente!')
        // No cerrar el modal, esperar a que el useEffect detecte needsSetup
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Error inesperado. Intenta nuevamente.')
    }
  }

  const handleCreateOrg = async (e) => {
    e.preventDefault()
    setError('')

    // Validar autenticación
    if (!isAuthenticated) {
      setError('Debes estar autenticado para crear una organización')
      setStep('auth')
      return
    }

    if (!orgName.trim()) {
      setError('El nombre de la organización es requerido')
      return
    }

    if (orgName.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }

    const result = await createOrganization(orgName.trim())
    
    if (result.success) {
      if (onAuthSuccess) {
        onAuthSuccess()
      }
      onClose()
    } else {
      setError(result.error || 'Error al crear organización')
    }
  }

  const handleJoinValidate = async (e) => {
    e.preventDefault()
    setError('')
    setInvitationPreview(null)

    if (!invitationCode.trim()) {
      setError('Por favor ingresá el código de invitación')
      return
    }

    const result = await joinOrganization(invitationCode.trim())
    
    if (result.success) {
      if (result.hasExistingOrganization) {
        // Mostrar confirmación
        setInvitationPreview(result)
        setStep('join-confirm')
      } else {
        // Unirse directamente
        if (onAuthSuccess) {
          onAuthSuccess()
        }
        onClose()
      }
    } else {
      setError(result.error || 'Código de invitación inválido')
    }
  }

  const handleJoinDecision = async (action) => {
    let result
    if (action === 'archive') {
      result = await archiveAndJoin(
        invitationPreview.existingOrganization.id,
        invitationPreview.organization.id
      )
    } else {
      result = await keepBothOrganizations(invitationPreview.organization.id)
    }
    
    if (result.success) {
      if (onAuthSuccess) {
        onAuthSuccess()
      }
      onClose()
    } else {
      setError(result.error || 'Error al procesar la unión')
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setFormData({ email: '', password: '', confirmPassword: '' })
  }

  if (!isOpen) return null

  // Paso 1: Autenticación (Login/Registro)
  if (step === 'auth') {
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <button 
            className="auth-modal-close" 
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            type="button"
          >
            ×
          </button>
          
          <div className="auth-modal-header">
            <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
            <p className="auth-modal-subtitle">
              {isLogin 
                ? 'Ingresa tus credenciales para acceder' 
                : 'Crea una cuenta para comenzar a usar Empower Reports'
              }
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Repite tu contraseña"
                  minLength="6"
                />
              </div>
            )}

            {error && (
              <div className="auth-error">
                ❌ {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                ✅ {success}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>

          <div className="auth-modal-footer">
            <p>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button 
                type="button" 
                className="auth-toggle-btn"
                onClick={toggleMode}
              >
                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Paso 2: Setup de organización (opciones)
  if (step === 'org-setup') {
    // Si no está autenticado, volver a auth
    if (!isAuthenticated) {
      setStep('auth')
      return null
    }
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal auth-modal-org-setup" onClick={(e) => e.stopPropagation()}>
          <button 
            className="auth-modal-close" 
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            type="button"
          >
            ×
          </button>
          
          <div className="auth-modal-header">
            <h2>Bienvenido a Empower Reports</h2>
            <p className="auth-modal-subtitle">
              Creá tu espacio de trabajo o unite al de tu equipo
            </p>
          </div>

          <div className="org-setup-options-container">
            <button 
              className="org-setup-option-btn org-setup-primary"
              onClick={() => setStep('create-org')}
            >
              <div className="org-setup-icon">➕</div>
              <div className="org-setup-content">
                <h3>Crear nueva organización</h3>
                <p>Empeza tu propio espacio de trabajo desde cero</p>
              </div>
            </button>

            <button 
              className="org-setup-option-btn org-setup-secondary"
              onClick={() => setStep('join-org')}
            >
              <div className="org-setup-icon">🔗</div>
              <div className="org-setup-content">
                <h3>Unirme a una organización existente</h3>
                <p>Tenés un código de invitación o link de invitación</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Paso 3: Crear organización
  if (step === 'create-org') {
    // Si no está autenticado, volver a auth
    if (!isAuthenticated) {
      setStep('auth')
      return null
    }
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <button 
            className="auth-modal-close" 
            onClick={(e) => {
              e.stopPropagation()
              setStep('org-setup')
            }}
            type="button"
          >
            ×
          </button>
          
          <div className="auth-modal-header">
            <h2>Crear Organización</h2>
            <p className="auth-modal-subtitle">
              Empezá tu espacio de trabajo desde cero
            </p>
          </div>

          <form onSubmit={handleCreateOrg} className="auth-form">
            <div className="form-group">
              <label htmlFor="org-name">Nombre de la organización</label>
              <input
                type="text"
                id="org-name"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value)
                  setError('')
                }}
                placeholder="Ej: Mi Empresa"
                required
                minLength={3}
                autoFocus
              />
            </div>

            {error && (
              <div className="auth-error">
                ❌ {error}
              </div>
            )}

            <div className="auth-form-actions">
              <button 
                type="button"
                className="auth-secondary-btn"
                onClick={() => setStep('org-setup')}
              >
                ← Volver
              </button>
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={orgLoading || !orgName.trim()}
              >
                {orgLoading ? 'Creando...' : 'Crear Organización'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Paso 4: Unirse a organización (ingresar código)
  if (step === 'join-org') {
    // Si no está autenticado, volver a auth
    if (!isAuthenticated) {
      setStep('auth')
      return null
    }
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <button 
            className="auth-modal-close" 
            onClick={(e) => {
              e.stopPropagation()
              setStep('org-setup')
            }}
            type="button"
          >
            ×
          </button>
          
          <div className="auth-modal-header">
            <h2>Unirme a una Organización</h2>
            <p className="auth-modal-subtitle">
              Ingresá el código de invitación que recibiste
            </p>
          </div>

          <form onSubmit={handleJoinValidate} className="auth-form">
            <div className="form-group">
              <label htmlFor="invitation-code">Código de invitación</label>
              <input
                type="text"
                id="invitation-code"
                value={invitationCode}
                onChange={(e) => {
                  setInvitationCode(e.target.value.toUpperCase())
                  setError('')
                }}
                placeholder="Ej: DATA-LATAM-2024"
                required
                autoFocus
              />
              <small className="input-hint">
                También podés pegar un link de invitación completo
              </small>
            </div>

            {error && (
              <div className="auth-error">
                ❌ {error}
              </div>
            )}

            <div className="auth-form-actions">
              <button 
                type="button"
                className="auth-secondary-btn"
                onClick={() => {
                  setStep('org-setup')
                  setInvitationCode('')
                  setError('')
                }}
              >
                ← Volver
              </button>
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={orgLoading || !invitationCode.trim()}
              >
                {orgLoading ? 'Validando...' : 'Validar Código'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Paso 5: Confirmación de unión (cuando tiene organización existente)
  if (step === 'join-confirm' && invitationPreview) {
    // Si no está autenticado, volver a auth
    if (!isAuthenticated) {
      setStep('auth')
      return null
    }
    const { organization, existingOrganization } = invitationPreview
    
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal auth-modal-large" onClick={(e) => e.stopPropagation()}>
          <button 
            className="auth-modal-close" 
            onClick={(e) => {
              e.stopPropagation()
              setStep('join-org')
              setInvitationPreview(null)
            }}
            type="button"
          >
            ×
          </button>
          
          <div className="auth-modal-header">
            <h2>Ya pertenecés a otra organización</h2>
            <p className="auth-modal-subtitle">
              Actualmente sos admin de la organización <strong>'{existingOrganization.name}'</strong>.
              <br />
              Si te unís a <strong>'{organization.name}'</strong>, podés archivar tu organización actual.
              <br />
              <span style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                No se perderán tus reportes ni configuración.
              </span>
            </p>
          </div>

          <div className="join-confirmation-org-preview">
            <div className="org-preview-card org-preview-new">
              <div className="org-preview-label">Nueva organización</div>
              <div className="org-preview-name">{organization.name}</div>
              {organization.admin && (
                <div className="org-preview-detail">👤 Admin: {organization.admin}</div>
              )}
              {organization.members && (
                <div className="org-preview-detail">👥 Miembros: {organization.members}</div>
              )}
            </div>
            
            <div className="org-preview-card org-preview-existing">
              <div className="org-preview-label">Tu organización actual</div>
              <div className="org-preview-name">{existingOrganization.name}</div>
              <div className="org-preview-detail">📊 Estado: Activa</div>
            </div>
          </div>

          <div className="join-confirmation-actions">
            <button
              className="auth-submit-btn auth-submit-primary"
              onClick={() => handleJoinDecision('archive')}
              disabled={orgLoading}
            >
              ✅ Unirme y archivar mi organización actual
            </button>
            <button
              className="auth-secondary-btn"
              onClick={() => handleJoinDecision('keep')}
              disabled={orgLoading}
            >
              ⚙️ Mantener ambas organizaciones
            </button>
            <button
              className="auth-cancel-btn"
              onClick={() => {
                setStep('join-org')
                setInvitationPreview(null)
                setInvitationCode('')
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AuthModal
