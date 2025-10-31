// Servicio para manejar organizaciones
// Usa localStorage para simular persistencia
// En un entorno real, esto sería una API REST

const STORAGE_KEY_ORGS = 'empower_reports_organizations'
const STORAGE_KEY_USER_ORGS = 'empower_reports_user_organizations'

// Cargar organizaciones desde localStorage
const loadOrganizationsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ORGS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error cargando organizaciones desde localStorage:', error)
    return []
  }
}

// Guardar organizaciones en localStorage
const saveOrganizationsToStorage = (organizations) => {
  try {
    localStorage.setItem(STORAGE_KEY_ORGS, JSON.stringify(organizations))
    return true
  } catch (error) {
    console.error('Error guardando organizaciones en localStorage:', error)
    return false
  }
}

// Cargar relaciones usuario-organización
const loadUserOrganizationsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USER_ORGS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error cargando relaciones usuario-org:', error)
    return []
  }
}

// Guardar relaciones usuario-organización
const saveUserOrganizationsToStorage = (userOrgs) => {
  try {
    localStorage.setItem(STORAGE_KEY_USER_ORGS, JSON.stringify(userOrgs))
    return true
  } catch (error) {
    console.error('Error guardando relaciones usuario-org:', error)
    return false
  }
}

// Crear nueva organización
export const createOrganization = async (name, userId) => {
  try {
    const organizations = loadOrganizationsFromStorage()
    const userOrgs = loadUserOrganizationsFromStorage()
    
    const newOrg = {
      id: `org_${Date.now()}`,
      name,
      plan: 'free_trial',
      member_count: 1,
      created_at: new Date().toISOString(),
      is_archived: false
    }
    
    organizations.push(newOrg)
    saveOrganizationsToStorage(organizations)
    
    // Crear relación usuario-org
    const newUserOrg = {
      user_id: userId,
      organization_id: newOrg.id,
      role: 'admin',
      is_primary: true,
      joined_at: new Date().toISOString()
    }
    
    userOrgs.push(newUserOrg)
    saveUserOrganizationsToStorage(userOrgs)
    
    return { success: true, organization: newOrg }
  } catch (error) {
    console.error('Error creando organización:', error)
    return { success: false, error: 'Error al crear organización' }
  }
}

// Unirse a organización por código de invitación
export const joinOrganizationByCode = async (invitationCode, userId) => {
  try {
    // Simulación: códigos dummy para testing
    const invitationMap = {
      'DATA-LATAM-2024': {
        id: 'org_data_latam',
        name: 'Data LATAM',
        admin: 'Camila Reyes',
        members: 5
      },
      'TEST-ORG': {
        id: 'org_test',
        name: 'Test Organization',
        admin: 'Juan Pérez',
        members: 3
      }
    }
    
    const orgData = invitationMap[invitationCode.toUpperCase()]
    
    if (!orgData) {
      return { success: false, error: 'Código de invitación inválido' }
    }
    
    const organizations = loadOrganizationsFromStorage()
    const userOrgs = loadUserOrganizationsFromStorage()
    
    // Buscar o crear la organización
    let org = organizations.find(o => o.id === orgData.id)
    if (!org) {
      org = {
        id: orgData.id,
        name: orgData.name,
        plan: 'free_trial',
        member_count: orgData.members,
        created_at: new Date().toISOString(),
        is_archived: false
      }
      organizations.push(org)
      saveOrganizationsToStorage(organizations)
    }
    
    // Verificar si el usuario ya está en esta organización
    const existingRelation = userOrgs.find(
      uo => uo.user_id === userId && uo.organization_id === org.id
    )
    
    if (!existingRelation) {
      // Agregar relación
      const newUserOrg = {
        user_id: userId,
        organization_id: org.id,
        role: 'member',
        is_primary: false,
        joined_at: new Date().toISOString()
      }
      userOrgs.push(newUserOrg)
      saveUserOrganizationsToStorage(userOrgs)
    }
    
    return {
      success: true,
      organization: {
        ...org,
        admin: orgData.admin,
        members: orgData.members
      }
    }
  } catch (error) {
    console.error('Error uniéndose a organización:', error)
    return { success: false, error: 'Error al unirse a la organización' }
  }
}

// Obtener organizaciones del usuario
export const getUserOrganizations = async (userId) => {
  try {
    const organizations = loadOrganizationsFromStorage()
    const userOrgs = loadUserOrganizationsFromStorage()
    
    const userOrgRelations = userOrgs.filter(uo => uo.user_id === userId)
    
    const userOrganizations = userOrgRelations.map(relation => {
      const org = organizations.find(o => o.id === relation.organization_id)
      return org ? {
        ...org,
        role: relation.role,
        is_primary: relation.is_primary,
        joined_at: relation.joined_at
      } : null
    }).filter(Boolean)
    
    return { success: true, organizations: userOrganizations }
  } catch (error) {
    console.error('Error obteniendo organizaciones del usuario:', error)
    return { success: false, error: 'Error al obtener organizaciones' }
  }
}

// Obtener organización primaria del usuario
export const getPrimaryOrganization = async (userId) => {
  try {
    const result = await getUserOrganizations(userId)
    if (!result.success) return { success: false, error: result.error }
    
    const primary = result.organizations.find(org => org.is_primary && !org.is_archived)
    const active = primary || result.organizations.find(org => !org.is_archived)
    
    return { success: true, organization: active || null }
  } catch (error) {
    console.error('Error obteniendo organización primaria:', error)
    return { success: false, error: 'Error al obtener organización primaria' }
  }
}

// Archivar organización
export const archiveOrganization = async (organizationId, userId) => {
  try {
    const organizations = loadOrganizationsFromStorage()
    const userOrgs = loadUserOrganizationsFromStorage()
    
    // Actualizar estado de archivo
    const orgIndex = organizations.findIndex(o => o.id === organizationId)
    if (orgIndex !== -1) {
      organizations[orgIndex].is_archived = true
      saveOrganizationsToStorage(organizations)
    }
    
    // Actualizar relación (quitar como primaria)
    const relationIndex = userOrgs.findIndex(
      uo => uo.user_id === userId && uo.organization_id === organizationId
    )
    if (relationIndex !== -1) {
      userOrgs[relationIndex].is_primary = false
      saveUserOrganizationsToStorage(userOrgs)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error archivando organización:', error)
    return { success: false, error: 'Error al archivar organización' }
  }
}

// Establecer organización primaria
export const setPrimaryOrganization = async (organizationId, userId) => {
  try {
    const userOrgs = loadUserOrganizationsFromStorage()
    
    // Quitar primaria de todas las organizaciones del usuario
    userOrgs.forEach(uo => {
      if (uo.user_id === userId) {
        uo.is_primary = false
      }
    })
    
    // Establecer nueva primaria
    const relationIndex = userOrgs.findIndex(
      uo => uo.user_id === userId && uo.organization_id === organizationId
    )
    if (relationIndex !== -1) {
      userOrgs[relationIndex].is_primary = true
    } else {
      // Crear relación si no existe
      userOrgs.push({
        user_id: userId,
        organization_id: organizationId,
        role: 'member',
        is_primary: true,
        joined_at: new Date().toISOString()
      })
    }
    
    saveUserOrganizationsToStorage(userOrgs)
    return { success: true }
  } catch (error) {
    console.error('Error estableciendo organización primaria:', error)
    return { success: false, error: 'Error al establecer organización primaria' }
  }
}

// Reactivar organización
export const reactivateOrganization = async (organizationId) => {
  try {
    const organizations = loadOrganizationsFromStorage()
    const orgIndex = organizations.findIndex(o => o.id === organizationId)
    
    if (orgIndex !== -1) {
      organizations[orgIndex].is_archived = false
      saveOrganizationsToStorage(organizations)
      return { success: true, organization: organizations[orgIndex] }
    }
    
    return { success: false, error: 'Organización no encontrada' }
  } catch (error) {
    console.error('Error reactivando organización:', error)
    return { success: false, error: 'Error al reactivar organización' }
  }
}

