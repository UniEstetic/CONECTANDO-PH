'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent } from 'react'
import { Units } from '@/app/types/units'
import { create } from '@/app/services/units.service'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import UsuariosHeader from '@/app/components/UsuariosHeader';

type UnitFormData = Omit<Units, 'id' | 'created_at'>

export default function CrearUnidadPage() {
  const router = useRouter()
  const params = useParams()
  const phId = params.phId as string

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
      await create(phId, formData)
      
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

        <div className={styles.formSectionTitle}>
          Crear nueva unidad
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
              <span>Piso:</span>
              <input 
                type="text" 
                name="floor" 
                value={formData.floor}
                onChange={handleChange}
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
                type="text" 
                name="area" 
                value={formData.area}
                onChange={handleChange}
                placeholder="Ej: 85"
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Coeficiente:</span>
              <input 
                type="text" 
                name="coefficient" 
                value={formData.coefficient}
                onChange={handleChange}
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

          <div className={styles.formGroup}>
            <label className={styles.formCheckbox}>
              <input 
                type="checkbox" 
                name="is_active" 
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span className={styles.formCheckboxLabel}>Unidad activa</span>
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
              disabled={loading}
              className={styles.btnSubmit}
            >
              {loading ? 'Guardando...' : 'Crear unidad'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
