import React, { useState } from 'react'
import './InviteMembersModal.css'

const InviteMembersModal = ({ isOpen, onClose, onSave }) => {
  const [emailList, setEmailList] = useState([{ email: '', role: 'member', selected: false }])
  const [showLinkOption, setShowLinkOption] = useState(false)
  const [invitationLink, setInvitationLink] = useState('')
  const [activeTab, setActiveTab] = useState('email') // 'email' o 'link'

  if (!isOpen) return null

  const handleAddEmail = () => {
    setEmailList([...emailList, { email: '', role: 'member', selected: false }])
  }

  const handleEmailChange = (index, value) => {
    const updated = [...emailList]
    updated[index].email = value
    setEmailList(updated)
  }

  const handleRoleChange = (index, newRole) => {
    const updated = [...emailList]
    updated[index].role = newRole
    setEmailList(updated)
  }

  const handleToggleSelect = (index) => {
    const updated = [...emailList]
    updated[index].selected = !updated[index].selected
    setEmailList(updated)
  }

  const handleDelete = (index) => {
    setEmailList(emailList.filter((_, i) => i !== index))
  }

  const handleDeleteSelected = () => {
    setEmailList(emailList.filter(item => !item.selected))
  }

  const handleBulkRoleChange = (newRole) => {
    setEmailList(emailList.map(item => 
      item.selected ? { ...item, role: newRole } : item
    ))
  }

  const handleGenerateLink = () => {
    // Generar un link único simulado
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setInvitationLink(`${window.location.origin}/invite/${token}`)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink)
    // Podrías agregar un toast aquí
  }

  const handleSave = () => {
    const validEmails = emailList.filter(item => item.email.trim() && item.email.includes('@'))
    if (validEmails.length === 0 && !invitationLink) {
      return
    }
    
    if (onSave) {
      onSave({
        emails: validEmails,
        link: invitationLink
      })
    }
    onClose()
    // Reset
    setEmailList([{ email: '', role: 'member', selected: false }])
    setInvitationLink('')
    setActiveTab('email')
  }

  const hasSelected = emailList.some(item => item.selected)
  const selectedCount = emailList.filter(item => item.selected).length

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
                {emailList.map((item, index) => (
                  <div key={index} className="invite-email-item">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleSelect(index)}
                      className="invite-checkbox"
                    />
                    <input
                      type="email"
                      placeholder="correo@empresa.com"
                      value={item.email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="invite-email-input"
                    />
                    <select
                      value={item.role}
                      onChange={(e) => handleRoleChange(index, e.target.value)}
                      className="invite-role-select"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Miembro</option>
                      <option value="viewer">Viewer</option>
                    </select>
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
              </div>

              {hasSelected && (
                <div className="invite-bulk-actions">
                  <span className="invite-selected-count">
                    {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
                  </span>
                  <select
                    onChange={(e) => handleBulkRoleChange(e.target.value)}
                    className="invite-bulk-role-select"
                    defaultValue=""
                  >
                    <option value="" disabled>Cambiar rol de seleccionados</option>
                    <option value="admin">Admin</option>
                    <option value="member">Miembro</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="invite-bulk-delete-btn"
                  >
                    🗑️ Eliminar seleccionados
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddEmail}
                className="invite-add-btn"
              >
                + Agregar otro
              </button>
            </>
          ) : (
            <div className="invite-link-section">
              <p className="invite-link-description">
                Generá un link de invitación que podés compartir con tu equipo
              </p>
              {!invitationLink ? (
                <button
                  type="button"
                  onClick={handleGenerateLink}
                  className="invite-generate-link-btn"
                >
                  🔗 Generar link de invitación
                </button>
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
                    Compartí este link con tu equipo. Podrán unirse directamente.
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

