import React from 'react'
import './FAQs.css'

const FAQs = ({ onBack }) => {
  return (
    <div className="faqs-page">
      <div className="faqs-container">
        <header className="faqs-header">
          <button className="faqs-back-btn" onClick={onBack}>
            ← Volver al inicio
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '32px' }}>📊</span>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
              Empower <span style={{ color: '#667eea' }}>Reports</span>
            </span>
          </div>
          <h1>❓ Preguntas Frecuentes (FAQs)</h1>
        </header>

        <div className="faqs-content">
          <section className="faq-item">
            <div className="faq-icon">📊</div>
            <div className="faq-content">
              <h2>¿Qué hace exactamente Empower Reports?</h2>
              <p>
                Empower Reports convierte tus archivos .pbit de Power BI en una documentación técnica interactiva, 
                donde podés navegar todas las tablas, métricas, relaciones y dependencias internas. 
                Ideal para entender, auditar o escalar modelos complejos.
              </p>
            </div>
          </section>

          <section className="faq-item">
            <div className="faq-icon">🧠</div>
            <div className="faq-content">
              <h2>¿Necesito conocimientos técnicos para usarlo?</h2>
              <p>
                No. Empower Reports fue diseñado para equipos de negocio, datos y desarrollo. 
                La interfaz es simple, y el resultado es claro y visual. Si sabés usar Power BI, 
                podés entender Empower Reports.
              </p>
            </div>
          </section>

          <section className="faq-item">
            <div className="faq-icon">🧾</div>
            <div className="faq-content">
              <h2>¿Qué tipo de información me devuelve?</h2>
              <p>El análisis incluye:</p>
              <ul>
                <li>Listado de tablas y columnas utilizadas</li>
                <li>Relaciones entre tablas</li>
                <li>Dependencias entre medidas</li>
                <li>Fórmulas DAX utilizadas</li>
                <li>Campos no utilizados (opcional)</li>
                <li>Archivos descargables</li>
              </ul>
            </div>
          </section>

          <section className="faq-item">
            <div className="faq-icon">🧪</div>
            <div className="faq-content">
              <h2>¿Esto es una prueba gratuita?</h2>
              <p>
                Sí. Estás usando una versión de prueba gratuita. Todos los análisis que hagas en esta etapa 
                no tienen costo, y tu feedback nos ayuda a mejorar la herramienta.
              </p>
            </div>
          </section>

          <section className="faq-item">
            <div className="faq-icon">📁</div>
            <div className="faq-content">
              <h2>¿Qué archivos puedo subir?</h2>
              <p>
                Aceptamos archivos .pbit de Power BI. Próximamente se habilitará compatibilidad con .pbix 
                exportados correctamente.
              </p>
            </div>
          </section>

          <section className="faq-item">
            <div className="faq-icon">🛠️</div>
            <div className="faq-content">
              <h2>¿Qué pasa si tengo errores o necesito soporte?</h2>
              <p>
                Podés contactarnos desde la sección inferior de la página. Estamos probando la plataforma 
                y tu feedback es clave.
              </p>
            </div>
          </section>

          <section className="faq-item faq-item-highlight">
            <div className="faq-icon">🔒</div>
            <div className="faq-content">
              <h2>¿Qué pasa con mis archivos? ¿Son privados? ¿Se venden?</h2>
              <p>
                Sí, tus archivos .pbit se procesan de forma completamente segura y nunca se venden ni se comparten 
                con terceros.
              </p>
              <p>
                No almacenamos tus datos más allá del tiempo estrictamente necesario para procesar y devolverte 
                el resultado. El único uso que se les da es generar el análisis técnico que solicitaste.
              </p>
              <p>
                Tampoco usamos tus archivos para entrenar modelos de inteligencia artificial, ni los reutilizamos 
                para otro fin que no sea el que vos pediste.
              </p>
              <p className="faq-emphasis">
                Tu archivo es tuyo, y solo lo usamos para entregarte el producto final.
              </p>
            </div>
          </section>

          <section className="faq-item">
            <div className="faq-icon">📁</div>
            <div className="faq-content">
              <h2>¿Por qué usar archivos .pbit mejora la seguridad?</h2>
              <p>
                El formato .pbit (Plantilla de Power BI) no contiene datos sensibles o productivos, solo estructura 
                del modelo, relaciones, medidas DAX y metadatos.
              </p>
              <p>Esto significa que:</p>
              <ul>
                <li>No incluye datos crudos de tus fuentes.</li>
                <li>No expone información confidencial de clientes, ingresos o métricas.</li>
                <li>Es seguro para compartir entre equipos sin comprometer la privacidad.</li>
              </ul>
              <p>
                Usar .pbit es una buena práctica para auditar, versionar y documentar tus reportes sin riesgos.
              </p>
            </div>
          </section>

          <section className="faq-item faq-item-highlight">
            <div className="faq-icon">🔐</div>
            <div className="faq-content">
              <h2>¿Cómo protegen la confidencialidad del análisis?</h2>
              <ul>
                <li>Usamos conexiones cifradas (HTTPS) en todo momento.</li>
                <li>
                  El archivo se borra automáticamente una vez finalizado el análisis (o cuando el usuario lo decida).
                </li>
                <li>
                  Si optás por guardar los resultados, solo vos tenés acceso mediante tu cuenta.
                </li>
                <li>Contactando con nosotros.</li>
              </ul>
              <p>
                Empower Reports fue pensado desde el inicio como una herramienta técnica con foco en la seguridad, 
                ideal para equipos que trabajan con información sensible pero necesitan documentación y colaboración.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default FAQs

