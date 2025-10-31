import React, { useState } from 'react'
import './ReportsModal.css'

// Datos dummy de reportes
const DUMMY_REPORTS = [
  { id: 1, name: 'Reporte de Ventas Q1 2024', date: '2024-01-15', size: '2.5 MB' },
  { id: 2, name: 'Análisis de Marketing', date: '2024-02-20', size: '1.8 MB' },
  { id: 3, name: 'Dashboard Financiero', date: '2024-03-10', size: '3.2 MB' },
  { id: 4, name: 'Reporte de Inventario', date: '2024-03-25', size: '1.5 MB' },
  { id: 5, name: 'KPIs Operacionales', date: '2024-04-05', size: '2.1 MB' },
]

const ReportsModal = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState(DUMMY_REPORTS)
  const [selectedReports, setSelectedReports] = useState(new Set())

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

  const handleDelete = (reportId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      setReports(prev => prev.filter(report => report.id !== reportId))
      setSelectedReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const handleSelectAll = () => {
    if (selectedReports.size === reports.length) {
      setSelectedReports(new Set())
    } else {
      setSelectedReports(new Set(reports.map(r => r.id)))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedReports.size === 0) return
    
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedReports.size} reporte(s)?`)) {
      setReports(prev => prev.filter(report => !selectedReports.has(report.id)))
      setSelectedReports(new Set())
    }
  }

  if (!isOpen) return null

  return (
    <div className="reports-modal-overlay" onClick={onClose}>
      <div className="reports-modal" onClick={(e) => e.stopPropagation()}>
        <button className="reports-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="reports-modal-header">
          <h2>Reportes</h2>
          <p className="reports-modal-subtitle">
            Gestiona tus reportes subidos
          </p>
        </div>

        <div className="reports-modal-content">
          {selectedReports.size > 0 && (
            <div className="reports-actions-bar">
              <span className="selected-count">
                {selectedReports.size} reporte(s) seleccionado(s)
              </span>
              <button 
                className="btn-delete-selected"
                onClick={handleDeleteSelected}
              >
                🗑️ Eliminar seleccionados
              </button>
            </div>
          )}

          <div className="reports-list-header">
            <label className="select-all-checkbox">
              <input
                type="checkbox"
                checked={selectedReports.size === reports.length && reports.length > 0}
                onChange={handleSelectAll}
              />
              <span>Seleccionar todos</span>
            </label>
          </div>

          {reports.length === 0 ? (
            <div className="reports-empty">
              <p>No hay reportes disponibles</p>
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
                    </div>
                  </div>
                  <button
                    className="report-delete-btn"
                    onClick={() => handleDelete(report.id)}
                    title="Eliminar reporte"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsModal

