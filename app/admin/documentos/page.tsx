import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

// Estructura de datos optimizada para archivos
const DOCUMENTOS = [
  { 
    id: 1, 
    nombre: 'Reglamento de Propiedad Horizontal', 
    tipo: 'PDF', 
    tamano: '2.4 MB', 
    fecha: '10 Ene 2024',
    categoria: 'Legales'
  },
  { 
    id: 2, 
    nombre: 'Manual de Convivencia 2024', 
    tipo: 'PDF', 
    tamano: '1.1 MB', 
    fecha: '15 Feb 2024',
    categoria: 'Manuales'
  },
  { 
    id: 3, 
    nombre: 'Estado Financiero - Trimestre 3', 
    tipo: 'XLSX', 
    tamano: '850 KB', 
    fecha: '05 Nov 2024',
    categoria: 'Finanzas'
  },
  { 
    id: 4, 
    nombre: 'Certificado de Libertad y Tradición', 
    tipo: 'PDF', 
    tamano: '500 KB', 
    fecha: '20 Nov 2024',
    categoria: 'Legales'
  }
];

export default function DocumentosPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerDocumentos}>
          <Link href="/admin" className={styles.btnBack}>
            <span>← Volver</span>
          </Link>
          <h1 className={styles.title}>Repositorio de Documentos</h1>
        </div>

        {/* Buscador o Filtro rápido */}
        <section className={styles.filterSection}>
          <input 
            type="text" 
            placeholder="Buscar documento..." 
            className={styles.searchBar} 
          />
        </section>

        <section className={styles.listContainer}>
          {DOCUMENTOS.map((doc) => (
            <div key={doc.id} className={styles.documentItem}>
              <div className={styles.docInfo}>
                <div className={styles.iconWrapper}>
                  {/* Icono dinámico según el tipo de archivo */}
                  <Image 
                    src={doc.tipo === 'PDF' ? '/imagenes/icon_pdf.svg' : '/imagenes/icon_excel.svg'} 
                    alt={doc.tipo} 
                    width={32} 
                    height={32} 
                  />
                </div>
                <div className={styles.textDetails}>
                  <h3 className={styles.docName}>{doc.nombre}</h3>
                  <p className={styles.docMeta}>
                    <span>{doc.fecha}</span> • <span>{doc.tamano}</span> • <span className={styles.categoryBadge}>{doc.categoria}</span>
                  </p>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnDownload} title="Descargar">
                  <Image 
                    src="/imagenes/06_boton documentos.svg" // Reutilizando tu icono de documentos o uno de descarga
                    alt="Descargar" 
                    width={24} 
                    height={24} 
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