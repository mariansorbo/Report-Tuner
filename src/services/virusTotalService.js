/**
 * Servicio para escanear archivos con VirusTotal API
 * Documentación: https://developers.virustotal.com/reference
 */

const API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY
const API_BASE_URL = 'https://www.virustotal.com/api/v3'
const ENABLE_VIRUS_SCAN = import.meta.env.VITE_ENABLE_VIRUS_SCAN === 'true' || import.meta.env.ENABLE_VIRUS_SCAN === 'true'

/**
 * Verifica si el escaneo de virus está habilitado y configurado
 * @returns {boolean}
 */
export const isVirusScanEnabled = () => {
  return ENABLE_VIRUS_SCAN && !!API_KEY
}

/**
 * Sube un archivo a VirusTotal para escanearlo
 * @param {File} file - Archivo a escanear
 * @returns {Promise<string>} ID del análisis
 */
const uploadFileForScan = async (file) => {
  if (!API_KEY) {
    throw new Error('VirusTotal API key no configurada. Define VITE_VIRUSTOTAL_API_KEY en .env')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/files`, {
    method: 'POST',
    headers: {
      'x-apikey': API_KEY
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('Límite de tasa de VirusTotal excedido. Por favor, intenta más tarde.')
    }
    throw new Error(`Error al subir archivo a VirusTotal: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.data.id // ID del análisis
}

/**
 * Obtiene el resultado del análisis de VirusTotal
 * @param {string} analysisId - ID del análisis
 * @returns {Promise<Object>} Resultado del análisis
 */
const getAnalysisResult = async (analysisId) => {
  if (!API_KEY) {
    throw new Error('VirusTotal API key no configurada')
  }

  const response = await fetch(`${API_BASE_URL}/analyses/${analysisId}`, {
    method: 'GET',
    headers: {
      'x-apikey': API_KEY
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Error al obtener análisis: ${errorData.error?.message || response.statusText}`)
  }

  return await response.json()
}

/**
 * Espera a que el análisis esté completo (polling)
 * @param {string} analysisId - ID del análisis
 * @param {number} maxWaitTime - Tiempo máximo de espera en ms (default: 60 segundos)
 * @param {number} pollInterval - Intervalo entre consultas en ms (default: 2 segundos)
 * @returns {Promise<Object>} Resultado del análisis completo
 */
const waitForAnalysis = async (analysisId, maxWaitTime = 60000, pollInterval = 2000) => {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitTime) {
    const result = await getAnalysisResult(analysisId)
    const status = result.data.attributes.status

    if (status === 'completed') {
      return result
    }

    // Esperar antes de la siguiente consulta
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  throw new Error('Tiempo de espera agotado esperando el resultado del análisis de VirusTotal')
}

/**
 * Escanea un archivo con VirusTotal
 * @param {File} file - Archivo a escanear
 * @param {Function} onProgress - Callback para actualizar progreso (opcional)
 * @returns {Promise<Object>} Resultado del escaneo
 */
export const scanFile = async (file, onProgress) => {
  if (!isVirusScanEnabled()) {
    console.warn('Escaneo de virus deshabilitado o API key no configurada')
    return { 
      clean: true, 
      skipped: true,
      message: 'Escaneo de virus deshabilitado' 
    }
  }

  try {
    // Paso 1: Subir archivo
    if (onProgress) onProgress({ stage: 'uploading', message: 'Subiendo archivo a VirusTotal...' })
    const analysisId = await uploadFileForScan(file)

    // Paso 2: Esperar resultado del análisis
    if (onProgress) onProgress({ stage: 'analyzing', message: 'Analizando archivo...' })
    const analysisResult = await waitForAnalysis(analysisId, 60000, 2000)

    // Paso 3: Interpretar resultados
    const stats = analysisResult.data.attributes.stats
    const maliciousCount = stats.malicious || 0
    const suspiciousCount = stats.suspicious || 0
    const totalScans = stats.harmless + stats.malicious + stats.suspicious + (stats.undetected || 0)

    const isClean = maliciousCount === 0 && suspiciousCount === 0

    if (onProgress) {
      onProgress({ 
        stage: 'completed', 
        message: isClean ? 'Archivo limpio ✓' : 'Amenazas detectadas ⚠️' 
      })
    }

    return {
      clean: isClean,
      skipped: false,
      malicious: maliciousCount,
      suspicious: suspiciousCount,
      totalScans: totalScans,
      analysisId: analysisId,
      message: isClean 
        ? `Archivo limpio (${totalScans} motores de escaneo)` 
        : `Amenazas detectadas: ${maliciousCount} malicioso(s), ${suspiciousCount} sospechoso(s)`,
      details: analysisResult.data.attributes
    }
  } catch (error) {
    console.error('Error en escaneo de VirusTotal:', error)
    
    // Si hay un error pero el escaneo está habilitado, podemos optar por:
    // 1. Bloquear la subida (más seguro)
    // 2. Permitir la subida con advertencia (menos seguro pero más flexible)
    // Por defecto, bloqueamos si hay error
    throw new Error(`Error al escanear archivo: ${error.message}`)
  }
}

/**
 * Escanea múltiples archivos secuencialmente
 * @param {File[]} files - Array de archivos a escanear
 * @param {Function} onProgress - Callback para actualizar progreso por archivo
 * @returns {Promise<Array>} Array de resultados de escaneo
 */
export const scanFiles = async (files, onProgress) => {
  const results = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      if (onProgress) {
        onProgress({ 
          fileIndex: i, 
          fileName: file.name, 
          totalFiles: files.length 
        })
      }
      
      const result = await scanFile(file, (progress) => {
        if (onProgress) {
          onProgress({ 
            fileIndex: i, 
            fileName: file.name, 
            totalFiles: files.length,
            ...progress 
          })
        }
      })
      
      results.push({ file: file.name, ...result })
    } catch (error) {
      results.push({ 
        file: file.name, 
        clean: false, 
        error: error.message,
        skipped: false 
      })
    }
  }
  
  return results
}



