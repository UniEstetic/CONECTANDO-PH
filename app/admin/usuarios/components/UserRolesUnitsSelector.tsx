'use client'

import { useMemo } from 'react'
import { Roles } from '@/app/types/roles'
import { Units } from '@/app/types/units'
import { RoleWithUnits } from '@/app/types/users'
import pageStyles from '@/app/ui/styles/EntityForm.module.css'

export type { RoleWithUnits } from '@/app/types/users'

interface UserRolesUnitsSelectorProps {
  allRoles: Roles[]
  allUnits: Units[]
  selectedRoles: string[]
  expandedRoles: string[]
  roleUnitAssignments: RoleWithUnits[]
  unitSearch: string
  rolesLoading: boolean
  unitsLoading: boolean
  onRoleChange: (roleId: string) => void
  onToggleRoleUnits: (roleId: string) => void
  onUnitChange: (roleId: string, unitId: string) => void
  onCanVoteChange: (roleId: string, canVote: boolean) => void
  onUnitSearchChange: (search: string) => void
}

export default function UserRolesUnitsSelector({
  allRoles,
  allUnits,
  selectedRoles,
  expandedRoles,
  roleUnitAssignments,
  unitSearch,
  rolesLoading,
  unitsLoading,
  onRoleChange,
  onToggleRoleUnits,
  onUnitChange,
  onCanVoteChange,
  onUnitSearchChange,
}: UserRolesUnitsSelectorProps) {
  const assignmentByRoleId = useMemo(() => {
    return roleUnitAssignments.reduce<Record<string, RoleWithUnits>>((acc, a) => {
      acc[a.roleId] = a
      return acc
    }, {})
  }, [roleUnitAssignments])

  const unitBucketsByRole = useMemo(() => {
    const search = unitSearch.trim().toLowerCase()
    return selectedRoles.reduce<Record<string, { assignedUnits: Units[]; filteredAvailable: Units[] }>>((acc, roleId) => {
      const assignedIds = new Set(assignmentByRoleId[roleId]?.selectedUnits || [])
      const assignedUnits = allUnits.filter(u => assignedIds.has(u.id!))
      const availableUnits = allUnits.filter(u => !assignedIds.has(u.id!))
      const filteredAvailable = search
        ? availableUnits.filter(u =>
            u.block?.toLowerCase().includes(search) ||
            u.unit_number?.toLowerCase().includes(search) ||
            u.type?.toLowerCase().includes(search)
          )
        : availableUnits

      acc[roleId] = { assignedUnits, filteredAvailable }
      return acc
    }, {})
  }, [selectedRoles, assignmentByRoleId, allUnits, unitSearch])

  return (
    <>
      <div className={pageStyles.spacerMd} />
      <div className={pageStyles.sectionTitle}>Roles</div>
      {rolesLoading ? (
        <p className={pageStyles.sectionHint}>Cargando roles...</p>
      ) : (
        <div>
          {allRoles.map((role) => {
            const isSelected = selectedRoles.includes(role.id!)
            const isResidente = role.name.toLowerCase().includes('residente')
            const roleUnits = unitBucketsByRole[role.id!] || { assignedUnits: [], filteredAvailable: [] }
            const selectedCount = roleUnits.assignedUnits.length
            const hasUnits = (assignmentByRoleId[role.id!]?.selectedUnits.length || 0) > 0

            return (
              <div key={role.id}>
                <label className={pageStyles.checkboxCustom}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onRoleChange(role.id!)}
                  />
                  <div>
                    <span className={pageStyles.checkboxLabel}>{role.name}</span>
                    {role.description && (
                      <div className={pageStyles.checkboxDesc}>{role.description}</div>
                    )}
                  </div>
                </label>

                {isSelected && isResidente && (
                  <div style={{ marginLeft: 16, marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => onToggleRoleUnits(role.id!)}
                      className={pageStyles.sectionHint}
                      style={{ cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}
                    >
                      {expandedRoles.includes(role.id!) ? 'Ocultar unidades' : 'Seleccionar unidades'}
                      {selectedCount > 0 ? ` (${selectedCount} seleccionada${selectedCount > 1 ? 's' : ''})` : ''}
                    </button>

                    {expandedRoles.includes(role.id!) && (
                      <div style={{ marginTop: 8 }}>
                        {unitsLoading ? (
                          <p className={pageStyles.sectionHint}>Cargando unidades...</p>
                        ) : allUnits.length === 0 ? (
                          <p className={pageStyles.sectionHint}>No hay unidades disponibles</p>
                        ) : (
                          <div className={pageStyles.unitPickerContainer}>
                            {/* Unidades asignadas */}
                            {roleUnits.assignedUnits.length > 0 && (
                              <>
                                <div className={pageStyles.unitDividerLabel}>Unidades asignadas</div>
                                <div className={pageStyles.unitGrid}>
                                  {roleUnits.assignedUnits.map((unit) => (
                                    <button
                                      key={unit.id}
                                      type="button"
                                      onClick={() => onUnitChange(role.id!, unit.id!)}
                                      className={`${pageStyles.unitChip} ${pageStyles.unitChipSelected}`}
                                    >
                                      <span className={pageStyles.unitChipBlock}>{unit.block}</span>
                                      <span className={pageStyles.unitChipNumber}>{unit.unit_number}</span>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* Unidades disponibles */}
                            <div className={pageStyles.unitDividerLabel}>
                              {roleUnits.assignedUnits.length > 0 ? 'Asignar nuevas unidades' : 'Unidades disponibles'}
                            </div>
                            <input
                              type="text"
                              placeholder="Buscar por bloque o número..."
                              value={unitSearch}
                              onChange={(e) => onUnitSearchChange(e.target.value)}
                              className={pageStyles.unitSearchInput}
                            />
                            <div className={pageStyles.unitGrid}>
                              {roleUnits.filteredAvailable.map((unit) => (
                                <button
                                  key={unit.id}
                                  type="button"
                                  onClick={() => onUnitChange(role.id!, unit.id!)}
                                  className={pageStyles.unitChip}
                                >
                                  <span className={pageStyles.unitChipBlock}>{unit.block}</span>
                                  <span className={pageStyles.unitChipNumber}>{unit.unit_number}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Checkbox puede votar */}
                        {hasUnits && (
                          <label className={pageStyles.checkboxCustom} style={{ marginTop: 10 }}>
                            <input
                              type="checkbox"
                              checked={assignmentByRoleId[role.id!]?.canVote ?? true}
                              onChange={(e) => onCanVoteChange(role.id!, e.target.checked)}
                            />
                            <span className={pageStyles.checkboxLabel}>Puede votar</span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
