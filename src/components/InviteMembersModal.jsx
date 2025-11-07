import React, { useState } from 'react'
import './InviteMembersModal.css'

const InviteMembersModal = ({ isOpen, onClose, onSave }) => {
  // Dummy user list with statuses
  const [members, setMembers] = useState([
    { email: 'gonzalo@citenza.com', role: 'global_admin', status: 'Accepted' },
    { email: 'camila@citenza.com', role: 'admin', status: 'Accepted' },
    { email: 'tiago@consultora.com', role: 'owner', status: 'Invited' },
    { email: 'juan.perez@empresa.com', role: 'editor', status: 'Invited' },
    { email: 'maria.garcia@startup.io', role: 'editor', status: 'Accepted' }
  ])
  
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('editor')
  const [showNewEmailField, setShowNewEmailField] = useState(false)
  
  const [activeTab, setActiveTab] = useState('email') // 'email' or 'link'
  const [invitationLink, setInvitationLink] = useState('')

  if (!isOpen) return null

  const handleAddEmail = () => {
    if (newEmail.trim() && newEmail.includes('@')) {
      setMembers([...members, { email: newEmail, role: newRole, status: 'Invited' }])
      setNewEmail('')
      setNewRole('member')
      setShowNewEmailField(false)
    }
  }

  const handleDelete = (index) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const handleRoleChange = (index, newRole) => {
    const updated = [...members]
    updated[index].role = newRole
    setMembers(updated)
  }

  const handleGenerateLink = () => {
    // Generate simulated unique link
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setInvitationLink(`${window.location.origin}/invite/${token}`)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink)
    // You could add a toast here
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        members: members,
        link: invitationLink
      })
    }
    onClose()
  }

  return (
    <div className="invite-modal-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="invite-modal-close" 
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="invite-modal-header">
          <h2>Invitá a tu equipo</h2>
          <p className="invite-modal-subtitle">
            Enviá una invitación por correo o compartí un enlace directo
          </p>
        </div>

        <div className="invite-modal-tabs">
          <button
            className={`invite-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            📧 Por correo
          </button>
          <button
            className={`invite-tab ${activeTab === 'link' ? 'active' : ''}`}
            onClick={() => setActiveTab('link')}
          >
            🔗 Link de invitación
          </button>
        </div>

        <div className="invite-modal-content">
          {activeTab === 'email' ? (
            <>
              <div className="invite-email-section">
                {members.map((member, index) => (
                  <div key={index} className="invite-email-item">
                    <input
                      type="email"
                      placeholder="email@company.com"
                      value={member.email}
                      readOnly
                      className="invite-email-input"
                    />
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(index, e.target.value)}
                      className="invite-role-select"
                    >
                      <option value="global_admin">Global Admin</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                      <option value="editor">Editor</option>
                    </select>
                    <span className={`invite-status invite-status-${member.status.toLowerCase()}`}>
                      {member.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="invite-delete-btn"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                {showNewEmailField && (
                  <div className="invite-email-item invite-new-email">
                    <input
                      type="email"
                      placeholder="email@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="invite-email-input"
                      autoFocus
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="invite-role-select"
                    >
                      <option value="global_admin">Global Admin</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="invite-confirm-btn"
                      title="Agregar"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewEmailField(false)
                        setNewEmail('')
                        setNewRole('editor')
                      }}
                      className="invite-cancel-btn"
                      title="Cancelar"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {!showNewEmailField && (
                <button
                  type="button"
                  onClick={() => setShowNewEmailField(true)}
                  className="invite-add-btn"
                >
                  + Agregar otro
                </button>
              )}
            </>
          ) : (
            <div className="invite-link-section">
              {!invitationLink ? (
                <>
                  <button
                    type="button"
                    onClick={handleGenerateLink}
                    className="invite-generate-link-btn"
                  >
                    🔗 Generar link de invitación
                  </button>
                  <p className="invite-link-description">
                    <strong>Por defecto, el link otorga permisos de "Editor".</strong>
                  </p>
                </>
              ) : (
                <div className="invite-link-result">
                  <div className="invite-link-display">
                    <input
                      type="text"
                      value={invitationLink}
                      readOnly
                      className="invite-link-input"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="invite-copy-btn"
                    >
                      📋 Copiar
                    </button>
                  </div>
                  <p className="invite-link-hint">
                    Compartí este link con tu equipo. Podrán unirse directamente con permisos de Editor.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="invite-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="invite-btn-cancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="invite-btn-save"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default InviteMembersModal
