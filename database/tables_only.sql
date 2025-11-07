-- ============================================================================
-- EMPOWER REPORTS - Definiciones de Tablas
-- ============================================================================
-- Solo las definiciones de tablas principales con sus índices y constraints
-- Sin triggers, procedures ni funciones
-- ============================================================================

USE empower_reports;
GO

-- ============================================================================
-- TABLA: plans
-- ============================================================================

IF OBJECT_ID('plans', 'U') IS NOT NULL DROP TABLE plans;
GO

CREATE TABLE plans (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_users INT NOT NULL DEFAULT 1,
    max_reports INT NOT NULL DEFAULT 10,
    max_storage_mb INT NOT NULL DEFAULT 100,
    features JSON,
    price_monthly DECIMAL(10, 2) NULL,
    price_yearly DECIMAL(10, 2) NULL,
    stripe_price_id_monthly VARCHAR(255) NULL,
    stripe_price_id_yearly VARCHAR(255) NULL,
    max_organizations INT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

CREATE INDEX idx_plans_name ON plans(name);
GO

-- ============================================================================
-- TABLA: users
-- ============================================================================

IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    auth_provider VARCHAR(50) NOT NULL CHECK (auth_provider IN ('google', 'linkedin', 'azure_ad', 'email')),
    auth_provider_id VARCHAR(255) NULL,
    password_hash VARCHAR(255) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    is_email_verified BIT NOT NULL DEFAULT 0,
    last_login_at DATETIME2 NULL,
    metadata JSON NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
CREATE INDEX idx_users_is_active ON users(is_active);
GO

-- ============================================================================
-- TABLA: organizations
-- ============================================================================

IF OBJECT_ID('organizations', 'U') IS NOT NULL DROP TABLE organizations;
GO

CREATE TABLE organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NULL UNIQUE,
    logo_url VARCHAR(500) NULL,
    website VARCHAR(255) NULL,
    stripe_customer_id VARCHAR(255) NULL,
    is_archived BIT NOT NULL DEFAULT 0,
    archived_at DATETIME2 NULL,
    metadata JSON NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_archived ON organizations(is_archived);
CREATE INDEX idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);
GO

-- ============================================================================
-- TABLA: organization_members
-- ============================================================================

IF OBJECT_ID('organization_members', 'U') IS NOT NULL DROP TABLE organization_members;
GO

CREATE TABLE organization_members (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'admin_global', 'member', 'viewer')),
    is_primary BIT NOT NULL DEFAULT 0,
    invited_by UNIQUEIDENTIFIER NULL,
    invitation_token VARCHAR(255) NULL,
    invitation_expires_at DATETIME2 NULL,
    joined_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    left_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_org_members_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_org_members_invited_by FOREIGN KEY (invited_by) REFERENCES users(id),
    CONSTRAINT uk_org_members_org_user UNIQUE (organization_id, user_id)
);
GO

CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_role ON organization_members(role);
CREATE INDEX idx_org_members_is_primary ON organization_members(is_primary);
CREATE INDEX idx_org_members_invitation_token ON organization_members(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX idx_org_members_org_active ON organization_members(organization_id, left_at) WHERE left_at IS NULL;
GO

-- ============================================================================
-- TABLA: subscriptions
-- ============================================================================

IF OBJECT_ID('subscriptions', 'U') IS NOT NULL DROP TABLE subscriptions;
GO

CREATE TABLE subscriptions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'unpaid', 'incomplete')),
    billing_cycle VARCHAR(20) NULL CHECK (billing_cycle IS NULL OR billing_cycle IN ('monthly', 'yearly')),
    current_period_start DATETIME2 NOT NULL,
    current_period_end DATETIME2 NOT NULL,
    cancel_at_period_end BIT NOT NULL DEFAULT 0,
    canceled_at DATETIME2 NULL,
    trial_start DATETIME2 NULL,
    trial_end DATETIME2 NULL,
    stripe_subscription_id VARCHAR(255) NULL UNIQUE,
    stripe_price_id VARCHAR(255) NULL,
    metadata JSON NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_subscriptions_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES plans(id)
);
GO

CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE UNIQUE INDEX uk_subscriptions_active_org 
ON subscriptions(organization_id) 
WHERE status IN ('active', 'trialing');
GO

-- ============================================================================
-- TABLA: subscription_history
-- ============================================================================

IF OBJECT_ID('subscription_history', 'U') IS NOT NULL DROP TABLE subscription_history;
GO

CREATE TABLE subscription_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    subscription_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    plan_id_old VARCHAR(50) NULL,
    plan_id_new VARCHAR(50) NOT NULL,
    status_old VARCHAR(50) NULL,
    status_new VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('created', 'updated', 'canceled', 'reactivated', 'plan_changed', 'billing_cycle_changed', 'stripe_webhook')),
    stripe_event_id VARCHAR(255) NULL,
    metadata JSON NULL,
    changed_by UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_sub_history_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_history_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_history_plan_new FOREIGN KEY (plan_id_new) REFERENCES plans(id),
    CONSTRAINT fk_sub_history_plan_old FOREIGN KEY (plan_id_old) REFERENCES plans(id),
    CONSTRAINT fk_sub_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id)
);
GO

CREATE INDEX idx_sub_history_subscription_id ON subscription_history(subscription_id);
CREATE INDEX idx_sub_history_organization_id ON subscription_history(organization_id);
CREATE INDEX idx_sub_history_event_type ON subscription_history(event_type);
CREATE INDEX idx_sub_history_created_at ON subscription_history(created_at);
CREATE INDEX idx_sub_history_stripe_event_id ON subscription_history(stripe_event_id) WHERE stripe_event_id IS NOT NULL;
GO

-- ============================================================================
-- TABLA: reports
-- ============================================================================

IF OBJECT_ID('reports', 'U') IS NOT NULL DROP TABLE reports;
GO

CREATE TABLE reports (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_url VARCHAR(500) NULL,
    blob_name VARCHAR(255) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'failed', 'deleted')),
    processing_started_at DATETIME2 NULL,
    processing_completed_at DATETIME2 NULL,
    error_message TEXT NULL,
    metadata JSON NULL,
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,
    deleted_by UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_reports_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
);
GO

CREATE INDEX idx_reports_organization_id ON reports(organization_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_is_deleted ON reports(is_deleted);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_blob_name ON reports(blob_name) WHERE blob_name IS NOT NULL;
CREATE INDEX idx_reports_org_status_deleted ON reports(organization_id, status, is_deleted) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_reports_user_individual ON reports(user_id, organization_id) WHERE organization_id IS NULL;
GO

-- ============================================================================
-- TABLA: organization_documentation
-- ============================================================================

IF OBJECT_ID('organization_documentation', 'U') IS NOT NULL DROP TABLE organization_documentation;
GO

CREATE TABLE organization_documentation (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    documentation_url VARCHAR(500) NOT NULL,
    description TEXT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_by UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_org_doc_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_org_doc_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

CREATE INDEX idx_org_doc_organization ON organization_documentation(organization_id);
CREATE INDEX idx_org_doc_active ON organization_documentation(is_active);
GO

-- ============================================================================
-- TABLA: enterprise_pro_managed_organizations
-- ============================================================================

IF OBJECT_ID('enterprise_pro_managed_organizations', 'U') IS NOT NULL DROP TABLE enterprise_pro_managed_organizations;
GO

CREATE TABLE enterprise_pro_managed_organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    enterprise_pro_org_id UNIQUEIDENTIFIER NOT NULL,
    managed_organization_id UNIQUEIDENTIFIER NOT NULL,
    admin_user_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_ep_managed_ep_org FOREIGN KEY (enterprise_pro_org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_ep_managed_org FOREIGN KEY (managed_organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_ep_managed_admin FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_ep_managed_org UNIQUE (managed_organization_id),
    CONSTRAINT uk_ep_managed_ep_org_managed UNIQUE (enterprise_pro_org_id, managed_organization_id)
);
GO

CREATE INDEX idx_ep_managed_ep_org ON enterprise_pro_managed_organizations(enterprise_pro_org_id);
CREATE INDEX idx_ep_managed_org ON enterprise_pro_managed_organizations(managed_organization_id);
CREATE INDEX idx_ep_managed_admin ON enterprise_pro_managed_organizations(admin_user_id);
CREATE INDEX idx_ep_managed_ep_org_archived ON enterprise_pro_managed_organizations(enterprise_pro_org_id) INCLUDE (managed_organization_id);
GO

-- ============================================================================
-- VISTAS
-- ============================================================================

CREATE OR ALTER VIEW vw_organizations_with_subscription AS
SELECT 
    o.id, o.name, o.slug, o.stripe_customer_id,
    s.id AS subscription_id, s.plan_id, p.name AS plan_name,
    s.status AS subscription_status, s.current_period_end, s.trial_end,
    (SELECT COUNT(*) FROM organization_members om WHERE om.organization_id = o.id AND om.left_at IS NULL) AS current_users_count,
    (SELECT COUNT(*) FROM reports r WHERE r.organization_id = o.id AND r.is_deleted = 0) AS current_reports_count,
    p.max_users, p.max_reports, o.created_at
FROM organizations o
LEFT JOIN subscriptions s ON s.organization_id = o.id AND s.status IN ('active', 'trialing')
LEFT JOIN plans p ON p.id = s.plan_id
WHERE o.is_archived = 0;
GO

CREATE OR ALTER VIEW vw_users_with_primary_org AS
SELECT 
    u.id, u.email, u.name, u.auth_provider, u.last_login_at,
    om.organization_id AS primary_organization_id,
    o.name AS primary_organization_name,
    u.created_at
FROM users u
LEFT JOIN organization_members om ON om.user_id = u.id AND om.is_primary = 1 AND om.left_at IS NULL
LEFT JOIN organizations o ON o.id = om.organization_id
WHERE u.is_active = 1;
GO

CREATE OR ALTER VIEW vw_user_organizations_dashboard AS
SELECT 
    om.user_id,
    o.id AS organization_id,
    o.name AS organization_name,
    o.slug,
    om.role,
    om.is_primary,
    om.joined_at,
    o.is_archived,
    s.plan_id,
    p.name AS plan_name,
    s.status AS subscription_status,
    s.trial_end,
    s.current_period_end,
    (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id AND left_at IS NULL) AS member_count,
    (SELECT COUNT(*) FROM reports WHERE organization_id = o.id AND is_deleted = 0) AS report_count,
    p.max_users,
    p.max_reports
FROM organization_members om
INNER JOIN organizations o ON o.id = om.organization_id
LEFT JOIN subscriptions s ON s.organization_id = o.id AND s.status IN ('active', 'trialing')
LEFT JOIN plans p ON p.id = s.plan_id
WHERE om.left_at IS NULL;
GO

PRINT 'Tablas creadas: plans, users, organizations, organization_documentation, organization_members, subscriptions, subscription_history, reports, enterprise_pro_managed_organizations';
PRINT 'Vistas creadas: vw_organizations_with_subscription, vw_users_with_primary_org, vw_user_organizations_dashboard';
GO

