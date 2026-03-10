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

  const getUnitsForRole = (roleId: string) => {
    const assignment = roleUnitAssignments.find(a => a.roleId === roleId)
    return assignment?.selectedUnits || []
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const userData = {
        ...formData,
        ...(password && { password })
      }
      
      const response = await create(userData)
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
        
        <div className={styles.formSectionTitle}>
          Crear usuario
        </div>

        {message && (
          <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Nombre: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Apellido: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Email: <span className={styles.required}>*</span></span>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Contraseña: <span className={styles.required}>*</span></span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Tipo de documento: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="document_type" 
                value={formData.document_type}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Número de documento: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="document_number" 
                value={formData.document_number}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Número celular: <span className={styles.required}>*</span></span>
              <input 
                type="tel" 
                name="phone_number" 
                value={formData.phone_number}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Tipo de usuario: <span className={styles.required}>*</span></span>
              <select 
                name="type_person" 
                value={formData.type_person}
                onChange={handleChange}
                required
                className={styles.formSelect}
              >
                <option value="">Seleccione</option>
                <option value="Natural">Natural</option>
                <option value="Juridica">Jurídica</option>
                <option value="Administrador">Administrador</option>
                <option value="Empleado">Empleado</option>
              </select>
            </label>
          </div>

          {/* Roles del usuario */}
          <div className={styles.selectionSection}>
            <span className={styles.selectionTitle}>Roles asignados:</span>
            
            {rolesLoading ? (
              <p className={styles.loading}>Cargando roles...</p>
            ) : allRoles.length === 0 ? (
              <p className={styles.empty}>No hay roles disponibles</p>
            ) : (
              <div className={styles.selectionGrid}>
                {allRoles.map((role) => (
                  <label 
                    key={role.id} 
                    className={`${styles.checkboxCard} ${selectedRoles.includes(role.id!) ? styles.checked : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedRoles.includes(role.id!)}
                      onChange={() => handleRoleChange(role.id!)}
                    />
                    <div className={styles.checkboxCardContent}>
                      <span className={styles.checkboxCardTitle}>{role.name}</span>
                      <p className={styles.checkboxCardDescription}>{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <span className={styles.selectionHint}>Seleccione los roles que tendrá este usuario</span>
          </div>

          {/* Unidades por rol */}
          {selectedRoles.length > 0 && !unitsLoading && allUnits.length > 0 && (
            <div className={styles.selectionSection}>
              <span className={styles.selectionTitle}>Unidades por rol:</span>
              <p className={styles.selectionHint}>Selecciona las unidades que tendrá el usuario para cada rol</p>
              
              {selectedRoles.map(roleId => {
                const role = allRoles.find(r => r.id === roleId)
                const isExpanded = expandedRoles.includes(roleId)
                const selectedUnits = getUnitsForRole(roleId)
                
                return (
                  <div key={roleId} className={styles.accordion}>
                    <button
                      type="button"
                      onClick={() => toggleRoleUnits(roleId)}
                      className={`${styles.accordionHeader} ${isExpanded ? styles.active : ''}`}
                    >
                      <span className={styles.accordionTitle}>
                        {role?.name}
                        {selectedUnits.length > 0 && (
                          <span className={styles.accordionBadge}>{selectedUnits.length}</span>
                        )}
                      </span>
                      <span className={styles.accordionIcon}>{isExpanded ? '▲' : '▼'}</span>
                    </button>
                    
                    {isExpanded && (
                      <div className={styles.accordionContent}>
                        <div className={styles.unitsGrid}>
                          {allUnits.map(unit => (
                            <label
                              key={unit.id}
                              className={`${styles.unitCheckbox} ${selectedUnits.includes(unit.id!) ? styles.checked : ''}`}
                            >
                              <input 
                                type="checkbox"
                                checked={selectedUnits.includes(unit.id!)}
                                onChange={() => handleUnitChange(roleId, unit.id!)}
                              />
                              <div className={styles.unitCheckboxInfo}>
                                <span className={styles.unitCheckboxNumber}>{unit.unit_number}</span>
                                <span className={styles.unitCheckboxDetail}>{unit.block} - Piso {unit.floor}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Estado */}
          <div className={styles.formGroup}>
            <label className={styles.formCheckbox}>
              <input 
                type="checkbox" 
                name="is_active" 
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span className={styles.formCheckboxLabel}>Usuario activo</span>
            </label>
            <span className={styles.formHint} style={{ marginLeft: '28px' }}>
              Los usuarios inactivos no podrán iniciar sesión
            </span>
          </div>

          {/* Botones */}
          <div className={styles.formButtons}>
            <Link href="/admin/usuarios" className={styles.btnCancel}>
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className={styles.btnSubmit}
            >
              {saving ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
