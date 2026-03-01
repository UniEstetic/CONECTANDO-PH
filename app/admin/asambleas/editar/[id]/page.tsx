'use client';

import { useState, FormEvent, useEffect } from 'react';
import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { getById as getAssemblyById, update as updateAssembly } from '@/app/services/assemblies.service';
import { 
  create as createAgenda, 
  getAll as getAgendaByAssembly, 
  update as updateAgenda,
  remove as removeAgenda 
} from '@/app/services/agenda.service';
import { Assembly } from '@/app/types/assemblies';
import { Agenda } from '@/app/types/agenda';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from "next-auth/react";

type AgendaItem = {
  id?: string;
  assembly_id: string;
  title: string;
  sort_order: number;
  is_votable: boolean;
  required_quorum: number;
  is_active: boolean;
  type: 'Encuesta' | 'Documento' | 'Texto';
  options?: string[];
  document_url?: string;
  content?: string;
};

type AssemblyFormData = Partial<Assembly>

export default function EditarAsambleasPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const assemblyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState<AssemblyFormData>({
    name: '',
    description: '',
    type: 'Ordinaria',
    status: 'scheduled',
    scheduled_at: '',
    quorum_requirement: 50,
    is_active: true,
    phs_id: ''
  });

  // Estado para los puntos de agenda
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<AgendaItem>>({
    title: '',
    is_votable: false,
    required_quorum: 50,
    type: 'Texto'
  });

  useEffect(() => {
    if (assemblyId) {
      loadAssembly(assemblyId);
    }
  }, [assemblyId]);

  const loadAssembly = async (id: string) => {
    try {
      setLoading(true);
      
      // Cargar datos de la asamblea
      const assemblyResponse = await getAssemblyById(id);
      const assembly = assemblyResponse.data;
      
      // Convertir la fecha para el input datetime-local
      let scheduledAt = '';
      if (assembly.scheduled_at) {
        const date = new Date(assembly.scheduled_at);
        scheduledAt = date.toISOString().slice(0, 16);
      }

      setFormData({
        name: assembly.name || '',
        description: assembly.description || '',
        type: assembly.type || 'Ordinaria',
        status: assembly.status || 'scheduled',
        scheduled_at: scheduledAt,
        quorum_requirement: assembly.quorum_requirement || 50,
        is_active: assembly.is_active ?? true,
        phs_id: assembly.phs_id || ''
      });

      // Cargar los puntos de agenda
      const agendaResponse = await getAgendaByAssembly({ 
        where: `assembly_id=${id}`, 
        limit: '100' 
      });
      
      if (agendaResponse.data && agendaResponse.data.length > 0) {
        const items: AgendaItem[] = agendaResponse.data.map(item => ({
          id: item.id,
          assembly_id: item.assembly_id,
          title: item.title,
          sort_order: item.sort_order,
          is_votable: item.is_votable,
          required_quorum: item.required_quorum,
          is_active: item.is_active,
          type: 'Texto' as const // Por defecto, se puede expandir después
        }));
        setAgendaItems(items);
      }

    } catch (error) {
      console.error('Error al cargar la asamblea:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar los datos de la asamblea' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const addAgendaItem = () => {
    if (!currentItem.title?.trim()) {
      alert('Por favor ingresa un título para el punto');
      return;
    }

    const newItem: AgendaItem = {
      assembly_id: assemblyId,
      title: currentItem.title,
      sort_order: agendaItems.length + 1,
      is_votable: currentItem.is_votable || false,
      required_quorum: Number(currentItem.required_quorum) || 50,
      is_active: true,
      type: currentItem.type as 'Encuesta' | 'Documento' | 'Texto'
    };

    setAgendaItems([...agendaItems, newItem]);
    setCurrentItem({
      title: '',
      is_votable: false,
      required_quorum: 50,
      type: 'Texto'
    });
  };

  const removeAgendaItem = async (index: number) => {
    const item = agendaItems[index];
    
    // Si el item ya existe en el backend (tiene id), eliminarlo
    if (item.id) {
      try {
        await removeAgenda(item.id);
      } catch (error) {
        console.error('Error al eliminar punto de agenda:', error);
        alert('Error al eliminar el punto de agenda');
        return;
      }
    }
    
    // Eliminar de la lista local
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Combinar fecha y hora
      const scheduledAt = formData.scheduled_at 
        ? new Date(formData.scheduled_at).toISOString()
        : new Date().toISOString();
      
      const assemblyPayload: Partial<Assembly> = {
        ...formData,
        scheduled_at: scheduledAt,
        quorum_requirement: Number(formData.quorum_requirement) || 50
      };

      // Actualizar la asamblea
      await updateAssembly(assemblyId, assemblyPayload);

      // Los nuevos puntos de agenda que no tienen id se crean
      for (const item of agendaItems) {
        if (!item.id) {
          const agendaPayload: Partial<Agenda> = {
            assembly_id: assemblyId,
            title: item.title,
            sort_order: item.sort_order,
            is_votable: item.is_votable,
            required_quorum: item.required_quorum,
            is_active: item.is_active
          };
          await createAgenda(agendaPayload as Agenda);
        }
      }
      
      setMessage({ type: 'success', text: 'Asamblea actualizada exitosamente' });
      
      setTimeout(() => {
        router.push('/admin/asambleas');
      }, 1500);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar la asamblea' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: 'white',
            fontWeight: 500,
            fontSize: '18px'
          }}>
            Cargando datos de la asamblea...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />
        
        {message && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            textAlign: 'center',
            fontWeight: 500,
            margin: '0 2rem 1rem 2rem'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.asambleasContainer}>
            {/* Sección izquierda - Información General */}
            <div className={styles.infoGeneralSection}>
              <div className={styles.sectionHeader}>
                <h2>Editar Asamblea</h2>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="name">Título de asamblea:</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '26px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Descripción:</label>
                <textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="type">Tipo de asamblea:</label>
                <select 
                  id="type" 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  <option value="Ordinaria">Ordinaria</option>
                  <option value="Extraordinaria">Extraordinaria</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status">Estado:</label>
                <select 
                  id="status" 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  <option value="scheduled">Programada</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="scheduled_at">Fecha y hora:</label>
                <div className={styles.inputWithIcon}>
                  <input 
                    type="datetime-local" 
                    id="scheduled_at" 
                    name="scheduled_at"
                    value={formData.scheduled_at}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid white',
                      borderRadius: '26px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="quorum_requirement">Quorum requerido (%):</label>
                <input 
                  type="number" 
                  id="quorum_requirement" 
                  name="quorum_requirement"
                  value={formData.quorum_requirement}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '26px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="is_active" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  Asamblea activa
                </label>
              </div>
            </div>

            {/* Sección derecha - Orden del día */}
            <div className={styles.ordenDiaSection}>
              <div className={styles.sectionHeader}>
                <h2>Orden del día</h2>
              </div>
              
              {/* Agregar nuevo punto */}
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#fff2d6', 
                borderRadius: '15px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 600,
                    color: '#6b5b3e'
                  }}>
                    Agregar punto a la agenda:
                  </label>
                  <input 
                    type="text"
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    placeholder="Título del punto"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #ccc',
                      borderRadius: '20px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <select
                    value={currentItem.type}
                    onChange={(e) => setCurrentItem({ ...currentItem, type: e.target.value as any })}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '15px',
                      border: '1px solid #ccc',
                      fontSize: '13px'
                    }}
                  >
                    <option value="Texto">Texto</option>
                    <option value="Encuesta">Encuesta</option>
                    <option value="Documento">Documento</option>
                  </select>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '13px',
                    color: '#6b5b3e'
                  }}>
                    <input 
                      type="checkbox"
                      checked={currentItem.is_votable}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_votable: e.target.checked })}
                    />
                    Votable
                  </label>

                  {currentItem.is_votable && (
                    <input 
                      type="number"
                      value={currentItem.required_quorum}
                      onChange={(e) => setCurrentItem({ ...currentItem, required_quorum: Number(e.target.value) })}
                      placeholder="Quorum %"
                      min="0"
                      max="100"
                      style={{
                        width: '80px',
                        padding: '6px 10px',
                        borderRadius: '15px',
                        border: '1px solid #ccc',
                        fontSize: '13px'
                      }}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={addAgendaItem}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#5b2d4e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + Agregar punto
                </button>
              </div>

              {/* Lista de puntos agregados */}
              {agendaItems.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ 
                    color: 'white', 
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}>
                    Puntos en la agenda ({agendaItems.length}):
                  </h4>
                  
                  {agendaItems.map((item, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: '#fff2d6',
                        padding: '12px',
                        borderRadius: '10px',
                        marginBottom: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: '#6b5b3e',
                          marginBottom: '4px'
                        }}>
                          {index + 1}. {item.title}
                          {item.id && (
                            <span style={{
                              fontSize: '10px',
                              backgroundColor: '#3498db',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              marginLeft: '8px'
                            }}>
                              Guardado
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b5b3e' }}>
                          <span style={{ 
                            backgroundColor: item.is_votable ? '#27ae60' : '#95a5a6',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            marginRight: '8px'
                          }}>
                            {item.type}
                          </span>
                          {item.is_votable && `Quorum: ${item.required_quorum}%`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAgendaItem(index)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {agendaItems.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  color: 'white',
                  fontStyle: 'italic'
                }}>
                  No hay puntos en la agenda. Agrega uno usando el formulario acima.
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            marginTop: '20px',
            paddingBottom: '40px'
          }}>
            <Link href="/admin/asambleas">
              <button 
                type="button"
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </Link>
            <button 
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 30px',
                backgroundColor: saving ? '#95a5a6' : '#5b2d4e',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Guardando...' : 'Actualizar Asamblea'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
