# Integración de VirusTotal para Escaneo de Archivos .pbit

## Descripción

Esta integración permite escanear automáticamente todos los archivos .pbit antes de subirlos a Azure Blob Storage, utilizando la API de VirusTotal para detectar amenazas de seguridad.

## Configuración

### 1. Obtener API Key de VirusTotal

1. Regístrate en [VirusTotal](https://www.virustotal.com/gui/join-us) (cuenta gratuita disponible)
2. Ve a tu perfil y genera una API key
3. Copia la API key

### 2. Configurar Variables de Entorno

Edita tu archivo `.env` y agrega:

```env
# Habilitar escaneo de virus
VITE_ENABLE_VIRUS_SCAN=true

# API Key de VirusTotal
VITE_VIRUSTOTAL_API_KEY=tu_api_key_aqui
```

### 3. Límites de la API Gratuita

- **4 solicitudes por minuto**
- **500 solicitudes por día**

Para producción con alto volumen, considera un plan de pago de VirusTotal.

## Funcionamiento

### Flujo de Escaneo

1. **Usuario selecciona archivos .pbit**
2. **Usuario hace clic en "Upload File"**
3. **Sistema escanea cada archivo con VirusTotal:**
   - Sube el archivo a VirusTotal
   - Espera el resultado del análisis (polling cada 2 segundos, máximo 60 segundos)
   - Verifica si hay amenazas detectadas
4. **Si el archivo está limpio:**
   - Procede con la subida a Azure Blob Storage
5. **Si se detectan amenazas:**
   - Bloquea la subida
   - Muestra mensaje de error al usuario
   - No sube el archivo a Azure

### Estados del Escaneo

- **⏸ Pending**: Esperando a ser escaneado
- **⏳ Uploading**: Subiendo archivo a VirusTotal
- **🔍 Analyzing**: Analizando archivo (esperando resultado)
- **✓ Completed**: Escaneo completado (limpio)

## Archivos Modificados/Creados

### Nuevos Archivos
- `src/services/virusTotalService.js` - Servicio para comunicación con VirusTotal API

### Archivos Modificados
- `src/components/FileUpload.jsx` - Integración del escaneo antes de subir
- `src/components/FileUpload.css` - Estilos para la UI de escaneo
- `env.example` - Configuración de variables de entorno

## Uso del Servicio

### Escanear un archivo individual

```javascript
import { scanFile } from '../services/virusTotalService'

const result = await scanFile(file, (progress) => {
  console.log(progress.stage, progress.message)
})

if (result.clean) {
  console.log('Archivo limpio')
} else {
  console.log('Amenazas detectadas:', result.malicious)
}
```

### Escanear múltiples archivos

```javascript
import { scanFiles } from '../services/virusTotalService'

const results = await scanFiles(files, (progress) => {
  console.log(`Archivo ${progress.fileName}: ${progress.message}`)
})

const infected = results.filter(r => !r.clean)
```

### Verificar si el escaneo está habilitado

```javascript
import { isVirusScanEnabled } from '../services/virusTotalService'

if (isVirusScanEnabled()) {
  // Realizar escaneo
}
```

## Manejo de Errores

El sistema maneja los siguientes errores:

- **API Key no configurada**: El escaneo se omite si no hay API key
- **Límite de tasa excedido (429)**: Muestra mensaje al usuario
- **Error de red**: Bloquea la subida por seguridad
- **Tiempo de espera agotado**: Bloquea la subida si el análisis tarda más de 60 segundos

## Seguridad

- **Por defecto, si hay error en el escaneo, se bloquea la subida** (más seguro)
- Los archivos infectados **nunca** se suben a Azure
- La API key se almacena en variables de entorno (nunca en el código)

## Deshabilitar el Escaneo

Para deshabilitar temporalmente el escaneo:

```env
VITE_ENABLE_VIRUS_SCAN=false
```

Cuando está deshabilitado, los archivos se suben directamente a Azure sin escaneo.

## Troubleshooting

### Error: "VirusTotal API key no configurada"
- Verifica que `VITE_VIRUSTOTAL_API_KEY` esté en tu archivo `.env`
- Reinicia el servidor de desarrollo después de agregar la variable

### Error: "Límite de tasa excedido"
- Has excedido el límite de 4 solicitudes por minuto
- Espera 1 minuto antes de intentar de nuevo
- Considera un plan de pago para mayor capacidad

### El escaneo tarda mucho
- El análisis puede tardar entre 5-30 segundos dependiendo del tamaño del archivo
- El sistema espera hasta 60 segundos por defecto
- Archivos muy grandes pueden requerir más tiempo

## Referencias

- [VirusTotal API Documentation](https://developers.virustotal.com/reference)
- [VirusTotal API v3](https://developers.virustotal.com/reference/getting-started)



