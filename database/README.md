# Empower Reports - Database Schema

Esquema completo de base de datos para el sistema SaaS Empower Reports, diseñado para manejar usuarios, organizaciones, suscripciones, planes y reportes.

## 📋 Contenido

- **schema.sql** - Esquema principal con todas las tablas, relaciones, índices y datos iniciales
- **useful_queries.sql** - Consultas útiles y procedimientos almacenados para operaciones comunes
- **state_machine_and_workflows.sql** - Procedimientos para máquina de estados de suscripciones y validación de límites
- **organization_workflows.sql** - Procedimientos y funciones para el flujo UX completo de creación y unión a organizaciones

## 🚀 Instalación

### Prerrequisitos

- SQL Server 2017 o superior
- Permisos para crear base de datos y tablas

### Pasos de Instalación

1. **Ejecutar el esquema principal:**
   ```sql
   -- Conectarse a SQL Server Management Studio o Azure Data Studio
   -- Ejecutar database/schema.sql
   ```

2. **Verificar la instalación:**
   ```sql
   USE empower_reports;
   GO
   
   -- Verificar que las tablas fueron creadas
   SELECT TABLE_NAME 
   FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_TYPE = 'BASE TABLE';
   
   -- Verificar que los planes fueron insertados
   SELECT * FROM plans;
   ```

## 📊 Estructura de Tablas

### Tablas Principales

#### `users`
- Almacena información de usuarios con soporte para OAuth (Google, LinkedIn, Azure AD)
- Campos clave: `id`, `email`, `auth_provider`, `auth_provider_id`

#### `organizations`
- Representa organizaciones donde colaboran usuarios
- Vinculado a Stripe mediante `stripe_customer_id`

#### `organization_members`
- Relación muchos-a-muchos entre usuarios y organizaciones
- Incluye roles: `admin`, `member`, `viewer`
- Un usuario puede tener múltiples organizaciones pero solo una primaria

#### `plans`
- Define los planes disponibles con sus límites y características
- Planes predefinidos: `free_trial`, `basic`, `teams`, `enterprise`

#### `subscriptions`
- Suscripciones activas de organizaciones a planes
- Estados: `active`, `trialing`, `canceled`, `past_due`, `unpaid`, `incomplete`
- Una organización solo puede tener una suscripción activa/trialing

#### `subscription_history`
- Historial completo de cambios en suscripciones
- Rastrea upgrades, downgrades y eventos de Stripe

#### `reports`
- Reportes (.pbit) subidos por usuarios
- Vinculados a organización (si aplica) y usuario

## 🔑 Relaciones Principales

```
users (1) ────< organization_members >─── (N) organizations
                                            │
organizations (1) ────< subscriptions >─── (1) plans
                                            │
organizations (1) ────< reports >──────── (N) reports
```

## 📈 Planes y Límites

### Free Trial (Actual)
- **Max usuarios:** 10
- **Max reportes:** 100
- **Max almacenamiento:** 5GB
- **Precio:** Gratis

### Basic (Futuro)
- **Max usuarios:** 1
- **Max reportes:** 30
- **Max almacenamiento:** 1GB
- **Características:** Individual

### Teams (Futuro)
- **Max usuarios:** 3
- **Max reportes:** 50
- **Max almacenamiento:** 5GB
- **Características:** Colaboración básica

### Enterprise (Futuro)
- **Max usuarios:** 10
- **Max reportes:** 300
- **Max almacenamiento:** 50GB
- **Características:** API access, branding, audit log, priority support

## 🛠️ Funciones Útiles

### `fn_can_add_user(@organization_id)`
Verifica si una organización puede agregar más usuarios según su plan.
```sql
SELECT dbo.fn_can_add_user('YOUR_ORG_ID');
-- Retorna 1 si puede, 0 si no puede
```

### `fn_can_add_report(@organization_id)`
Verifica si una organización puede agregar más reportes según su plan.
```sql
SELECT dbo.fn_can_add_report('YOUR_ORG_ID');
-- Retorna 1 si puede, 0 si no puede
```

### `fn_can_user_create_organization(@user_id)`
Verifica si un usuario puede crear una nueva organización y retorna info de organizaciones existentes.
```sql
SELECT * FROM fn_can_user_create_organization('YOUR_USER_ID');
```

### `fn_validate_invitation_token(@invitation_token)`
Valida un token de invitación y retorna información de la organización.
```sql
SELECT * FROM fn_validate_invitation_token('ABC-123-XYZ');
-- Retorna: is_valid, organization_id, organization_name, admin_name, member_count, etc.
```

### `fn_get_user_organizations(@user_id)`
Obtiene todas las organizaciones de un usuario con su estado completo.
```sql
SELECT * FROM fn_get_user_organizations('YOUR_USER_ID')
ORDER BY is_primary DESC, is_archived;
```

## 👁️ Vistas Útiles

### `vw_organizations_with_subscription`
Organizaciones con información de suscripción activa, límites y conteos actuales.
```sql
SELECT * FROM vw_organizations_with_subscription;
```

### `vw_users_with_primary_org`
Usuarios con su organización principal.
```sql
SELECT * FROM vw_users_with_primary_org;
```

### `vw_organizations_usage_status`
Estado de uso de todas las organizaciones con límites alcanzados.
```sql
SELECT * FROM vw_organizations_usage_status
WHERE users_limit_reached = 1 OR reports_limit_reached = 1;
```

### `vw_subscriptions_requiring_attention`
Suscripciones que requieren atención (vencimientos próximos, pagos pendientes).
```sql
SELECT * FROM vw_subscriptions_requiring_attention;
```

### `vw_user_organizations_dashboard`
Dashboard completo de organizaciones del usuario para la UI.
```sql
SELECT * FROM vw_user_organizations_dashboard
WHERE user_id = 'YOUR_USER_ID'
ORDER BY is_primary DESC, organization_name;
```

## 🔄 Procedimientos Almacenados

### Flujo UX de Organizaciones

#### `sp_create_organization_with_user`
Crea una nueva organización, asigna plan free_trial automáticamente y establece al usuario como admin.
```sql
EXEC sp_create_organization_with_user
    @user_id = 'YOUR_USER_ID',
    @organization_name = 'Mi Nueva Organización',
    @make_primary = 1; -- Hacerla organización primaria
```

#### `sp_join_organization_by_invitation`
Unirse a organización usando código de invitación. Retorna si el usuario tiene organización existente.
```sql
EXEC sp_join_organization_by_invitation
    @user_id = 'YOUR_USER_ID',
    @invitation_token = 'ABC-123-XYZ',
    @accept_invitation = 1;
```

#### `sp_archive_and_join_organization`
Archiva la organización actual del usuario y establece la nueva como primaria.
```sql
EXEC sp_archive_and_join_organization
    @user_id = 'YOUR_USER_ID',
    @old_organization_id = 'OLD_ORG_ID',
    @new_organization_id = 'NEW_ORG_ID';
```

#### `sp_keep_both_set_new_primary`
Mantiene ambas organizaciones pero establece la nueva como primaria.
```sql
EXEC sp_keep_both_set_new_primary
    @user_id = 'YOUR_USER_ID',
    @new_organization_id = 'NEW_ORG_ID';
```

#### `sp_change_primary_organization`
Cambia la organización primaria del usuario (para el selector de organización).
```sql
EXEC sp_change_primary_organization
    @user_id = 'YOUR_USER_ID',
    @new_primary_org_id = 'NEW_PRIMARY_ORG_ID';
```

#### `sp_reactivate_organization`
Reactivar una organización archivada.
```sql
EXEC sp_reactivate_organization
    @user_id = 'YOUR_USER_ID',
    @organization_id = 'ORG_ID';
```

#### `sp_create_invitation_token`
Crear código de invitación para una organización.
```sql
EXEC sp_create_invitation_token
    @organization_id = 'ORG_ID',
    @invited_by = 'ADMIN_USER_ID',
    @email = 'invitado@example.com',
    @expires_in_days = 7;
```

### Gestión de Suscripciones

#### `sp_archive_organization`
Archiva una organización y cancela su suscripción.
```sql
EXEC sp_archive_organization 
    @organization_id = 'YOUR_ORG_ID',
    @archived_by = 'YOUR_USER_ID';
```

#### `sp_change_plan`
Cambia el plan de una organización y registra el cambio en el historial.
```sql
EXEC sp_change_plan
    @organization_id = 'YOUR_ORG_ID',
    @new_plan_id = 'enterprise',
    @changed_by = 'YOUR_USER_ID',
    @billing_cycle = 'monthly';
```

#### `sp_subscription_activate`
Transición: Trialing → Active (después de checkout exitoso).
```sql
EXEC sp_subscription_activate
    @subscription_id = 'SUB_ID',
    @stripe_subscription_id = 'sub_xxx',
    @stripe_price_id = 'price_xxx';
```

#### `sp_subscription_cancel`
Transición: Active → Canceled.
```sql
EXEC sp_subscription_cancel
    @subscription_id = 'SUB_ID',
    @cancel_at_period_end = 1, -- Cancelar al final del período
    @canceled_by = 'USER_ID';
```

#### `sp_subscription_mark_past_due`
Transición: Active → PastDue (cuando falla el pago).
```sql
EXEC sp_subscription_mark_past_due
    @subscription_id = 'SUB_ID',
    @stripe_event_id = 'evt_xxx';
```

#### `sp_subscription_resolve_past_due`
Transición: PastDue → Active (cuando se resuelve el pago).
```sql
EXEC sp_subscription_resolve_past_due
    @subscription_id = 'SUB_ID',
    @stripe_event_id = 'evt_xxx';
```

## 📝 Consultas Comunes

Ver `useful_queries.sql` para ejemplos de:
- Validación de límites
- Consultas de suscripciones
- Estadísticas de uso
- Consultas de usuarios y organizaciones
- Reportes y procesamiento

## 🔐 Seguridad

- Todas las contraseñas se almacenan como hashes (para auth local)
- Los tokens de invitación tienen expiración
- Los registros de auditoría están en `subscription_history`

## 🔄 Triggers Automáticos

Todos los triggers están configurados para actualizar automáticamente `updated_at` cuando se modifica un registro en:
- `users`
- `organizations`
- `plans`
- `subscriptions`
- `organization_members`
- `reports`

## 📊 Integración con Stripe

El esquema está preparado para integrarse con Stripe:

- **Organizaciones:** `stripe_customer_id` para identificar clientes
- **Suscripciones:** `stripe_subscription_id` y `stripe_price_id` para tracking
- **Historial:** `stripe_event_id` para rastrear webhooks
- **Planes:** `stripe_price_id_monthly` y `stripe_price_id_yearly`

## 🚨 Validaciones Importantes

1. **Una organización solo puede tener una suscripción activa** (constraint único)
2. **Un usuario solo puede tener una organización primaria** (lógica de aplicación)
3. **Los límites de usuarios y reportes deben validarse antes de insertar** (usar las funciones proporcionadas)

## 📈 Escalabilidad

El esquema incluye índices optimizados para:
- Búsquedas por email de usuario
- Consultas por organización
- Filtrado por estado de suscripción
- Búsquedas de reportes por organización y estado

## 🔧 Mantenimiento

### Limpiar reportes eliminados (soft delete)
```sql
-- Los reportes con is_deleted = 1 se mantienen para auditoría
-- Si se necesita limpiar físicamente después de X días:
DELETE FROM reports 
WHERE is_deleted = 1 
AND deleted_at < DATEADD(day, -90, GETUTCDATE());
```

### Limpiar historial antiguo
```sql
-- Mantener solo últimos 2 años de historial
DELETE FROM subscription_history
WHERE created_at < DATEADD(year, -2, GETUTCDATE());
```

## 📚 Referencias

- Los tipos JSON requieren SQL Server 2016+
- UUID se maneja como `UNIQUEIDENTIFIER` en SQL Server
- Los campos de fecha usan `DATETIME2` para mejor precisión

## ⚠️ Notas Importantes

1. **Azure Blob Storage:** Los archivos físicos se almacenan en Azure, solo se guarda la referencia en `reports.file_url` y `reports.blob_name`

2. **Soft Delete:** Tanto `organizations` como `reports` usan soft delete (`is_archived`, `is_deleted`) para mantener integridad referencial

3. **Billing Cycle:** Actualmente se soporta `monthly` y `yearly`, pero el esquema es extensible

4. **Free Trial:** Durante el período actual, todas las organizaciones están en `free_trial`, pero el esquema soporta la transición a planes pagos

## 🐛 Troubleshooting

### Error al crear suscripción
Verificar que no exista otra suscripción activa para la organización:
```sql
SELECT * FROM subscriptions 
WHERE organization_id = 'YOUR_ORG_ID' 
AND status IN ('active', 'trialing');
```

### Usuario no puede agregarse a organización
Verificar límites del plan:
```sql
SELECT dbo.fn_can_add_user('YOUR_ORG_ID');
```

### Reporte no se puede subir
Verificar límites del plan:
```sql
SELECT dbo.fn_can_add_report('YOUR_ORG_ID');
```

