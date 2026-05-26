import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const DOCUMENTOS_RESIDENTE = [
  {
    id: 1,
    nombre: 'Reglamento de Propiedad Horizontal',
    tipo: 'PDF',
    tamano: '5.2 MB',
    categoria: 'Legales',
    descripcion: 'Documento base con las normas legales de la copropiedad.'
  },
  {
    id: 2,
    nombre: 'Manual de Convivencia Actualizado',
    tipo: 'PDF',
    tamano: '1.8 MB',
    categoria: 'Normativa',
    descripcion: 'Reglas de uso de zonas comunes y comportamiento.'
  },
  {
    id: 3,
    nombre: 'Acta Asamblea Ordinaria 2025',
    tipo: 'PDF',
    tamano: '2.1 MB',
    categoria: 'Asambleas',
    descripcion: 'Resumen y decisiones tomadas en la última asamblea.'
  },
  {
    id: 4,
    nombre: 'Cronograma de Fumigación y Lavado',
    tipo: 'JPG',
    tamano: '850 KB',
    categoria: 'Mantenimiento',
    descripcion: 'Fechas programadas para el primer semestre del año.'
  }
];

export default function DocumentosResidentesPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerSection}>
          <Link href="/residentes" className={styles.btnBack}>
          </Link>
          <h1 className={styles.title}>Documentos y Archivos</h1>
        </div>

        {/* Buscador interno */}
        <section className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Buscar reglamento, acta o manual..." 
            className={styles.inputSearch}
          />
        </section>

        <section className={styles.listadoDocumentos}>
          {DOCUMENTOS_RESIDENTE.map((doc) => (
            <div key={doc.id} className={styles.cardDoc}>
              <div className={styles.iconDoc}>
                {/* Icono dinámico según el tipo de archivo */}
                <span className={`${styles.extBadge} ${styles[doc.tipo.toLowerCase()]}`}>
                  {doc.tipo}
                </span>
              </div>

              <div className={styles.infoDoc}>
                <h2 className={styles.docName}>{doc.nombre}</h2>
                <p className={styles.docDesc}>{doc.descripcion}</p>
                <div className={styles.metaDoc}>
                  <span className={styles.category}>{doc.categoria}</span>
                  <span className={styles.separator}>|</span>
                  <span className={styles.size}>{doc.tamano}</span>
                </div>
              </div>

              <div className={styles.actionsDoc}>
                <button className={styles.btnDownload} title="Descargar archivo">
                  <Image 
                    src="/imagenes/06_boton documentos.svg" 
                    alt="Descargar" 
                    width={30} 
                    height={30} 
                  />
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}