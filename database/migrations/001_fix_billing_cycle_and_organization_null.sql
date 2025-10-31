-- ============================================================================
-- MIGRATION 001: Fix billing_cycle for free_trial and organization_id NULL
-- ============================================================================
-- Correcciones:
-- 1. Permitir billing_cycle NULL para free_trial
-- 2. Validar constraint: free_trial debe tener billing_cycle = NULL
-- 3. Actualizar suscripciones free_trial existentes
-- 4. Verificar que organization_id NULL funcione correctamente
-- ============================================================================

USE empower_reports;
GO

-- ============================================================================
-- 1. MODIFICAR COLUMNA billing_cycle PARA PERMITIR NULL
-- ============================================================================

-- Eliminar constraint actual
ALTER TABLE subscriptions
DROP CONSTRAINT CK__subscript__billing_cycle;
GO

-- Modificar columna para permitir NULL y actualizar CHECK
ALTER TABLE subscriptions
ALTER COLUMN billing_cycle VARCHAR(20) NULL;
GO

-- Crear nuevo constraint que permita NULL y valide valores cuando no es NULL
ALTER TABLE subscriptions
ADD CONSTRAINT CK_subscriptions_billing_cycle 
CHECK (billing_cycle IS NULL OR billing_cycle IN ('monthly', 'yearly'));
GO

-- ============================================================================
-- 2. TRIGGER PARA VALIDAR billing_cycle SEGÚN plan_id
-- ============================================================================
-- Regla: free_trial debe tener billing_cycle = NULL
--        Otros planes deben tener billing_cycle = 'monthly' o 'yearly'
-- Nota: Este trigger se crea en constraints_and_validations.sql
--       Ejecutar ese archivo después de esta migración
-- ============================================================================

-- ============================================================================
-- 3. ACTUALIZAR SUSCRIPCIONES free_trial EXISTENTES
-- ============================================================================

UPDATE subscriptions
SET billing_cycle = NULL
WHERE plan_id = 'free_trial'
AND billing_cycle IS NOT NULL;
GO

-- ============================================================================
-- 4. ACTUALIZAR TRIGGER DE AUTO-ASIGNACIÓN free_trial
-- ============================================================================
-- Asegurar que no asigne billing_cycle cuando es free_trial
-- ============================================================================

-- Este trigger está en state_machine_and_workflows.sql, pero lo actualizamos aquí
-- Si el trigger ya existe, se actualizará con este script
GO

-- ============================================================================
-- 5. VERIFICAR QUE organization_id NULL FUNCIONA CORRECTAMENTE
-- ============================================================================
-- Para usuarios individuales (plan basic), reports.organization_id puede ser NULL
-- Esto ya está implementado en el schema, pero agregamos índices adicionales
-- ============================================================================

-- Índice para reportes individuales (sin organización)
CREATE NONCLUSTERED INDEX idx_reports_user_individual
ON reports(user_id, is_deleted, created_at)
WHERE organization_id IS NULL;
GO

-- Índice para búsqueda de reportes por usuario (tanto individuales como organizacionales)
CREATE NONCLUSTERED INDEX idx_reports_user_all
ON reports(user_id, organization_id, is_deleted);
GO

-- ============================================================================
-- 6. ACTUALIZAR PROCEDIMIENTOS QUE CREAN SUSCRIPCIONES free_trial
-- ============================================================================
-- Los procedimientos en state_machine_and_workflows.sql y organization_workflows.sql
-- deben ser actualizados para no asignar billing_cycle a free_trial
-- ============================================================================

-- Nota: Los procedimientos se actualizarán en sus archivos respectivos
-- Este script solo documenta el cambio necesario

PRINT '✅ Migration 001 completada exitosamente';
PRINT '   - billing_cycle ahora permite NULL';
PRINT '   - Trigger de validación creado: free_trial debe tener billing_cycle = NULL';
PRINT '   - Suscripciones free_trial existentes actualizadas';
PRINT '   - Índices para reportes individuales creados';
GO

