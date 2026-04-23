'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import pageStyles from '@/app/ui/styles/EntityForm.module.css';
import { useState, FormEvent, useEffect, useRef } from 'react'
import { User, UserFormData, RoleWithUnits } from '@/app/types/users'
import { Roles } from '@/app/types/roles'
import { getById, update } from '@/app/services/users.service'
import { getAll as getAllRoles } from '@/app/services/roles.service'
import { getAll as getAllUnits } from '@/app/services/units.service'
import LoadingState from '@/app/components/LoadingState'
import { getById as getUserRoles, assign as assignUserRoles, removeRole } from '@/app/services/user_roles.service'
import { getById as getUnitAssignments, assign as assignUnitAssignments, remove as removeUnitAssignment } from '@/app/services/unit_assignments.service'
import { assign as assignUserRolePhs } from '@/app/services/user_roles_phs.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import UserFormFields from '../../components/UserFormFields'
import UserRolesUnitsSelector from '../../components/UserRolesUnitsSelector'
import StatusToggle from '@/app/components/general/StatusToggle'
import ToastNotice from '@/app/components/general/ToastNotice'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Units } from '@/app/types/units'
import { useProperty } from '@/app/context/PropertyContext'

export default function EditarUsuarioPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { selectedPropertyId: phId } = useProperty();
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    type_person: 'Natural',
    gender: 'F',
    avatar_url: '',
    email: '',
    document_type: 'CC',
    document_number: '',
    phone_number: '',
    is_active: true
  })

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Roles
  const [allRoles, setAllRoles] = useState<Roles[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const initialRolesRef = useRef<string[]>([])

  // Unidades
  const [allUnits, setAllUnits] = useState<Units[]>([])
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [roleUnitAssignments, setRoleUnitAssignments] = useState<RoleWithUnits[]>([])
  const [expandedRoles, setExpandedRoles] = useState<string[]>([])
  const [unitSearch, setUnitSearch] = useState('')
  const initialUnitsRef = useRef<Record<string, string[]>>({})
  const initialRoleRelationsRef = useRef<Record<string, string>>({})
  const initialUnitRelationsRef = useRef<Record<string, Record<string, string>>>({})

  useEffect(() => {
    if (!userId || sessionStatus === 'loading') return

    let isMounted = true

    const initializeEditData = async () => {
      setLoading(true)
      try {
        const [roles] = await Promise.all([
          loadRoles(),
          loadUser(userId),
          phId ? loadUnits(phId) : Promise.resolve(),
        ])

        if (!isMounted) return
        await loadUserRoles(userId, roles)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initializeEditData()

    return () => {
      isMounted = false
    }
  }, [userId, phId, sessionStatus])

  const loadUser = async (id: string): Promise<void> => {
    try {
      const response = await getById(id)
      const user = (response as any).data
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        type_person: user.type_person || 'Natural',
        gender: user.gender || 'F',
        avatar_url: user.avatar_url || '',
        email: user.email || '',
        document_type: user.document_type || 'CC',
        document_number: user.document_number || '',
        phone_number: user.phone_number || '',
        is_active: user.is_active ?? true
      })
    } catch (error) {
      console.error('Error al cargar el usuario:', error)
      setMessage({ type: 'error', text: 'Error al cargar los datos del usuario' })
    }
  }

  const loadRoles = async (): Promise<Roles[]> => {
    try {
      const response = await getAllRoles()
      const activeRoles = response.data.filter((role: Roles) => role.is_active)
      setAllRoles(activeRoles)
      return activeRoles
    } catch (error) {
      console.error('Error al cargar roles:', error)
      return []
    } finally {
      setRolesLoading(false)
    }
  }

  const loadUnits = async (currentPhId: string): Promise<void> => {
    try {
      const response = await getAllUnits(currentPhId)
      setAllUnits(response.data)
    } catch (error) {
      console.error('Error al cargar unidades:', error)
    } finally {
      setUnitsLoading(false)
    }
  }

  const loadUserRoles = async (uid: string, rolesSource: Roles[]) => {
    try {
      const response = await getUserRoles(uid)

      // Normalizar: response.data.roles o response.data directamente
      const rawRoles = response?.data?.roles ?? (response as any)?.data
      const rolesList: any[] = Array.isArray(rawRoles) ? rawRoles : []

      if (rolesList.length > 0) {
        const roleRelationsMap: Record<string, string> = {}
        const roleIds = rolesList
          .map((entry: any) => {
            // entry puede ser string (nombre) o un objeto con role_id/name/id
            const roleKey = typeof entry === 'string'
              ? entry
              : entry?.role_id || entry?.roleId || entry?.role?.id || entry?.name || entry?.role_name || entry?.id || ''
            const roleName = typeof entry === 'string'
              ? entry
              : entry?.role_name || entry?.name || entry?.role?.name || ''
            const found = rolesSource.find(r => r.id === roleKey || r.name === roleName || r.name === roleKey)
            const relationId = typeof entry === 'object'
              ? (entry?.user_role_id || entry?.userRoleId || entry?.relation_id || entry?.id)
              : undefined
            if (found?.id && relationId) {
              roleRelationsMap[found.id] = relationId
            }
            return found?.id
          })
          .filter(Boolean) as string[]

        setSelectedRoles(roleIds)
        initialRolesRef.current = [...roleIds]
        initialRoleRelationsRef.current = roleRelationsMap

        // Auto-expand residente roles
        const residenteIds = roleIds.filter(id => {
          const r = rolesSource.find(role => role.id === id)
          return r?.name.toLowerCase().includes('residente')
        })
        setExpandedRoles(residenteIds)

        // Load unit assignments for the user
        const assignments: RoleWithUnits[] = []
        const initialUnitsMap: Record<string, string[]> = {}
        const initialUnitRelationsMap: Record<string, Record<string, string>> = {}

        if (residenteIds.length > 0) {
          try {
            const unitResponse = await getUnitAssignments(uid)
            const rawData = unitResponse.data as any

            // Normalize: may be single object, array, or nested
            const unitRecords: Array<{ units_id: string; can_vote: boolean }> = []
            if (Array.isArray(rawData)) {
              unitRecords.push(...rawData)
            } else if (Array.isArray(rawData?.data)) {
              unitRecords.push(...rawData.data)
            } else if (rawData?.units_id) {
              unitRecords.push(rawData)
            }

            if (unitRecords.length > 0) {
              const residenteRole = residenteIds[0]
              const unitIds = unitRecords.map(r => r.units_id).filter(Boolean)
              const canVote = unitRecords[0]?.can_vote ?? true
              const unitRelationIds: Record<string, string> = {}
              unitRecords.forEach((record: any) => {
                if (record?.units_id && record?.id) {
                  unitRelationIds[record.units_id] = record.id
                }
              })

              assignments.push({
                roleId: residenteRole,
                roleName: rolesSource.find(r => r.id === residenteRole)?.name || 'Residente',
                selectedUnits: unitIds,
                canVote,
                unitRelationIds,
              })
              initialUnitsMap[residenteRole] = [...unitIds]
              initialUnitRelationsMap[residenteRole] = unitRelationIds
            }
          } catch (err) {
            console.log('[EDIT] No unit assignments found:', err)
          }
        }

        setRoleUnitAssignments(assignments)
        initialUnitsRef.current = initialUnitsMap
        initialUnitRelationsRef.current = initialUnitRelationsMap
      } else {
        setSelectedRoles([])
        setExpandedRoles([])
        setRoleUnitAssignments([])
        initialRolesRef.current = []
        initialUnitsRef.current = {}
        initialRoleRelationsRef.current = {}
        initialUnitRelationsRef.current = {}
      }
    } catch (error) {
      console.error('Error al cargar roles del usuario:', error)
      setSelectedRoles([])
      setExpandedRoles([])
      setRoleUnitAssignments([])
      initialRolesRef.current = []
      initialUnitsRef.current = {}
      initialRoleRelationsRef.current = {}
      initialUnitRelationsRef.current = {}
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleRoleChange = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(prev => prev.filter(id => id !== roleId))
      setRoleUnitAssignments(prev => prev.filter(a => a.roleId !== roleId))
      setExpandedRoles(prev => prev.filter(id => id !== roleId))
    } else {
      setSelectedRoles(prev => [...prev, roleId])
    }
  }

  const toggleRoleUnits = (roleId: string) => {
    setExpandedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleUnitChange = (roleId: string, unitId: string) => {
    const assignment = roleUnitAssignments.find(a => a.roleId === roleId)
    const isCurrentlySelected = assignment?.selectedUnits.includes(unitId)

    if (isCurrentlySelected) {
      setRoleUnitAssignments(prev =>
        prev.map(a =>
          a.roleId === roleId
            ? { ...a, selectedUnits: a.selectedUnits.filter(id => id !== unitId) }
            : a
        )
      )
    } else {
      setRoleUnitAssignments(prev => {
        const existing = prev.find(a => a.roleId === roleId)
        if (existing) {
          return prev.map(a =>
            a.roleId === roleId
              ? { ...a, selectedUnits: [...a.selectedUnits, unitId] }
              : a
          )
        }
        const role = allRoles.find(r => r.id === roleId)
        return [...prev, {
          roleId,
          roleName: role?.name || 'Rol',
          selectedUnits: [unitId],
          canVote: true,
        }]
      })
    }
  }

  const handleCanVoteChange = (roleId: string, canVote: boolean) => {
    setRoleUnitAssignments(prev =>
      prev.map(a => a.roleId === roleId ? { ...a, canVote } : a)
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (!userId) throw new Error('Usuario inválido')

      // 1. Actualizar datos del usuario
      const trimmedPassword = password.trim()
      const payload = trimmedPassword
        ? { ...formData, password: trimmedPassword }
        : formData
      await update(userId, payload)

      // 2. Roles: calcular diferencias vs estado inicial
      const initialRoles = initialRolesRef.current
      const rolesToAdd = selectedRoles.filter(id => !initialRoles.includes(id))
      const rolesToRemove = initialRoles.filter(id => !selectedRoles.includes(id))

      // Asignar roles nuevos (enviar IDs de rol)
      if (rolesToAdd.length > 0) {
        const rolesResponse = await assignUserRoles(userId, { roles: rolesToAdd })

        // Asignar copropiedad a cada user_role creado
        if (phId && rolesResponse.data.assigned?.length > 0) {
          const phsPromises = rolesResponse.data.assigned.map(assignedRole =>
            assignUserRolePhs(assignedRole.id, { phs_ids: [phId] })
          )
          await Promise.all(phsPromises)
        }
      }

      // Eliminar roles desmarcados
      for (const roleId of rolesToRemove) {
        const roleRelationId = initialRoleRelationsRef.current[roleId]
        if (roleRelationId) {
          await removeRole(roleRelationId)
        }
      }

      // 3. Unidades: calcular diferencias vs estado inicial
      const initialUnits = initialUnitsRef.current
      for (const assignment of roleUnitAssignments) {
        const prevUnits = initialUnits[assignment.roleId] || []
        const unitsToAdd = assignment.selectedUnits.filter(id => !prevUnits.includes(id))
        const unitsToRemove = prevUnits.filter(id => !assignment.selectedUnits.includes(id))

        for (const unitId of unitsToAdd) {
          await assignUnitAssignments(userId, { units_id: unitId, can_vote: assignment.canVote })
        }
        for (const unitId of unitsToRemove) {
          const relationId = initialUnitRelationsRef.current[assignment.roleId]?.[unitId]
          if (relationId) {
            await removeUnitAssignment(relationId)
          }
        }
      }

      // Eliminar unidades de roles que fueron desmarcados
      for (const roleId of rolesToRemove) {
        const prevUnits = initialUnits[roleId] || []
        for (const unitId of prevUnits) {
          const relationId = initialUnitRelationsRef.current[roleId]?.[unitId]
          if (relationId) {
            await removeUnitAssignment(relationId)
          }
        }
      }

      setMessage({ type: 'success', text: 'Usuario actualizado exitosamente' })
      setTimeout(() => router.push('/admin/usuarios'), 1500)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al actualizar el usuario'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.blockResidentes}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          <LoadingState message="Cargando datos del usuario..." variant="fullPage" />
        </main>
      </div>
    )
  }

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href='/admin/usuarios' className={styles.btnBack}></Link>
        </div>
        
        <div className={pageStyles.titleBanner}>
          Editar usuario
        </div>

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

        <form onSubmit={handleSubmit} className={pageStyles.form}>
          <UserFormFields
            formData={formData}
            password={password}
            onFormChange={handleChange}
            onPasswordChange={setPassword}
            passwordHint="Complete solo si desea cambiar la contraseña"
            passwordPlaceholder="Dejar en blanco para mantener la actual"
          />

          <UserRolesUnitsSelector
            allRoles={allRoles}
            allUnits={allUnits}
            selectedRoles={selectedRoles}
            expandedRoles={expandedRoles}
            roleUnitAssignments={roleUnitAssignments}
            unitSearch={unitSearch}
            rolesLoading={rolesLoading}
            unitsLoading={unitsLoading}
            onRoleChange={handleRoleChange}
            onToggleRoleUnits={toggleRoleUnits}
            onUnitChange={handleUnitChange}
            onCanVoteChange={handleCanVoteChange}
            onUnitSearchChange={setUnitSearch}
          />

          <StatusToggle
            entityLabel='Usuario'
            checked={!!formData.is_active}
            onChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
            hint='Los usuarios desactivados no podrán iniciar sesión'
          />

          <div className={pageStyles.actions}>
            <Link href="/admin/usuarios" className={pageStyles.cancelButton}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={pageStyles.submitButton}
            >
              {saving ? 'Guardando...' : 'Actualizar usuario'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
