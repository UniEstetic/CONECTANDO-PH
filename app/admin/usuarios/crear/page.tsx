'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent, useEffect } from 'react'
import { User } from '@/app/types/users'
import { Roles } from '@/app/types/roles'
import { Units } from '@/app/types/units'
import { create } from '@/app/services/users.service'
import { getAll as getAllRoles } from '@/app/services/roles.service'
import { getAll as getAllUnits } from '@/app/services/units.service'
import { assign as assignUserRoles } from '@/app/services/user_roles.service'
import { assign as assignUnitAssignments } from '@/app/services/unit_assignments.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import pageStyles from '@/app/ui/styles/EntityForm.module.css'
import ToastNotice from '@/app/components/general/ToastNotice'

type UserFormData = Omit<User, 'id' | 'created_at'>

// Tipos para las asignaciones de unidades por rol
interface RoleWithUnits {
  roleId: string
  roleName: string
  selectedUnits: string[]
}

export default function CrearUsuarioPage() {
  const { data: session } = useSession();
  const router = useRouter()
  const phId = session?.user?.ownership?.id; // Lista Unidades

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
  const [loading, setLoading] = useState(false)
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
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
          selectedUnits: [unitId]
        }]
      }
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Aquí puedes implementar la lógica para subir el archivo
      console.log('Archivo seleccionado:', file.name)
      setFormData((prev) => ({
        ...prev,
        avatar_url: file.name,
      }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const payload: UserFormData = {
        ...formData,
        ...(password.trim() ? { password: password.trim() } : {}),
      }

      const response = await create(payload)
      const userId = response.data.id

      // Asignar roles al usuario
      if (selectedRoles.length > 0) {
        await assignUserRoles(userId, { roles: selectedRoles })
        
        // Asignar unidades por rol
        for (const assignment of roleUnitAssignments) {
          const userRolId = `${userId}_${assignment.roleId}`
          await assignUnitAssignments(userRolId, { units: assignment.selectedUnits })
        }
      }
      
      setMessage({ type: 'success', text: 'Usuario creado exitosamente' })
      
      setTimeout(() => {
        router.push('/admin/usuarios')
      }, 1500)

    } catch (error) {
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
          <div className={pageStyles.formGrid}>
            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Nombre:</span>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Apellido:</span>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Email:</span>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Contrasena (opcional):</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Tipo de documento:</span>
              <select
                name="document_type" 
                value={formData.document_type}
                onChange={handleChange}
                required
                className={pageStyles.input}
              >
                <option value="">Seleccione</option>
                <option value="CC">Cedula de ciudadania (CC)</option>
                <option value="CE">Cedula de extranjeria (CE)</option>
                <option value="TI">Tarjeta de identidad (TI)</option>
                <option value="NIT">NIT</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Numero de documento:</span>
              <input 
                type="text" 
                name="document_number" 
                value={formData.document_number}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Numero celular:</span>
              <input 
                type="tel" 
                name="phone_number" 
                value={formData.phone_number}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Tipo de usuario:</span>
              <select 
                name="type_person" 
                value={formData.type_person}
                onChange={handleChange}
                required
                className={pageStyles.input}
              >
                <option value="">Seleccione</option>
                <option value="Natural">Natural</option>
                <option value="Juridica">Jurídica</option>
                <option value="Administrador">Administrador</option>
                <option value="Empleado">Empleado</option>
              </select>
            </label>

            <div className={pageStyles.uploadRow}>
              <label className={pageStyles.uploadLabel}>Imagen de perfil:</label>
              <input 
                type="file"
                id="avatar-upload"
                onChange={handleFileUpload}
                accept="image/*"
                className={pageStyles.hiddenFileInput}
              />
              <label htmlFor="avatar-upload" className={pageStyles.uploadButton}>
                Subir archivo
              </label>
              <input
                type='text'
                name='avatar_url'
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder='URL de la imagen de perfil'
                className={pageStyles.input}
              />
            </div>
          </div>

          <div className={pageStyles.actions}>
            <Link href='/admin/usuarios' className={pageStyles.cancelButton}>
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className={pageStyles.submitButton}
            >
              {loading ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
