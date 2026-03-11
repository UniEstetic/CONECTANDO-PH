'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import pageStyles from '@/app/ui/styles/EntityForm.module.css';
import { useState, FormEvent } from 'react'
import { Units } from '@/app/types/units'
import { create } from '@/app/services/units.service'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import ToastNotice from '@/app/components/general/ToastNotice'

type UnitFormData = Omit<Units, 'id' | 'created_at'>

export default function CrearUnidadPage() {
  const router = useRouter()
  const params = useParams()
  const phId = Array.isArray(params.phId) ? params.phId[0] : params.phId

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

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (!phId) {
        throw new Error('Copropiedad inválida para crear la unidad')
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

      await create(phId, payload)
      
      setMessage({ type: 'success', text: 'Unidad creada exitosamente' })
      
      setTimeout(() => {
        router.push(`/admin/copropiedades/unidades/${phId}`)
      }, 1500)

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al crear la unidad' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerActions}>
          <Link href={`/admin/copropiedades/unidades/${phId}`} className={styles.btnBack}></Link>
        </div>

        <div className={pageStyles.titleBanner}>
          Crear nueva unidad
        </div>

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

        <form onSubmit={handleSubmit} className={pageStyles.form}>
          <div className={pageStyles.formGrid}>
            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Número de unidad: *</span>
              <input 
                type="text" 
                name="unit_number" 
                value={formData.unit_number}
                onChange={handleChange}
                required
                placeholder="Ej: 401, Apto 502"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Bloque/Torre: *</span>
              <input 
                type="text" 
                name="block" 
                value={formData.block}
                onChange={handleChange}
                required
                placeholder="Ej: Torre A, Bloque 1"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Piso: *</span>
              <input 
                type="number"
                name="floor" 
                value={formData.floor}
                onChange={handleChange}
                required
                min="0"
                placeholder="Ej: 4, 5"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Tipo de unidad:</span>
              <select 
                name="type" 
                value={formData.type}
                onChange={handleChange}
                className={pageStyles.input}
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Local">Local</option>
                <option value="Oficina">Oficina</option>
                <option value="Parqueadero">Parqueadero</option>
                <option value="Deposito">Depósito</option>
              </select>
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Área (m²):</span>
              <input 
                type="number"
                name="area" 
                value={formData.area}
                onChange={handleChange}
                min="0"
                step="any"
                placeholder="Ej: 85"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Coeficiente:</span>
              <input 
                type="number"
                name="coefficient" 
                value={formData.coefficient}
                onChange={handleChange}
                min="0"
                step="any"
                placeholder="Ej: 0.015"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Responsable de impuestos:</span>
              <input 
                type="text" 
                name="tax_responsible" 
                value={formData.tax_responsible}
                onChange={handleChange}
                placeholder="Nombre del propietario"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Tipo de documento:</span>
              <select 
                name="tax_responsible_document_type" 
                value={formData.tax_responsible_document_type}
                onChange={handleChange}
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
              <span className={pageStyles.fieldLabel}>Número de documento:</span>
              <input 
                type="text" 
                name="tax_responsible_document" 
                value={formData.tax_responsible_document}
                onChange={handleChange}
                placeholder="Número de identificación"
                className={pageStyles.input}
              />
            </label>
          </div>

          <div className={pageStyles.actions}>
            <Link href={`/admin/copropiedades/unidades/${phId}`} className={pageStyles.cancelButton}>
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className={pageStyles.submitButton}
            >
              {loading ? 'Guardando...' : 'Crear unidad'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
