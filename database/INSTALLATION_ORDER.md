# Orden de Instalación - Empower Reports Database

## 📋 Orden Correcto de Ejecución

Ejecutar los archivos en este orden para crear la base de datos completa:

### 1️⃣ Schema Base
```sql
-- Crea las tablas principales, vistas y 2 funciones básicas
EXEC schema.sql
```

**Crea:**
- 8 tablas principales
- 2 vistas (vw_organizations_with_subscription, vw_users_with_primary_org)
- 2 funciones (fn_can_add_user, fn_can_add_report)
- 6 triggers de updated_at
- Datos iniciales de plans

### 2️⃣ Workflows de Organizaciones
```sql
-- Procedures y funciones para crear/unir organizaciones
EXEC organization_workflows.sql
```

**Agrega:**
- 6 procedures
- 3 funciones
- 2 triggers

### 3️⃣ Máquina de Estados
```sql
-- Procedures y triggers para suscripciones
EXEC state_machine_and_workflows.sql
```

**Agrega:**
- 8 procedures
- 4 triggers

### 4️⃣ Validaciones Adicionales
```sql
-- Constraints y validaciones extra
EXEC constraints_and_validations.sql
```

**Agrega:**
- 3 funciones
- 2 triggers

### 5️⃣ Documentación de Organizaciones
```sql
-- Procedures para gestionar URLs de documentación
EXEC documentation_procedures.sql
```

**Agrega:**
- 3 procedures (set, disable, remove)

### 6️⃣ Enterprise Pro (Opcional)
```sql
-- Solo si necesitas multi-organización
EXEC enterprise_pro_plan_v2.sql
```

**Agrega:**
- 1 procedure
- 5 funciones
- 1 trigger
- 1 tabla (enterprise_pro_managed_organizations)

### 7️⃣ Queries Útiles (Opcional)
```sql
-- Procedures útiles para operaciones comunes
EXEC useful_queries.sql
```

**Agrega:**
- 2 procedures (sp_archive_organization, sp_change_plan)

---

## ⚠️ Importante

1. **Ejecutar en orden**: No cambiar el orden, hay dependencias
2. **Errores**: Si hay error, revisar que el archivo anterior se ejecutó correctamente
3. **Enterprise Pro**: Solo ejecutar si necesitas gestionar múltiples organizaciones
4. **Schema.sql**: Contiene TODO lo básico necesario

---

## 🎯 Contenido de Cada Archivo

| Archivo | Tablas | Triggers | Procedures | Funciones | Vistas |
|---------|--------|----------|------------|-----------|--------|
| **schema.sql** | 8 | 7 | 0 | 3 | 2 |
| **documentation_procedures.sql** | 0 | 0 | 3 | 0 | 0 |
| **organization_workflows.sql** | 0 | 2 | 6 | 3 | 1 |
| **state_machine_and_workflows.sql** | 0 | 4 | 8 | 0 | 2 |
| **constraints_and_validations.sql** | 0 | 2 | 0 | 3 | 0 |
| **enterprise_pro_plan_v2.sql** | 1 | 1 | 1 | 5 | 2 |
| **useful_queries.sql** | 0 | 0 | 2 | 0 | 0 |
| **TOTAL** | **9** | **15** | **20** | **13** | **7** |

---

## ✅ Verificación Post-Instalación

```sql
-- Verificar que las tablas se crearon
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
-- Debe retornar: 8 o 9 tablas (9 si incluiste Enterprise Pro)

-- Verificar plans
SELECT * FROM plans ORDER BY name;
-- Debe retornar: 5 planes

-- Verificar vistas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.VIEWS
ORDER BY TABLE_NAME;
-- Debe retornar: 4-7 vistas

-- Verificar funciones
SELECT ROUTINE_NAME 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_TYPE = 'FUNCTION'
ORDER BY ROUTINE_NAME;
-- Debe retornar: 5-13 funciones

-- Verificar procedures
SELECT ROUTINE_NAME 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;
-- Debe retornar: 14-17 procedures
```

---

## 🔄 Para Reinstalar/Actualizar

Si necesitas reinstalar desde cero:

```sql
-- 1. Eliminar base de datos
USE master;
GO
DROP DATABASE IF EXISTS empower_reports;
GO

-- 2. Ejecutar en orden
-- Seguir los pasos 1-6 arriba
```

---

## 📝 Notas

- **schema.sql ya incluye triggers de updated_at**: No necesitas archivo separado de triggers para eso
- **organization_workflows.sql incluye sus triggers**: Están en el mismo archivo
- **No hay archivo separado de "triggers.sql"**: Están distribuidos en los archivos según su propósito

