'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import { useState, FormEvent, useEffect } from 'react'
import { Phs } from '@/app/types/phs'
import { create } from '@/app/services/phs.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";

type PhsFormData = Omit<Phs, 'id' | 'created_by'>

export default function CrearCopropiedadPage() {
  const { data: session } = useSession();
  const router = useRouter()

  const [formData, setFormData] = useState<PhsFormData>({
    name: '',
    tax_id: '',
    address: '',
    phone_number: '',
    email: '',
    logo_url: '',
    legal_representative: '',
    city: '',
    state: '',
    country: '',
    stratum: '',
    number_of_towers: '',
    amount_of_real_estate: '',
    horizontal_property_regulations: '',
    is_active: true
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // Obtener el userId del session
      const createdBy = session?.user?.id || 'system';
      
      await create({
        ...formData,
        created_by: createdBy
      })
      
      setMessage({ type: 'success', text: 'Copropiedad creada exitosamente' })
      
      setTimeout(() => {
        router.push('/admin/copropiedades')
      }, 1500)

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al crear la copropiedad' 
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
          Crear copropiedad
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
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>NIT:</span>
              <input 
                type="text" 
                name="tax_id" 
                value={formData.tax_id}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Dirección: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="address" 
                value={formData.address}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Ciudad: <span className={styles.required}>*</span></span>
              <input 
                type="text" 
                name="city" 
                value={formData.city}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Departamento:</span>
              <input 
                type="text" 
                name="state" 
                value={formData.state}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>País:</span>
              <input 
                type="text" 
                name="country" 
                value={formData.country}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Teléfono:</span>
              <input 
                type="tel" 
                name="phone_number" 
                value={formData.phone_number}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Email:</span>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Representante legal:</span>
              <input 
                type="text" 
                name="legal_representative" 
                value={formData.legal_representative}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Estrato:</span>
              <input 
                type="text" 
                name="stratum" 
                value={formData.stratum}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Número de torres:</span>
              <input 
                type="text" 
                name="number_of_towers" 
                value={formData.number_of_towers}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Cantidad de unidades:</span>
              <input 
                type="text" 
                name="amount_of_real_estate" 
                value={formData.amount_of_real_estate}
                onChange={handleChange}
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
              <span className={styles.formCheckboxLabel}>Copropiedad activa</span>
            </label>
            <span className={styles.formHint} style={{ marginLeft: '28px' }}>
              Las copropiedades inactivas no serán visibles para los usuarios
            </span>
          </div>

          <div className={styles.formButtons}>
            <Link href="/admin/copropiedades">
              <button type="button" className={styles.btnCancel}>
                Cancelar
              </button>
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className={styles.btnSubmit}
            >
              {saving ? 'Guardando...' : 'Crear copropiedad'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
