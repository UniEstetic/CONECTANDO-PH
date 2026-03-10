'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent, useEffect } from 'react'
import { Units } from '@/app/types/units'
import { getById, update } from '@/app/services/units.service'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

type UnitFormData = Omit<Units, 'id' | 'created_at'>

export default function EditarUnidadPage() {
  const router = useRouter()
  const params = useParams()
  const phId = Array.isArray(params.phId) ? params.phId[0] : params.phId
  const unitId = Array.isArray(params.id) ? params.id[0] : params.id

  const [formData, setFormData] = useState<UnitFormData>({
    block: '',
    unit_number: '',
    type: 'Apartamento',
    coefficient: '',
    floor: '',
    area: '',
    tax_responsible: '',
    tax_responsible_document_type: 'CC',
    tax_responsible_document: '',
    is_active: true
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (phId && unitId) {
      loadUnidad(phId, unitId)
    }
  }, [phId, unitId])

  const loadUnidad = async (phId: string, id: string) => {
    try {
      setLoading(true)
      const response = await getById(phId, id)
      const unit = response.data
      setFormData({
        block: unit.block || '',
        unit_number: unit.unit_number || '',
        type: unit.type || 'Apartamento',
        coefficient: unit.coefficient || '',
        floor: unit.floor || '',
        area: unit.area || '',
        tax_responsible: unit.tax_responsible || '',
        tax_responsible_document_type: unit.tax_responsible_document_type || 'CC',
        tax_responsible_document: unit.tax_responsible_document || '',
        is_active: unit.is_active
      })
    } catch (error) {
      console.error('Error al cargar la unidad:', error)
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar los datos de la unidad' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (!phId || !unitId) {
        throw new Error('Unidad o copropiedad inválida')
      }

      if (!formData.floor?.toString().trim()) {
        throw new Error('El campo Piso es obligatorio')
      }

      const floor = Number(formData.floor)
      const coefficient = formData.coefficient?.toString().trim()
        ? Number(formData.coefficient.toString().replace(',', '.'))
        : undefined
      const area = formData.area?.toString().trim()
        ? Number(formData.area.toString().replace(',', '.'))
        : undefined

      if (Number.isNaN(floor)) {
        throw new Error('El campo Piso debe ser numérico')
      }
      if (coefficient !== undefined && Number.isNaN(coefficient)) {
        throw new Error('El campo Coeficiente debe ser numérico')
      }
      if (area !== undefined && Number.isNaN(area)) {
        throw new Error('El campo Área debe ser numérico')
      }

      const payload = {
        block: formData.block,
        unit_number: formData.unit_number,
        type: formData.type,
        floor,
        ...(coefficient !== undefined ? { coefficient } : {}),
        ...(area !== undefined ? { area } : {}),
        ...(formData.tax_responsible?.trim() ? { tax_responsible: formData.tax_responsible.trim() } : {}),
        ...(formData.tax_responsible_document_type?.trim() ? { tax_responsible_document_type: formData.tax_responsible_document_type.trim() } : {}),
        ...(formData.tax_responsible_document?.trim() ? { tax_responsible_document: formData.tax_responsible_document.trim() } : {}),
      }

      await update(phId, unitId, payload)
      
      setMessage({ type: 'success', text: 'Unidad actualizada exitosamente' })
      
      setTimeout(() => {
        router.push(`/admin/copropiedades/unidades/${phId}`)
      }, 1500)

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar la unidad' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.blockResidentes}>
        <main className={styles.containerResidentes}>
          <div className={styles.headerActions}>
            <Link href={`/admin/copropiedades/unidades/${phId}`} className={styles.btnBack}>
              Volver
            </Link>
          </div>
          <div className={styles.loading}>
            <p>Cargando datos de la unidad...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <div className={styles.headerActions}>
          <Link href={`/admin/copropiedades/unidades/${phId}`} className={styles.btnBack}>
            Volver
          </Link>
        </div>

        <div className={styles.formSectionTitle}>
          Editar unidad
        </div>

        {message && (
          <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Número de unidad: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="unit_number" 
                value={formData.unit_number}
                onChange={handleChange}
                required
                placeholder="Ej: 401, Apto 502"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Bloque/Torre: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="block" 
                value={formData.block}
                onChange={handleChange}
                required
                placeholder="Ej: Torre A, Bloque 1"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Piso: <span className={styles.required}>*</span></span>
              <input 
                type="number"
                name="floor" 
                value={formData.floor}
                onChange={handleChange}
                required
                min="0"
                placeholder="Ej: 4, 5"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Tipo de unidad:</span>
              <select 
                name="type" 
                value={formData.type}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Local">Local</option>
                <option value="Oficina">Oficina</option>
                <option value="Parqueadero">Parqueadero</option>
                <option value="Deposito">Depósito</option>
              </select>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Área (m²):</span>
              <input 
                type="number"
                name="area" 
                value={formData.area}
                onChange={handleChange}
                min="0"
                step="any"
                placeholder="Ej: 85"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Coeficiente:</span>
              <input 
                type="number"
                name="coefficient" 
                value={formData.coefficient}
                onChange={handleChange}
                min="0"
                step="any"
                placeholder="Ej: 0.015"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Responsable de impuestos:</span>
              <input 
                type="text" 
                name="tax_responsible" 
                value={formData.tax_responsible}
                onChange={handleChange}
                placeholder="Nombre del propietario"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Tipo de documento:</span>
              <select 
                name="tax_responsible_document_type" 
                value={formData.tax_responsible_document_type}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="NIT">NIT</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Número de documento:</span>
              <input 
                type="text" 
                name="tax_responsible_document" 
                value={formData.tax_responsible_document}
                onChange={handleChange}
                placeholder="Número de identificación"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formButtons}>
            <Link href={`/admin/copropiedades/unidades/${phId}`}>
              <button type="button" className={styles.btnCancel}>
                Cancelar
              </button>
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className={styles.btnSubmit}
            >
              {saving ? 'Guardando...' : 'Actualizar unidad'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
