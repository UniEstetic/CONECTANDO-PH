'use client'

import { useState } from 'react'
import LogoUsuarios from '@/app/usuarios/components/logo_usuarios'
import ComunicadoCard from '@/app/usuarios/components/ComunicadoCard'
import EncuestaModal from '@/app/usuarios/components/EncuestaModal'
import DetalleModal from '@/app/usuarios/components/DetalleModal'
import styles from '@/app/ui/styles/usuarios.module.css'

interface OpcionEncuesta {
  id: number
  texto: string
  votos: number
}

interface Comunicado {
  id: number
  fecha: string
  titulo: string
  tipo: 'detalle' | 'encuesta'
  pregunta?: string
  opciones?: OpcionEncuesta[]
  descripcion?: string
}

export default function ComunicadosPage() {
  const [comunicadoActivo, setComunicadoActivo] =
    useState<Comunicado | null>(null)

  const comunicados: Comunicado[] = [
    {
      id: 1,
      fecha: 'Lunes 8 de septiembre 2025',
      titulo: 'Mantenimiento tanques torre 4',
      tipo: 'detalle',
      descripcion:
        'Este próximo lunes 8 de septiembre se realizará mantenimiento en los tanques de la torre 4. Para esta torre puntualmente se cortará el servicio de agua entre las 10am y las 12m. Les confirmaremos por este medio en cuanto se restablezca el servicio de agua. Agradecemos su paciencia, es un bien para todos los residentes de la torre. El próximo mes realizaremos mantenimiento en los tanques de la torre 5 y la torre 6.',
    },
    {
      id: 2,
      fecha: 'Viernes 5 de septiembre 2025',
      titulo: 'Encuesta selección decoración Halloween',
      tipo: 'encuesta',
      pregunta:
        '¿De las 3 propuestas mostradas en el comunicado del día de ayer cuál prefiere para la decoración de nuestro conjunto?',
      opciones: [
        { id: 1, texto: 'Opción de fantasmas', votos: 67 },
        { id: 2, texto: 'Opción de zombies', votos: 95 },
        { id: 3, texto: 'Opción de minions', votos: 15 },
      ],
    },
    {
      id: 3,
      fecha: 'Jueves 4 de septiembre 2025',
      titulo: 'Reparación puerta torre 1',
      tipo: 'detalle',
      descripcion:
        'El jueves 4 de septiembre se realizará la reparación de la puerta principal de la torre 1. Durante el proceso el acceso estará controlado por el personal de seguridad.',
    },
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <LogoUsuarios />
        <h1 className={styles.saludo}>
          Hola, <strong>Andres</strong>
        </h1>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles.filtro}>
          <label>Asunto</label>
          <input type="text" />
        </div>

        <div className={styles.filtro}>
          <label>Fecha</label>
          <input type="date" />
        </div>
      </div>

      {/* Cards */}
      <div className={styles.lista}>
        {comunicados.map((item) => (
          <ComunicadoCard
            key={item.id}
            fecha={item.fecha}
            titulo={item.titulo}
            tipo={item.tipo}
            onClick={() => setComunicadoActivo(item)}
          />
        ))}
      </div>

      {/* Modales */}
      {comunicadoActivo?.tipo === 'encuesta' && (
        <EncuestaModal
          comunicado={comunicadoActivo}
          onClose={() => setComunicadoActivo(null)}
        />
      )}

      {comunicadoActivo?.tipo === 'detalle' && (
        <DetalleModal
          comunicado={comunicadoActivo}
          onClose={() => setComunicadoActivo(null)}
        />
      )}
    </div>
  )
}
