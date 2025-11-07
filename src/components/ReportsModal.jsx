import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './ReportsModal.css'

// Dummy report data with uploader
const DUMMY_REPORTS = [
  { id: 1, name: 'Sales Report Q1 2024', date: '2024-01-15', size: '2.5 MB', uploader: 'Gonzalo Figlioli' },
  { id: 2, name: 'Marketing Analysis', date: '2024-02-20', size: '1.8 MB', uploader: 'Camila Reyes' },
  { id: 3, name: 'Financial Dashboard', date: '2024-03-10', size: '3.2 MB', uploader: 'Gonzalo Figlioli' },
  { id: 4, name: 'Inventory Report', date: '2024-03-25', size: '1.5 MB', uploader: 'Tiago Markow' },
  { id: 5, name: 'Operational KPIs', date: '2024-04-05', size: '2.1 MB', uploader: 'Juan Pérez' },
  { id: 6, name: 'HR Dashboard', date: '2024-04-20', size: '2.7 MB', uploader: 'María González' },
  { id: 7, name: 'Q2 Project Analysis', date: '2024-05-15', size: '3.5 MB', uploader: 'Gonzalo Figlioli' },
  { id: 8, name: 'Procurement Report', date: '2024-05-28', size: '1.9 MB', uploader: 'Tiago Markow' },
  { id: 9, name: 'Operations Dashboard', date: '2024-06-10', size: '2.1 MB', uploader: 'Camila Reyes' },
  { id: 10, name: 'Production KPIs', date: '2024-06-22', size: '1.6 MB', uploader: 'Juan Pérez' },
  { id: 11, name: 'Cost Analysis', date: '2024-07-08', size: '2.8 MB', uploader: 'María González' },
  { id: 12, name: 'Logistics Report', date: '2024-07-19', size: '2.2 MB', uploader: 'Gonzalo Figlioli' },
  { id: 13, name: 'Quality Dashboard', date: '2024-08-05', size: '1.7 MB', uploader: 'Tiago Markow' },
  { id: 14, name: 'Profitability Analysis', date: '2024-08-18', size: '3.2 MB', uploader: 'Camila Reyes' },
  { id: 15, name: 'Sales Report Q3 2024', date: '2024-09-01', size: '2.4 MB', uploader: 'Gonzalo Figlioli' }
]

const ReportsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [reports, setReports] = useState(DUMMY_REPORTS)
  const [selectedReports, setSelectedReports] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(new Set())

  const handleCheckboxChange = (reportId) => {
    setSelectedReports(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reportId)) {
        newSet.delete(reportId)
      } else {
        newSet.add(reportId)
      }
      return newSet
    })
  }

  const handleDeleteClick = () => {
    if (selectedReports.size === 0) return
    
    // Save IDs to be deleted
    setPendingDelete(new Set(selectedReports))
    // Show confirmation modal
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    // Delete selected reports
    setReports(prev => prev.filter(report => !pendingDelete.has(report.id)))
    setSelectedReports(new Set())
    setPendingDelete(new Set())
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = () => {
    // Just close modal, don't delete anything
    setPendingDelete(new Set())
    setShowDeleteConfirm(false)
  }

  if (!isOpen) return null

  const selectedCount = selectedReports.size

  return (
    <>
      <div className="reports-modal-overlay" onClick={onClose}>
        <div className="reports-modal" onClick={(e) => e.stopPropagation()}>
          <button 
            className="reports-modal-close" 
            onClick={onClose}
            type="button"
          >
            ×
          </button>
          
          <div className="reports-modal-header">
            <div className="reports-header-top">
              <div>
                <h2>Reports</h2>
                <p className="reports-modal-subtitle">
                  Manage your uploaded reports
                </p>
              </div>
              {selectedCount > 0 && (
                <button 
                  className="btn-delete-top"
                  onClick={handleDeleteClick}
                  title={`Delete ${selectedCount} report${selectedCount > 1 ? 's' : ''}`}
                >
                  🗑️ Delete ({selectedCount})
                </button>
              )}
            </div>
          </div>

          <div className="reports-modal-content">
            {reports.length === 0 ? (
              <div className="reports-empty">
                <p>No reports available</p>
              </div>
            ) : (
              <div className="reports-list">
                {reports.map(report => (
                  <div key={report.id} className="report-item">
                    <label className="report-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedReports.has(report.id)}
                        onChange={() => handleCheckboxChange(report.id)}
                      />
                    </label>
                    <div className="report-info">
                      <div className="report-name">{report.name}</div>
                      <div className="report-meta">
                        <span className="report-date">📅 {report.date}</span>
                        <span className="report-size">💾 {report.size}</span>
                        <span className="report-uploader">👤 {report.uploader}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-header">
              <h3>Delete reports</h3>
            </div>
            <div className="delete-confirm-content">
              <p>
                Are you sure you want to delete {pendingDelete.size} report{pendingDelete.size > 1 ? 's' : ''}?
              </p>
              <p className="delete-confirm-warning">
                This action cannot be undone.
              </p>
            </div>
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-save-delete"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ReportsModal
