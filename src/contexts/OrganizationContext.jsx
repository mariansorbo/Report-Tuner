import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import {
  createOrganization,
  joinOrganizationByCode,
  getUserOrganizations,
  getPrimaryOrganization,
  archiveOrganization,
  setPrimaryOrganization,
  reactivateOrganization
} from '../services/organizationService'

const OrganizationContext = createContext()

export const useOrganization = () => {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization debe ser usado dentro de un OrganizationProvider')
  }
  return context
}

export const OrganizationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [currentOrganization, setCurrentOrganization] = useState(null)
  const [userOrganizations, setUserOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  // Cargar organización primaria al iniciar
  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrganizations()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const loadOrganizations = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const result = await getPrimaryOrganization(user.id)
      if (result.success) {
        if (result.organization) {
          setCurrentOrganization(result.organization)
          setNeedsSetup(false)
        } else {
          // No tiene organización activa
          const allOrgsResult = await getUserOrganizations(user.id)
          if (allOrgsResult.success && allOrgsResult.organizations.length > 0) {
            // Tiene organizaciones pero todas archivadas
            setUserOrganizations(allOrgsResult.organizations)
            setNeedsSetup(true)
          } else {
            // No tiene ninguna organización
            setNeedsSetup(true)
          }
        }
        
        // Cargar todas las organizaciones del usuario
        const allOrgsResult = await getUserOrganizations(user.id)
        if (allOrgsResult.success) {
          setUserOrganizations(allOrgsResult.organizations)
        }
      }
    } catch (error) {
      console.error('Error cargando organizaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async (name) => {
    if (!user?.id) return { success: false, error: 'Usuario no autenticado' }
    
    setLoading(true)
    try {
      const result = await createOrganization(name, user.id)
      if (result.success) {
        setCurrentOrganization(result.organization)
        setNeedsSetup(false)
        await loadOrganizations()
        return { success: true, organization: result.organization }
      }
      return result
    } catch (error) {
      console.error('Error creando organización:', error)
      return { success: false, error: 'Error al crear organización' }
    } finally {
      setLoading(false)
    }
  }

  const handleJoinOrganization = async (invitationCode) => {
    if (!user?.id) return { success: false, error: 'Usuario no autenticado' }
    
    setLoading(true)
    try {
      const result = await joinOrganizationByCode(invitationCode, user.id)
      if (result.success) {
        // Verificar si el usuario ya tiene una organización
        const primaryResult = await getPrimaryOrganization(user.id)
        
        if (primaryResult.success && primaryResult.organization && 
            primaryResult.organization.id !== result.organization.id) {
          // Tiene otra organización activa, devolver info para modal de decisión
          return {
            success: true,
            organization: result.organization,
            hasExistingOrganization: true,
            existingOrganization: primaryResult.organization
          }
        }
        
        // No tiene organización o es la misma, unirse directamente
        await setPrimaryOrganization(result.organization.id, user.id)
        setCurrentOrganization(result.organization)
        setNeedsSetup(false)
        await loadOrganizations()
        return { success: true, organization: result.organization }
      }
      return result
    } catch (error) {
      console.error('Error uniéndose a organización:', error)
      return { success: false, error: 'Error al unirse a organización' }
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveAndJoin = async (oldOrgId, newOrgId) => {
    if (!user?.id) return { success: false, error: 'Usuario no autenticado' }
    
    setLoading(true)
    try {
      // Archivar organización anterior
      await archiveOrganization(oldOrgId, user.id)
      
      // Establecer nueva como primaria
      const result = await setPrimaryOrganization(newOrgId, user.id)
      if (result.success) {
        await loadOrganizations()
        return { success: true }
      }
      return result
    } catch (error) {
      console.error('Error archivando y uniéndose:', error)
      return { success: false, error: 'Error al procesar cambio de organización' }
    } finally {
      setLoading(false)
    }
  }

  const handleKeepBothOrganizations = async (newOrgId) => {
    if (!user?.id) return { success: false, error: 'Usuario no autenticado' }
    
    setLoading(true)
    try {
      // Establecer nueva como primaria pero mantener la anterior
      const result = await setPrimaryOrganization(newOrgId, user.id)
      if (result.success) {
        await loadOrganizations()
        return { success: true }
      }
      return result
    } catch (error) {
      console.error('Error manteniendo ambas organizaciones:', error)
      return { success: false, error: 'Error al establecer organización' }
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchOrganization = async (organizationId) => {
    if (!user?.id) return { success: false, error: 'Usuario no autenticado' }
    
    setLoading(true)
    try {
      const result = await setPrimaryOrganization(organizationId, user.id)
      if (result.success) {
        await loadOrganizations()
        return { success: true }
      }
      return result
    } catch (error) {
      console.error('Error cambiando organización:', error)
      return { success: false, error: 'Error al cambiar organización' }
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateOrganization = async (organizationId) => {
    setLoading(true)
    try {
      const result = await reactivateOrganization(organizationId)
      if (result.success) {
        await setPrimaryOrganization(organizationId, user.id)
        await loadOrganizations()
        return { success: true, organization: result.organization }
      }
      return result
    } catch (error) {
      console.error('Error reactivando organización:', error)
      return { success: false, error: 'Error al reactivar organización' }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    currentOrganization,
    userOrganizations,
    loading,
    needsSetup,
    createOrganization: handleCreateOrganization,
    joinOrganization: handleJoinOrganization,
    archiveAndJoin: handleArchiveAndJoin,
    keepBothOrganizations: handleKeepBothOrganizations,
    switchOrganization: handleSwitchOrganization,
    reactivateOrganization: handleReactivateOrganization,
    refreshOrganizations: loadOrganizations
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

