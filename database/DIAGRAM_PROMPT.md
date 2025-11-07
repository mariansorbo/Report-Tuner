# PROMPT PARA DIAGRAMA UML/ER - EMPOWER REPORTS

Crea un diagrama UML de clases (Entidad-Relación) completo para la base de datos de "Empower Reports", un SaaS para documentación de reportes de Power BI.

## TABLAS PRINCIPALES

### 1. **users**
- **id** (UUID, PK)
- **email** (VARCHAR, UNIQUE)
- **name** (VARCHAR)
- **avatar_url** (VARCHAR, NULL)
- **auth_provider** (VARCHAR: 'google', 'linkedin', 'azure_ad', 'email')
- **auth_provider_id** (VARCHAR, NULL)
- **password_hash** (VARCHAR, NULL)
- **is_active** (BIT)
- **is_email_verified** (BIT)
- **last_login_at** (DATETIME, NULL)
- **metadata** (JSON, NULL)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)

### 2. **organizations**
- **id** (UUID, PK)
- **name** (VARCHAR)
- **slug** (VARCHAR, UNIQUE, NULL)
- **logo_url** (VARCHAR, NULL)
- **website** (VARCHAR, NULL)
- **stripe_customer_id** (VARCHAR, NULL)
- **is_archived** (BIT)
- **archived_at** (DATETIME, NULL)
- **metadata** (JSON, NULL)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)

### 3. **organization_members**
- **id** (UUID, PK)
- **organization_id** (UUID, FK → organizations)
- **user_id** (UUID, FK → users)
- **role** (VARCHAR: 'admin', 'member', 'viewer')
- **is_primary** (BIT) - Indica organización principal del usuario
- **invited_by** (UUID, FK → users, NULL)
- **invitation_token** (VARCHAR, NULL)
- **invitation_expires_at** (DATETIME, NULL)
- **joined_at** (DATETIME)
- **left_at** (DATETIME, NULL)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)
- **UNIQUE(organization_id, user_id)**

### 4. **plans**
- **id** (VARCHAR(50), PK) - Valores: 'free_trial', 'basic', 'teams', 'enterprise'
- **name** (VARCHAR)
- **description** (TEXT, NULL)
- **max_users** (INT)
- **max_reports** (INT)
- **max_storage_mb** (INT)
- **features** (JSON) - Ej: {"api_access": true, "branding": false}
- **price_monthly** (DECIMAL, NULL)
- **price_yearly** (DECIMAL, NULL)
- **stripe_price_id_monthly** (VARCHAR, NULL)
- **stripe_price_id_yearly** (VARCHAR, NULL)
- **is_active** (BIT)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)

### 5. **subscriptions**
- **id** (UUID, PK)
- **organization_id** (UUID, FK → organizations)
- **plan_id** (VARCHAR(50), FK → plans)
- **status** (VARCHAR: 'active', 'trialing', 'canceled', 'past_due', 'unpaid', 'incomplete')
- **billing_cycle** (VARCHAR: 'monthly', 'yearly', NULL) - NULL para free_trial
- **current_period_start** (DATETIME)
- **current_period_end** (DATETIME)
- **cancel_at_period_end** (BIT)
- **canceled_at** (DATETIME, NULL)
- **trial_start** (DATETIME, NULL)
- **trial_end** (DATETIME, NULL)
- **stripe_subscription_id** (VARCHAR, UNIQUE, NULL)
- **stripe_price_id** (VARCHAR, NULL)
- **metadata** (JSON, NULL)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)
- **UNIQUE(organization_id)** WHERE status IN ('active', 'trialing')

### 6. **subscription_history**
- **id** (UUID, PK)
- **subscription_id** (UUID, FK → subscriptions)
- **organization_id** (UUID, FK → organizations)
- **plan_id_old** (VARCHAR(50), FK → plans, NULL)
- **plan_id_new** (VARCHAR(50), FK → plans)
- **status_old** (VARCHAR, NULL)
- **status_new** (VARCHAR)
- **event_type** (VARCHAR: 'created', 'updated', 'canceled', 'reactivated', 'plan_changed', 'billing_cycle_changed', 'stripe_webhook')
- **stripe_event_id** (VARCHAR, NULL)
- **metadata** (JSON, NULL)
- **changed_by** (UUID, FK → users, NULL)
- **created_at** (DATETIME)

### 7. **reports**
- **id** (UUID, PK)
- **organization_id** (UUID, FK → organizations, NULL) - NULL para usuarios individuales (plan basic)
- **user_id** (UUID, FK → users)
- **name** (VARCHAR)
- **original_filename** (VARCHAR)
- **file_size_bytes** (BIGINT)
- **file_url** (VARCHAR, NULL)
- **blob_name** (VARCHAR, NULL)
- **status** (VARCHAR: 'uploaded', 'processing', 'processed', 'failed', 'deleted')
- **processing_started_at** (DATETIME, NULL)
- **processing_completed_at** (DATETIME, NULL)
- **error_message** (TEXT, NULL)
- **metadata** (JSON, NULL)
- **is_deleted** (BIT)
- **deleted_at** (DATETIME, NULL)
- **deleted_by** (UUID, FK → users, NULL)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)

## TABLAS DE PRICING CUSTOMIZATION

### 8. **organization_pricing_overrides**
- **id** (UUID, PK)
- **organization_id** (UUID, FK → organizations)
- **plan_id** (VARCHAR(50), FK → plans)
- **custom_price_monthly** (DECIMAL, NULL)
- **custom_price_yearly** (DECIMAL, NULL)
- **discount_percentage** (DECIMAL, NULL)
- **is_preferential_pricing** (BIT)
- **notes** (TEXT, NULL)
- **applied_by** (UUID, FK → users, NULL)
- **valid_from** (DATETIME)
- **valid_until** (DATETIME, NULL)
- **is_active** (BIT)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)
- **UNIQUE(organization_id, plan_id)**

### 9. **plan_customizations**
- **id** (UUID, PK)
- **base_plan_id** (VARCHAR(50), FK → plans)
- **custom_plan_name** (VARCHAR)
- **custom_plan_code** (VARCHAR, UNIQUE)
- **custom_max_users** (INT, NULL)
- **custom_max_reports** (INT, NULL)
- **custom_max_storage_mb** (INT, NULL)
- **custom_features** (JSON, NULL)
- **target_segment** (VARCHAR, NULL)
- **target_industry** (VARCHAR, NULL)
- **custom_price_monthly** (DECIMAL, NULL)
- **custom_price_yearly** (DECIMAL, NULL)
- **is_active** (BIT)
- **is_hidden** (BIT)
- **metadata** (JSON, NULL)
- **created_by** (UUID, FK → users, NULL)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)

### 10. **organization_plan_assignments**
- **id** (UUID, PK)
- **organization_id** (UUID, FK → organizations)
- **custom_plan_id** (UUID, FK → plan_customizations, NULL)
- **standard_plan_id** (VARCHAR(50), FK → plans, NULL)
- **effective_plan_type** (VARCHAR: 'standard', 'custom')
- **assigned_by** (UUID, FK → users, NULL)
- **assigned_at** (DATETIME)
- **notes** (TEXT, NULL)
- **is_active** (BIT)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)
- **UNIQUE(organization_id)** WHERE is_active = 1

### 11. **free_trial_controls**
- **id** (INT, PK, IDENTITY)
- **trial_end_date** (DATETIME, NULL)
- **is_trial_unlimited** (BIT)
- **max_trial_duration_days** (INT, NULL)
- **trial_grace_period_days** (INT)
- **test_mode_max_users** (INT, NULL)
- **test_mode_max_reports** (INT, NULL)
- **test_mode_max_storage_mb** (INT, NULL)
- **allow_org_extensions** (BIT)
- **notes** (TEXT, NULL)
- **updated_by** (UUID, FK → users, NULL)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)

### 12. **organization_trial_extensions**
- **id** (UUID, PK)
- **organization_id** (UUID, FK → organizations)
- **subscription_id** (UUID, FK → subscriptions)
- **extended_until** (DATETIME)
- **extension_reason** (TEXT, NULL)
- **granted_by** (UUID, FK → users, NULL)
- **is_active** (BIT)
- **created_at** (DATETIME)
- **updated_at** (DATETIME)

## RELACIONES Y CARDINALIDADES

1. **users** ↔ **organization_members** (1:N)
   - Un usuario puede pertenecer a múltiples organizaciones
   - Un miembro pertenece a un usuario

2. **organizations** ↔ **organization_members** (1:N)
   - Una organización tiene múltiples miembros
   - Un miembro pertenece a una organización

3. **users** → **organization_members** (invited_by) (1:N)
   - Un usuario puede invitar a múltiples miembros
   - Un miembro fue invitado por un usuario (opcional)

4. **organizations** ↔ **subscriptions** (1:1 activa)
   - Una organización tiene UNA suscripción activa/trialing
   - Una suscripción pertenece a una organización

5. **plans** ↔ **subscriptions** (1:N)
   - Un plan puede tener múltiples suscripciones
   - Una suscripción tiene un plan

6. **subscriptions** ↔ **subscription_history** (1:N)
   - Una suscripción tiene múltiples eventos de historial
   - Un evento de historial pertenece a una suscripción

7. **plans** ↔ **subscription_history** (plan_id_old, plan_id_new) (1:N)
   - Un plan puede aparecer en múltiples eventos de historial (como old o new)

8. **users** ↔ **reports** (1:N)
   - Un usuario puede tener múltiples reportes
   - Un reporte pertenece a un usuario

9. **organizations** ↔ **reports** (1:N, opcional)
   - Una organización puede tener múltiples reportes
   - Un reporte puede pertenecer a una organización (NULL para usuarios individuales)

10. **users** → **reports** (deleted_by) (1:N)
    - Un usuario puede eliminar múltiples reportes
    - Un reporte fue eliminado por un usuario (opcional)

11. **organizations** ↔ **organization_pricing_overrides** (1:N)
    - Una organización puede tener múltiples overrides de precio (uno por plan)
    - Un override pertenece a una organización

12. **plans** ↔ **organization_pricing_overrides** (1:N)
    - Un plan puede tener múltiples overrides por organización
    - Un override está asociado a un plan

13. **plans** ↔ **plan_customizations** (1:N)
    - Un plan base puede tener múltiples planes customizados
    - Un plan customizado se basa en un plan estándar

14. **organizations** ↔ **organization_plan_assignments** (1:1 activa)
    - Una organización tiene UNA asignación de plan activa
    - Una asignación pertenece a una organización

15. **plan_customizations** ↔ **organization_plan_assignments** (1:N)
    - Un plan customizado puede estar asignado a múltiples organizaciones
    - Una asignación puede usar un plan customizado (opcional)

16. **organizations** ↔ **organization_trial_extensions** (1:N)
    - Una organización puede tener múltiples extensiones de trial
    - Una extensión pertenece a una organización

17. **subscriptions** ↔ **organization_trial_extensions** (1:N)
    - Una suscripción puede tener múltiples extensiones
    - Una extensión está asociada a una suscripción

## COLORES Y ESTILOS SUGERIDOS

- **Tablas principales** (users, organizations, plans, subscriptions, reports): Azul claro
- **Tablas de relaciones** (organization_members): Verde claro
- **Tablas de historial** (subscription_history): Amarillo claro
- **Tablas de pricing** (pricing_overrides, plan_customizations, assignments): Naranja claro
- **Tablas de control** (free_trial_controls, trial_extensions): Morado claro

## NOTAS IMPORTANTES

- **organization_id en reports** puede ser NULL (para usuarios individuales con plan basic)
- **billing_cycle en subscriptions** puede ser NULL (para free_trial)
- **is_primary en organization_members** indica la organización principal del usuario (solo una por usuario)
- **status en subscriptions** tiene constraint único: una organización solo puede tener una suscripción 'active' o 'trialing'
- **effective_plan_type en organization_plan_assignments** determina si usa plan estándar o customizado

## FORMATO DE SALIDA

Genera un diagrama UML de clases con:
- Cada tabla como una clase con sus atributos
- Tipos de datos simplificados (UUID, VARCHAR, INT, DATETIME, BIT, JSON, DECIMAL)
- Relaciones con cardinalidades (1..1, 1..*, 0..*)
- Nombres de foreign keys visibles en las relaciones
- Colores diferenciados por tipo de tabla
- Layout organizado: tablas principales arriba, relaciones en medio, tablas de soporte abajo

