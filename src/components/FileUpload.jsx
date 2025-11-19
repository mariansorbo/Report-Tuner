import React, { useState, useCallback } from 'react'
import { BlobServiceClient } from '@azure/storage-blob'
import { useAuth } from '../contexts/AuthContext'
import { scanFiles, isVirusScanEnabled } from '../services/virusTotalService'
import './FileUpload.css'

const FileUpload = ({ compact = true, onAuthRequired }) => {
  const [files, setFiles] = useState([]) // File[]
  const [uploading, setUploading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [progressByFile, setProgressByFile] = useState({}) // { filename: percent }
  const [scanStatusByFile, setScanStatusByFile] = useState({}) // { filename: { stage, message } }
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { isAuthenticated, user } = useAuth()

  // Configuración desde variables de entorno
  const accountName = import.meta.env.VITE_AZURE_ACCOUNT_NAME
  const sasToken = import.meta.env.VITE_AZURE_SAS_TOKEN // Debe empezar con "sv="
  const containerName = import.meta.env.VITE_CONTAINER_NAME
  const maxFileSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 31457280 // 30MB default

  // Debug: verificar variables de entorno
  console.log('Account Name:', accountName ? 'Presente' : 'FALTANTE')
  console.log('SAS Token:', sasToken ? 'Presente' : 'FALTANTE')
  console.log('Container Name:', containerName)
  console.log('Max File Size:', maxFileSize)

  const validateFile = (file) => {
    if (!file) {
      setError('Please select a file')
      return false
    }

    if (!file.name.toLowerCase().endsWith('.pbit')) {
      setError('File must be of type .pbit')
      return false
    }

    if (file.size > maxFileSize) {
      setError(`File is too large. Maximum size: ${Math.round(maxFileSize / 1024 / 1024)}MB`)
      return false
    }

    return true
  }

  const uploadToAzure = async (file) => {
    try {
      // Validar que tenemos el SAS Token (navegador)
      if (!accountName || !sasToken) {
        throw new Error('Missing config. Define VITE_AZURE_ACCOUNT_NAME and VITE_AZURE_SAS_TOKEN in .env')
      }

      console.log('Iniciando upload usando SAS Token...')

      // Crear el cliente de blob service usando SAS
      const serviceUrl = `https://${accountName}.blob.core.windows.net?${sasToken}`
      const blobServiceClient = new BlobServiceClient(serviceUrl)
      
      const containerClient = blobServiceClient.getContainerClient(containerName)
      
      // Crear el nombre del blob con timestamp para evitar duplicados
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const blobName = `${timestamp}-${file.name}`
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName)
      
      // Configurar opciones de upload con callback de progreso
      const uploadOptions = {
        onProgress: (ev) => {
          const progressPercent = Math.round((ev.loadedBytes / file.size) * 100)
          setProgressByFile(prev => ({ ...prev, [file.name]: progressPercent }))
        }
      }

      // Upload the file
      await blockBlobClient.upload(file, file.size, uploadOptions)
      
      return { success: true, blobName }
    } catch (err) {
      console.error('Error uploading to Azure:', err)
      throw new Error(`Error uploading file: ${err.message}`)
    }
  }

  const handleFileSelect = useCallback((fileList) => {
    setError('')
    setMessage('')
    setProgressByFile({})

    const selected = Array.from(fileList || [])
    const valid = selected.filter(validateFile)
    setFiles(valid)
  }, [maxFileSize])

  const handleFileChange = (event) => {
    handleFileSelect(event.target.files)
  }

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    handleFileSelect(event.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleUpload = async () => {
    // Verificar autenticación primero
    if (!isAuthenticated) {
      setError('You must sign in to upload files')
      if (onAuthRequired) {
        onAuthRequired()
      }
      return
    }

    if (!files || files.length === 0) {
      setError('Please select one or more files first')
      return
    }

    setUploading(true)
    setScanning(false)
    setError('')
    setMessage('')
    setProgressByFile({})
    setScanStatusByFile({})

    const results = []
    const virusScanEnabled = isVirusScanEnabled()

    // Paso 1: Escanear archivos con VirusTotal (si está habilitado)
    if (virusScanEnabled) {
      setScanning(true)
      try {
        const scanResults = await scanFiles(files, (progress) => {
          if (progress.fileName) {
            setScanStatusByFile(prev => ({
              ...prev,
              [progress.fileName]: {
                stage: progress.stage || 'scanning',
                message: progress.message || 'Escaneando...',
                fileIndex: progress.fileIndex,
                totalFiles: progress.totalFiles
              }
            }))
          }
        })

        // Verificar si algún archivo tiene amenazas
        const infectedFiles = scanResults.filter(r => !r.clean && !r.skipped)
        if (infectedFiles.length > 0) {
          setScanning(false)
          setUploading(false)
          const infectedNames = infectedFiles.map(f => f.file).join(', ')
          setError(`⚠️ Archivos con amenazas detectadas: ${infectedNames}. La subida ha sido bloqueada por seguridad.`)
          return
        }

        // Verificar si hubo errores en el escaneo
        const scanErrors = scanResults.filter(r => r.error && !r.skipped)
        if (scanErrors.length > 0) {
          setScanning(false)
          setUploading(false)
          const errorNames = scanErrors.map(f => f.file).join(', ')
          setError(`Error al escanear archivos: ${errorNames}. La subida ha sido bloqueada por seguridad.`)
          return
        }

        setMessage(`✅ Escaneo completado: todos los archivos están limpios`)
      } catch (err) {
        setScanning(false)
        setUploading(false)
        setError(`Error durante el escaneo: ${err.message}. La subida ha sido bloqueada por seguridad.`)
        return
      }
      setScanning(false)
    }

    // Paso 2: Subir archivos a Azure
    for (const f of files) {
      try {
        const result = await uploadToAzure(f)
        results.push({ file: f.name, success: true, blobName: result.blobName })
      } catch (err) {
        results.push({ file: f.name, success: false, error: err.message })
      }
    }

    const failed = results.filter(r => !r.success)
    if (failed.length === 0) {
      setMessage(`✅ ${results.length} file(s) uploaded successfully${virusScanEnabled ? ' (escaneados y verificados)' : ''}`)
    } else {
      setError(`Some files failed: ${failed.map(f => f.file).join(', ')}`)
    }

    // Reset selección
    setFiles([])
    const fileInput = document.getElementById('file-input')
    if (fileInput) fileInput.value = ''
    setUploading(false)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`file-upload-container ${compact ? 'compact' : ''}`}>
      <div 
        className={`file-drop-zone ${files.length ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-icon">📁</div>
        <p className="upload-text">
          {!isAuthenticated 
            ? 'Sign in to upload files' 
            : files.length 
              ? `${files.length} file(s) selected` 
              : 'Drag your .pbit files here'
          }
        </p>
        <p className="upload-subtext">
          {!isAuthenticated 
            ? 'You need to be logged in to use this feature' 
            : files.length 
              ? 'or select more' 
              : 'or click to select'
          }
        </p>
        <input
          id="file-input"
          type="file"
          accept=".pbit"
          multiple
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      {files.length > 0 && (
        <div className="file-info">
          <p><strong>Archivos seleccionados:</strong></p>
          <ul className="file-list">
            {files.map(f => (
              <li key={f.name} className="file-row">
                <span className="file-name">{f.name}</span>
                <span className="file-size">{formatFileSize(f.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scanning && files.length > 0 && (
        <div className="scan-container">
          <h4 className="scan-title">🔍 Escaneando archivos con VirusTotal...</h4>
          {files.map(f => {
            const scanStatus = scanStatusByFile[f.name] || { stage: 'pending', message: 'Esperando...' }
            return (
              <div key={f.name} className="scan-item">
                <div className="scan-label">
                  <span className="scan-file-name">{f.name}</span>
                  <span className="scan-status">{scanStatus.message}</span>
                </div>
                <div className="scan-indicator">
                  {scanStatus.stage === 'uploading' && <span className="scan-dot scanning">⏳</span>}
                  {scanStatus.stage === 'analyzing' && <span className="scan-dot analyzing">🔍</span>}
                  {scanStatus.stage === 'completed' && <span className="scan-dot completed">✓</span>}
                  {scanStatus.stage === 'pending' && <span className="scan-dot pending">⏸</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {uploading && !scanning && files.length > 0 && (
        <div className="progress-container">
          {files.map(f => {
            const p = progressByFile[f.name] || 0
            return (
              <div key={f.name} className="progress-item">
                <div className="progress-label">{f.name}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p}%` }}></div>
                </div>
                <p className="progress-text">{p}%</p>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <button 
        className="upload-button upload-button--primary"
        onClick={handleUpload}
        disabled={!isAuthenticated || files.length === 0 || uploading || scanning}
      >
        {!isAuthenticated 
          ? 'Sign in to upload' 
          : scanning
            ? 'Scanning...'
            : uploading 
              ? 'Uploading...' 
              : 'Upload File'
        }
      </button>
      {!compact && (
        <div className="help-text">
          <p><strong>How to get your .pbit file?</strong></p>
          <ol>
            <li>Open the .pbix in Power BI Desktop</li>
            <li>File → Export → Power BI Template (.pbit)</li>
            <li>Save and drag here</li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default FileUpload
