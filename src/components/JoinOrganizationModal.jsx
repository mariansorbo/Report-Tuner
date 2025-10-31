import React, { useState } from 'react'
import { useOrganization } from '../contexts/OrganizationContext'
import './JoinOrganizationModal.css'

const JoinOrganizationModal = ({ onClose, onSuccess }) => {
  const [invitationCode, setInvitationCode] = useState('')
  const [error, setError] = useState('')
  const [invitationPreview, setInvitationPreview] = useState(null)
  const { joinOrganization, archiveAndJoin, keepBothOrganizations, loading } = useOrganization()

  const handleValidateCode = async (e) => {
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
        // Mostrar preview y pasar a modal de decisión
        setInvitationPreview(result)
      } else {
        // Unirse directamente
        if (onSuccess) {
          onSuccess(result.organization)
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
      if (onSuccess) {
        onSuccess(invitationPreview.organization, action)
      }
      onClose()
    }
  }

  if (invitationPreview) {
    return (
      <div className="join-org-modal-overlay" onClick={onClose}>
        <div className="join-org-modal" onClick={(e) => e.stopPropagation()}>
          <button className="join-org-modal-close" onClick={onClose}>
            ×
          </button>
          <JoinConfirmation
            invitationData={invitationPreview}
            onConfirm={handleJoinDecision}
            onCancel={() => {
              setInvitationPreview(null)
              setInvitationCode('')
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="join-org-modal-overlay" onClick={onClose}>
      <div className="join-org-modal" onClick={(e) => e.stopPropagation()}>
        <button className="join-org-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="join-org-modal-header">
          <h2>Unirme a una Organización</h2>
          <p className="join-org-modal-subtitle">
            Ingresá el código de invitación que recibiste
          </p>
        </div>

        <form onSubmit={handleValidateCode} className="join-org-form">
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
            <div className="join-org-error">
              ❌ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="join-org-submit-btn"
            disabled={loading || !invitationCode.trim()}
          >
            {loading ? 'Validando...' : 'Validar Código'}
          </button>
        </form>
      </div>
    </div>
  )
}

const JoinConfirmation = ({ invitationData, onConfirm, onCancel }) => {
  const { organization, existingOrganization } = invitationData

  return (
    <div className="join-confirmation">
      <div className="join-confirmation-header">
        <h3>Ya pertenecés a otra organización</h3>
        <p className="confirmation-message">
          Actualmente sos admin de la organización <strong>'{existingOrganization.name}'</strong>.
          <br />
          Si te unís a <strong>'{organization.name}'</strong>, podés archivar tu organización actual.
          <br />
          <span className="confirmation-note">No se perderán tus reportes ni configuración.</span>
        </p>
      </div>

      <div className="join-confirmation-org-info">
        <div className="org-preview new">
          <div className="org-preview-label">Nueva organización</div>
          <div className="org-preview-name">{organization.name}</div>
          {organization.admin && (
            <div className="org-preview-detail">👤 Admin: {organization.admin}</div>
          )}
          {organization.members && (
            <div className="org-preview-detail">👥 Miembros: {organization.members}</div>
          )}
        </div>
        
        <div className="org-preview existing">
          <div className="org-preview-label">Tu organización actual</div>
          <div className="org-preview-name">{existingOrganization.name}</div>
          <div className="org-preview-detail">📊 Estado: Activa</div>
        </div>
      </div>

      <div className="join-confirmation-actions">
        <button
          className="confirmation-btn primary"
          onClick={() => onConfirm('archive')}
        >
          ✅ Unirme y archivar mi organización actual
        </button>
        <button
          className="confirmation-btn secondary"
          onClick={() => onConfirm('keep')}
        >
          ⚙️ Mantener ambas organizaciones
        </button>
        <button
          className="confirmation-btn cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default JoinOrganizationModal

