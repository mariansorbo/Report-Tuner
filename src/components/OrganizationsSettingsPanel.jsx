import React, { useState } from 'react'
import { useOrganization } from '../contexts/OrganizationContext'
import './OrganizationsSettingsPanel.css'

const OrganizationsSettingsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const { userOrganizations, switchOrganization, reactivateOrganization, loading } = useOrganization()
  const [message, setMessage] = useState('')

  const handleReactivate = async (orgId) => {
    const result = await reactivateOrganization(orgId)
    if (result.success) {
      setMessage(`✅ Organización "${result.organization.name}" reactivada`)
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(`❌ Error: ${result.error}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSwitch = async (orgId) => {
    const result = await switchOrganization(orgId)
    if (result.success) {
      setMessage('✅ Organización cambiada')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const activeOrgs = userOrganizations.filter(org => !org.is_archived)
  const archivedOrgs = userOrganizations.filter(org => org.is_archived)

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const getPlanLabel = (plan) => {
    const labels = {
      'free_trial': 'Prueba Gratuita',
      'basic': 'Básico',
      'premium': 'Premium'
    }
    return labels[plan] || plan
  }

  return (
    <div className="org-settings-overlay" onClick={onClose}>
      <div className="org-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="org-settings-header">
          <h2>Mis Organizaciones</h2>
          <button className="org-settings-close" onClick={onClose}>×</button>
        </div>

        {message && (
          <div className="org-settings-message">
            {message}
          </div>
        )}

        <div className="org-settings-content">
          {userOrganizations.length === 0 ? (
            <div className="org-settings-empty">
              <p>No tenés organizaciones aún</p>
            </div>
          ) : (
            <>
              {activeOrgs.length > 0 && (
                <div className="org-settings-section">
                  <h3>Organizaciones Activas</h3>
                  <div className="org-settings-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Estado</th>
                          <th>Plan</th>
                          <th>Fecha de creación</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrgs.map(org => (
                          <tr key={org.id}>
                            <td>
                              <strong>{org.name}</strong>
                              {org.is_primary && (
                                <span className="org-badge primary">Principal</span>
                              )}
                            </td>
                            <td>
                              <span className="org-status active">Activa</span>
                            </td>
                            <td>{getPlanLabel(org.plan)}</td>
                            <td>{formatDate(org.created_at)}</td>
                            <td>
                              {!org.is_primary && (
                                <button
                                  className="org-action-btn switch"
                                  onClick={() => handleSwitch(org.id)}
                                  disabled={loading}
                                >
                                  Activar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {archivedOrgs.length > 0 && (
                <div className="org-settings-section">
                  <h3>Organizaciones Archivadas</h3>
                  <div className="org-settings-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Estado</th>
                          <th>Plan</th>
                          <th>Fecha de creación</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedOrgs.map(org => (
                          <tr key={org.id} className="archived-row">
                            <td>
                              <strong>{org.name}</strong>
                            </td>
                            <td>
                              <span className="org-status archived">Archivada</span>
                            </td>
                            <td>{getPlanLabel(org.plan)}</td>
                            <td>{formatDate(org.created_at)}</td>
                            <td>
                              <button
                                className="org-action-btn reactivate"
                                onClick={() => handleReactivate(org.id)}
                                disabled={loading}
                              >
                                Reactivar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrganizationsSettingsPanel

