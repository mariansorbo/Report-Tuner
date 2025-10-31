import React, { useState, useRef, useEffect } from 'react'
import { useOrganization } from '../contexts/OrganizationContext'
import './OrganizationSelector.css'

const OrganizationSelector = () => {
  const { currentOrganization, userOrganizations, switchOrganization, loading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSwitchOrg = async (orgId) => {
    if (orgId === currentOrganization?.id) {
      setIsOpen(false)
      return
    }

    await switchOrganization(orgId)
    setIsOpen(false)
  }

  if (!currentOrganization && userOrganizations.length === 0) {
    return null
  }

  const activeOrgs = userOrganizations.filter(org => !org.is_archived)
  const archivedOrgs = userOrganizations.filter(org => org.is_archived)

  return (
    <div className="org-selector" ref={dropdownRef}>
      <button
        className="org-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <span className="org-selector-icon">🏢</span>
        <span className="org-selector-name">
          {currentOrganization?.name || 'Sin organización'}
        </span>
        <span className="org-selector-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="org-selector-dropdown">
          {activeOrgs.length > 0 && (
            <>
              <div className="org-dropdown-section">
                <div className="org-dropdown-label">Organizaciones activas</div>
                {activeOrgs.map(org => (
                  <button
                    key={org.id}
                    className={`org-dropdown-item ${org.id === currentOrganization?.id ? 'active' : ''}`}
                    onClick={() => handleSwitchOrg(org.id)}
                  >
                    <span className="org-item-name">{org.name}</span>
                    {org.id === currentOrganization?.id && (
                      <span className="org-item-check">✅</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {archivedOrgs.length > 0 && (
            <div className="org-dropdown-section">
              <div className="org-dropdown-label">Archivadas</div>
              {archivedOrgs.map(org => (
                <button
                  key={org.id}
                  className="org-dropdown-item archived"
                  onClick={() => handleSwitchOrg(org.id)}
                  title="Reactivar organización"
                >
                  <span className="org-item-name">{org.name}</span>
                  <span className="org-item-status">📦 Archivada</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OrganizationSelector

