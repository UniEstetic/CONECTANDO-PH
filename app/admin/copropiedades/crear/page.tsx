'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import styles from '@/app/ui/styles/usuarios.module.css'
import pageStyles from '@/app/ui/styles/EntityForm.module.css'
import UsuariosHeader from '@/app/components/UsuariosHeader'
import { create } from '@/app/services/phs.service'
import ToastNotice from '@/app/components/general/ToastNotice'

type CreatePhFormState = {
  name: string
  tax_id: string
  address: string
  phone_number: string
  email: string
  logo_url: string
  legal_representative: string
  city: string
  state: string
  country: string
  stratum: string
  number_of_towers: string
  amount_of_real_estate: string
  horizontal_property_regulations: string
}

type UploadKind = 'logo' | 'regulation'

export default function CrearCopropiedadPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<CreatePhFormState>({
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
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<UploadKind | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const uploadFile = async (file: File, field: 'logo_url' | 'horizontal_property_regulations', kind: UploadKind) => {
    setUploading(kind)

    try {
      const data = new FormData()
      data.append('file', file)

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: data,
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.message || 'No se pudo subir el archivo')
      }

      setFormData((prev) => ({
        ...prev,
        [field]: json.url || '',
      }))
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error subiendo archivo',
      })
    } finally {
      setUploading(null)
    }
  }

  const handleFileInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo_url' | 'horizontal_property_regulations',
    kind: UploadKind,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadFile(file, field, kind)
    e.target.value = ''
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const towers = formData.number_of_towers.trim() ? Number(formData.number_of_towers) : undefined
      const estates = formData.amount_of_real_estate.trim() ? Number(formData.amount_of_real_estate) : undefined

      if (towers !== undefined && Number.isNaN(towers)) {
        throw new Error('La cantidad de torres debe ser numerica')
      }

      if (estates !== undefined && Number.isNaN(estates)) {
        throw new Error('La cantidad de inmuebles debe ser numerica')
      }

      const payload = {
        name: formData.name.trim(),
        tax_id: formData.tax_id.trim(),
        horizontal_property_regulations: formData.horizontal_property_regulations.trim(),
        ...(formData.address.trim() ? { address: formData.address.trim() } : {}),
        ...(formData.phone_number.trim() ? { phone_number: formData.phone_number.trim() } : {}),
        ...(formData.email.trim() ? { email: formData.email.trim() } : {}),
        ...(formData.logo_url.trim() ? { logo_url: formData.logo_url.trim() } : {}),
        ...(formData.legal_representative.trim()
          ? { legal_representative: formData.legal_representative.trim() }
          : {}),
        ...(formData.city.trim() ? { city: formData.city.trim() } : {}),
        ...(formData.state.trim() ? { state: formData.state.trim() } : {}),
        ...(formData.country.trim() ? { country: formData.country.trim() } : {}),
        ...(formData.stratum.trim() ? { stratum: formData.stratum.trim() } : {}),
        ...(towers !== undefined ? { number_of_towers: towers } : {}),
        ...(estates !== undefined ? { amount_of_real_estate: estates } : {}),
      }

      const response = await create(payload as any)

      setMessage({
        type: 'success',
        text: response?.message || 'Copropiedad creada exitosamente',
      })

      setTimeout(() => {
        router.push('/admin/copropiedades')
      }, 1400)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al crear copropiedad',
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
          <Link href='/admin/copropiedades' className={styles.btnBack}></Link>
        </div>

        <div className={pageStyles.titleBanner}>
          Crear copropiedad
        </div>

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

        <form onSubmit={handleSubmit} className={pageStyles.form}>
          <div className={pageStyles.formGrid}>
            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Nombre de la copropiedad: *</span>
              <input name='name' value={formData.name} onChange={handleChange} required placeholder='Ej: Conjunto Los Pinos' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>NIT: *</span>
              <input name='tax_id' value={formData.tax_id} onChange={handleChange} required placeholder='Ej: 900123456-1' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Representante legal:</span>
              <input name='legal_representative' value={formData.legal_representative} onChange={handleChange} placeholder='Nombre del representante legal' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Dirección:</span>
              <input   name='address' value={formData.address} onChange={handleChange} placeholder='Ej: Calle 10 # 25-30' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Teléfono:</span>
              <input name='phone_number' value={formData.phone_number} onChange={handleChange} placeholder='Ej: 6011234567' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Correo electrónico:</span>
              <input name='email' value={formData.email} onChange={handleChange} type='email' placeholder='Ej: admin@copropiedad.com' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>País:</span>
              <input name='country' value={formData.country} onChange={handleChange} placeholder='Ej: Colombia' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Departamento / Estado:</span>
              <input name='state' value={formData.state} onChange={handleChange} placeholder='Ej: Cundinamarca' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Ciudad:</span>
              <input name='city' value={formData.city} onChange={handleChange} placeholder='Ej: Bogota' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Estrato:</span>
              <input name='stratum' value={formData.stratum} onChange={handleChange} placeholder='Ej: 4' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Cantidad de torres/interiores:</span>
              <input name='number_of_towers' value={formData.number_of_towers} onChange={handleChange} type='number' min='0' placeholder='Ej: 3' className={pageStyles.input} />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Cantidad de inmuebles:</span>
              <input name='amount_of_real_estate' value={formData.amount_of_real_estate} onChange={handleChange} type='number' min='0' placeholder='Ej: 120' className={pageStyles.input} />
            </label>

            <div className={pageStyles.uploadRow}>
              <label className={pageStyles.uploadLabel}>Logotipo</label>
              <input id='logo-upload' type='file' accept='image/*' onChange={(e) => handleFileInput(e, 'logo_url', 'logo')} className={pageStyles.hiddenFileInput} />
              <label htmlFor='logo-upload' className={pageStyles.uploadButton}>
                {uploading === 'logo' ? 'Subiendo...' : 'Subir logotipo'}
              </label>
              <input name='logo_url' value={formData.logo_url} onChange={handleChange} placeholder='URL del logotipo (se llena al subir)' className={pageStyles.input} />
            </div>

            <div className={pageStyles.uploadRow}>
              <label className={pageStyles.uploadLabel}>Reglamento</label>
              <input id='regulation-upload' type='file' accept='.pdf,.doc,.docx,.txt' onChange={(e) => handleFileInput(e, 'horizontal_property_regulations', 'regulation')} className={pageStyles.hiddenFileInput} />
              <label htmlFor='regulation-upload' className={pageStyles.uploadButton}>
                {uploading === 'regulation' ? 'Subiendo...' : 'Subir reglamento'}
              </label>
              <input
                name='horizontal_property_regulations'
                value={formData.horizontal_property_regulations}
                onChange={handleChange}
                placeholder='URL o referencia del reglamento (se llena al subir)'
                className={pageStyles.input}
              />
            </div>
          </div>

          <div className={pageStyles.actions}>
            <Link href='/admin/copropiedades' className={pageStyles.cancelButton}>Cancelar</Link>
            <button type='submit' disabled={loading || !!uploading} className={pageStyles.submitButton}>
              {loading ? 'Guardando...' : 'Guardar copropiedad'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
