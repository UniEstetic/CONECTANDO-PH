'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent, useEffect } from 'react'
import { User, UserFormData, RoleWithUnits } from '@/app/types/users'
import { Roles } from '@/app/types/roles'
import { Units } from '@/app/types/units'
import { create } from '@/app/services/users.service'
import { getAll as getAllRoles } from '@/app/services/roles.service'
import { getAll as getAllUnits } from '@/app/services/units.service'
import { assign as assignUserRoles } from '@/app/services/user_roles.service'
import { assign as assignUnitAssignments } from '@/app/services/unit_assignments.service'
import { assign as assignUserRolePhs } from '@/app/services/user_roles_phs.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import UserFormFields from '../components/UserFormFields'
import UserRolesUnitsSelector from '../components/UserRolesUnitsSelector'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import pageStyles from '@/app/ui/styles/EntityForm.module.css'
import ToastNotice from '@/app/components/general/ToastNotice'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function CrearUsuarioPage() {
  const { data: session } = useSession();
  const router = useRouter()
  const phId = session?.user?.ownership?.id;

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
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Roles
  const [allRoles, setAllRoles] = useState<Roles[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  // Unidades
  const [allUnits, setAllUnits] = useState<Units[]>([])
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [roleUnitAssignments, setRoleUnitAssignments] = useState<RoleWithUnits[]>([])
  const [expandedRoles, setExpandedRoles] = useState<string[]>([])
  const [unitSearch, setUnitSearch] = useState('')

  useEffect(() => {
    loadRoles()
  }, [])

  useEffect(() => {
    if (phId) {
      loadUnits()
    }
  }, [phId])

  const loadRoles = async () => {
    try {
      const response = await getAllRoles()
      setAllRoles(response.data.filter((role: Roles) => role.is_active))
    } catch (error) {
      console.error('Error al cargar roles:', error)
    } finally {
      setRolesLoading(false)
    }
  }

  const loadUnits = async () => {
    try {
      const response = await getAllUnits(phId)
      setAllUnits(response.data)
    } catch (error) {
      console.error('Error al cargar unidades:', error)
    } finally {
      setUnitsLoading(false)
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
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        setRoleUnitAssignments(prev => prev.filter(a => a.roleId !== roleId))
        setExpandedRoles(prev => prev.filter(id => id !== roleId))
        return prev.filter(id => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const toggleRoleUnits = (roleId: string) => {
    setExpandedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleUnitChange = (roleId: string, unitId: string) => {
    setRoleUnitAssignments(prev => {
      const existing = prev.find(a => a.roleId === roleId)
      if (existing) {
        if (existing.selectedUnits.includes(unitId)) {
          return prev.map(a =>
            a.roleId === roleId
              ? { ...a, selectedUnits: a.selectedUnits.filter(id => id !== unitId) }
              : a
          )
        } else {
          return prev.map(a =>
            a.roleId === roleId
              ? { ...a, selectedUnits: [...a.selectedUnits, unitId] }
              : a
          )
        }
      } else {
        const role = allRoles.find(r => r.id === roleId)
        return [...prev, {
          roleId,
          roleName: role?.name || 'Rol',
          selectedUnits: [unitId],
          canVote: true
        }]
      }
    })
  }

  const handleCanVoteChange = (roleId: string, canVote: boolean) => {
    setRoleUnitAssignments(prev =>
      prev.map(a => a.roleId === roleId ? { ...a, canVote } : a)
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormData((prev) => ({
      ...prev,
      avatar_url: file.name,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Validar que los roles de residente tengan al menos una unidad
      const residenteRoles = allRoles.filter(r => selectedRoles.includes(r.id!) && r.name.toLowerCase().includes('residente'))
      for (const role of residenteRoles) {
        const assignment = roleUnitAssignments.find(a => a.roleId === role.id!)
        if (!assignment || assignment.selectedUnits.length === 0) {
          setMessage({ type: 'error', text: `Debe seleccionar al menos una unidad para el rol "${role.name}"` })
          setSaving(false)
          return
        }
      }

      const payload: UserFormData = {
        ...formData,
        ...(password.trim() ? { password: password.trim() } : {}),
      }

      console.log('[PASO 1] Creando usuario con payload:', JSON.stringify(payload, null, 2))
      const response = await create(payload)
      console.log('[PASO 1 OK] Respuesta crear usuario:', JSON.stringify(response, null, 2))
      const createdUser = response.data as any
      const userId = createdUser?.id || createdUser?.user_id || createdUser?.user?.id || createdUser?.userId
      console.log('[PASO 1] userId extraído:', userId)

      if (!userId || !UUID_REGEX.test(userId)) {
        throw new Error(`No se pudo obtener un ID de usuario válido. Respuesta: ${JSON.stringify(response.data)}`)
      }

      // Asignar roles al usuario (enviar IDs de rol)
      if (selectedRoles.length > 0) {
        const roleNames = selectedRoles.map(id => allRoles.find(r => r.id === id)?.name || id)
        console.log('[PASO 2] Asignando roles:', roleNames, 'roleIds:', selectedRoles)
        const rolesResponse = await assignUserRoles(userId, { roles: selectedRoles })
        console.log('[PASO 2 OK] Roles asignados:', JSON.stringify(rolesResponse.data, null, 2))

        // Asignar copropiedad a cada user_role creado
        if (phId && rolesResponse.data.assigned?.length > 0) {
          const phsPromises = rolesResponse.data.assigned.map(assignedRole => {
            console.log('[PASO 2.5] Asignando PH', phId, 'al userRoleId:', assignedRole.id)
            return assignUserRolePhs(assignedRole.id, { phs_ids: [phId] })
          })
          await Promise.all(phsPromises)
          console.log('[PASO 2.5 OK] Copropiedades asignadas a user_roles')
        }

        // Asignar unidades por rol en paralelo
        const unitPromises = roleUnitAssignments
          .filter(a => a.selectedUnits.length > 0)
          .flatMap(assignment =>
            assignment.selectedUnits.map(unitId => {
              console.log('[PASO 3] Asignando unidad:', unitId, 'al rol:', assignment.roleId, 'canVote:', assignment.canVote)
              return assignUnitAssignments(userId, { units_id: unitId, can_vote: assignment.canVote })
            })
          )
        if (unitPromises.length > 0) {
          await Promise.all(unitPromises)
          console.log('[PASO 3 OK] Unidades asignadas correctamente')
        } else {
          console.log('[PASO 3] No hay unidades que asignar')
        }
      }

      setMessage({ type: 'success', text: 'Usuario creado exitosamente' })

      setTimeout(() => {
        router.push('/admin/usuarios')
      }, 1500)

    } catch (error) {
      console.error('[ERROR] Fallo en creación de usuario:', error)
      console.error('[ERROR] Mensaje:', error instanceof Error ? error.message : String(error))
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al crear el usuario'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href='/admin/usuarios' className={styles.btnBack}></Link>
        </div>

        <div className={pageStyles.titleBanner}>
          Crear usuario
        </div>

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

        <form onSubmit={handleSubmit} className={pageStyles.form}>
          <UserFormFields
            formData={formData}
            password={password}
            onFormChange={handleChange}
            onPasswordChange={setPassword}
            onFileUpload={handleFileUpload}
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

          <div className={pageStyles.actions}>
            <Link href='/admin/usuarios' className={pageStyles.cancelButton}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={pageStyles.submitButton}
            >
              {saving ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
