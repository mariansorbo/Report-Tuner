import React, { useState } from 'react'
import { useOrganization } from '../contexts/OrganizationContext'
import './CreateOrganizationModal.css'

const CreateOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { createOrganization, loading } = useOrganization()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre de la organización es requerido')
      return
    }

    if (name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }

    const result = await createOrganization(name.trim())
    
    if (result.success) {
      if (onSuccess) {
        onSuccess(result.organization)
      }
      onClose()
    } else {
      setError(result.error || 'Error al crear organización')
    }
  }

  return (
    <div className="create-org-modal-overlay" onClick={onClose}>
      <div className="create-org-modal" onClick={(e) => e.stopPropagation()}>
        <button className="create-org-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="create-org-modal-header">
          <h2>Crear Organización</h2>
          <p className="create-org-modal-subtitle">
            Empezá tu espacio de trabajo desde cero
          </p>
        </div>

        <form onSubmit={handleSubmit} className="create-org-form">
          <div className="form-group">
            <label htmlFor="org-name">Nombre de la organización</label>
            <input
              type="text"
              id="org-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="Ej: Mi Empresa"
              required
              minLength={3}
              autoFocus
            />
          </div>

          {error && (
            <div className="create-org-error">
              ❌ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="create-org-submit-btn"
            disabled={loading || !name.trim()}
          >
            {loading ? 'Creando...' : 'Crear Organización'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateOrganizationModal

