'use client'

import styles from '@/app/ui/styles/usuarios.module.css';
import pageStyles from '@/app/ui/styles/EntityForm.module.css';
import { useState, FormEvent, useEffect } from 'react'
import { Phs } from '@/app/types/phs'
import { getById, update } from '@/app/services/phs.service'
import UsuariosHeader from '@/app/components/UsuariosHeader';
import StatusToggle from '@/app/components/general/StatusToggle'
import ToastNotice from '@/app/components/general/ToastNotice'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

type PhsFormData = Omit<Phs, 'id' | 'created_by'>
type UploadKind = 'logo' | 'regulation'

function isValidUrlOrRelativePath(value: string) {
  if (!value.trim()) {
    return true
  }

  const normalized = value.trim()

  if (
    normalized.startsWith('/') ||
    normalized.startsWith('./') ||
    normalized.startsWith('../')
  ) {
    return true
  }

  // Allow backend-provided relative file keys like "uploads/file.png".
  if (!normalized.includes('://')) {
    return !/^javascript:/i.test(normalized) && !/\s/.test(normalized)
  }

  try {
    const parsed = new URL(normalized)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function toAbsoluteHttpUrl(value: string) {
  const normalized = value.trim()
  if (!normalized) return ''

  try {
    const parsed = new URL(normalized)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
    return ''
  } catch {
    if (typeof window === 'undefined') return ''

    if (normalized.startsWith('/')) {
      return new URL(normalized, window.location.origin).toString()
    }

    if (!normalized.includes('://')) {
      return new URL(`/${normalized}`, window.location.origin).toString()
    }

    return ''
  }
}

export default function EditarCopropiedadPage() {
  const router = useRouter()
  const params = useParams()
  const phId = params.id as string

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

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<UploadKind | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (phId) {
      loadCopropiedad(phId)
    }
  }, [phId])

  const loadCopropiedad = async (id: string) => {
    try {
      setLoading(true)
      const response = await getById(id)
      const ph = response.data
      setFormData({
        name: ph.name,
        tax_id: ph.tax_id || '',
        address: ph.address || '',
        phone_number: ph.phone_number || '',
        email: ph.email || '',
        logo_url: ph.logo_url || '',
        legal_representative: ph.legal_representative || '',
        city: ph.city || '',
        state: ph.state || '',
        country: ph.country || '',
        stratum: ph.stratum || '',
        number_of_towers:
          ph.number_of_towers !== undefined && ph.number_of_towers !== null
            ? String(ph.number_of_towers)
            : '',
        amount_of_real_estate:
          ph.amount_of_real_estate !== undefined && ph.amount_of_real_estate !== null
            ? String(ph.amount_of_real_estate)
            : '',
        horizontal_property_regulations: ph.horizontal_property_regulations || '',
        is_active: ph.is_active
      })
    } catch (error) {
      console.error('Error al cargar la copropiedad:', error)
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar los datos de la copropiedad' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const uploadFile = async (
    file: File,
    field: 'logo_url' | 'horizontal_property_regulations',
    kind: UploadKind,
  ) => {
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
    setSaving(true)
    setMessage(null)

    try {
      const towers = formData.number_of_towers.trim()
        ? Number(formData.number_of_towers)
        : undefined
      const estates = formData.amount_of_real_estate.trim()
        ? Number(formData.amount_of_real_estate)
        : undefined

      if (towers !== undefined && Number.isNaN(towers)) {
        throw new Error('La cantidad de torres debe ser numerica')
      }

      if (estates !== undefined && Number.isNaN(estates)) {
        throw new Error('La cantidad de inmuebles debe ser numerica')
      }

      const logoUrlRaw = formData.logo_url.trim()
      if (logoUrlRaw && !isValidUrlOrRelativePath(logoUrlRaw)) {
          throw new Error('La URL del logo no es valida')
      }

      const logoUrl = logoUrlRaw ? toAbsoluteHttpUrl(logoUrlRaw) : ''
      if (logoUrlRaw && !logoUrl) {
        throw new Error('La URL del logo no es valida')
      }

      const regulationsRaw = formData.horizontal_property_regulations.trim()
      if (regulationsRaw && !isValidUrlOrRelativePath(regulationsRaw)) {
        throw new Error('La URL del reglamento no es valida')
      }

      const regulationsUrl = regulationsRaw ? toAbsoluteHttpUrl(regulationsRaw) || regulationsRaw : ''

      const payload = {
        ...formData,
        name: formData.name.trim(),
        tax_id: formData.tax_id.trim(),
        address: formData.address.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
        legal_representative: formData.legal_representative.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        stratum: formData.stratum.trim(),
        ...(regulationsUrl ? { horizontal_property_regulations: regulationsUrl } : {}),
        ...(logoUrl ? { logo_url: logoUrl } : {}),
        ...(towers !== undefined ? { number_of_towers: towers } : { number_of_towers: undefined }),
        ...(estates !== undefined ? { amount_of_real_estate: estates } : { amount_of_real_estate: undefined }),
      }

      await update(phId, payload as any)
      
      setMessage({ type: 'success', text: 'Copropiedad actualizada exitosamente' })
      
      setTimeout(() => {
        router.push('/admin/copropiedades')
      }, 1500)

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar la copropiedad' 
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
          <div className={styles.loading}>
            <p>Cargando datos de la copropiedad...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />
        
        <div className={pageStyles.titleBanner}>
          Editar copropiedad
        </div>

        <ToastNotice message={message} onClear={() => setMessage(null)} durationMs={5000} />

        <form onSubmit={handleSubmit} className={pageStyles.form}>
          <div className={pageStyles.formGrid}>
            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Nombre: *</span>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>NIT:</span>
              <input 
                type="text" 
                name="tax_id" 
                value={formData.tax_id}
                onChange={handleChange}
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Dirección: *</span>
              <input 
                type="text" 
                name="address" 
                value={formData.address}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Ciudad: *</span>
              <input 
                type="text" 
                name="city" 
                value={formData.city}
                onChange={handleChange}
                required
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Departamento:</span>
              <input 
                type="text" 
                name="state" 
                value={formData.state}
                onChange={handleChange}
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>País:</span>
              <input 
                type="text" 
                name="country" 
                value={formData.country}
                onChange={handleChange}
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Teléfono:</span>
              <input 
                type="tel" 
                name="phone_number" 
                value={formData.phone_number}
                onChange={handleChange}
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
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Representante legal:</span>
              <input 
                type="text" 
                name="legal_representative" 
                value={formData.legal_representative}
                onChange={handleChange}
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Estrato:</span>
              <input 
                type="text" 
                name="stratum" 
                value={formData.stratum}
                onChange={handleChange}
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Número de torres:</span>
              <input 
                type="number" 
                name="number_of_towers" 
                value={formData.number_of_towers}
                onChange={handleChange}
                min="0"
                className={pageStyles.input}
              />
            </label>

            <label className={pageStyles.fieldWrap}>
              <span className={pageStyles.fieldLabel}>Cantidad de unidades:</span>
              <input 
                type="number" 
                name="amount_of_real_estate" 
                value={formData.amount_of_real_estate}
                onChange={handleChange}
                min="0"
                className={pageStyles.input}
              />
            </label>

          <div className={pageStyles.uploadRow}>
            <label className={pageStyles.uploadLabel}>Logotipo</label>
            <input
              id="logo-upload-edit"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInput(e, 'logo_url', 'logo')}
              className={pageStyles.hiddenFileInput}
            />
            <label htmlFor="logo-upload-edit" className={pageStyles.uploadButton}>
              {uploading === 'logo' ? 'Subiendo...' : 'Actualizar logotipo'}
            </label>
            <input
              type="text"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="URL del logotipo"
              className={pageStyles.input}
            />
          </div>

          <div className={pageStyles.uploadRow}>
            <label className={pageStyles.uploadLabel}>Reglamento</label>
            <input
              id="regulation-upload-edit"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileInput(e, 'horizontal_property_regulations', 'regulation')}
              className={pageStyles.hiddenFileInput}
            />
            <label htmlFor="regulation-upload-edit" className={pageStyles.uploadButton}>
              {uploading === 'regulation' ? 'Subiendo...' : 'Actualizar reglamento'}
            </label>
            <input
              type="text"
              name="horizontal_property_regulations"
              value={formData.horizontal_property_regulations}
              onChange={handleChange}
              placeholder="URL del reglamento"
              className={pageStyles.input}
            />
          </div>
          </div>

          <StatusToggle
            entityLabel='Copropiedad'
            checked={formData.is_active}
            onChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
            hint='Las copropiedades desactivadas no seran visibles para los usuarios'
          />

          <div className={`${pageStyles.actions} ${pageStyles.spacerMd}`}>
            <Link href="/admin/copropiedades" className={pageStyles.cancelButton}>
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={saving || !!uploading}
              className={pageStyles.submitButton}
            >
              {saving ? 'Guardando...' : 'Actualizar copropiedad'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
