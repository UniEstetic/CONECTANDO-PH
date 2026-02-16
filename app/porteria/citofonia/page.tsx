import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const DIRECTORIO = [
  { id: 1, torre: '1', apto: '101', residente: 'Familia Arias', estado: 'Disponible' },
  { id: 2, torre: '1', apto: '102', residente: 'Juan Carlos M.', estado: 'No molestar' },
  { id: 3, torre: '2', apto: '201', residente: 'Apartamento Vacío', estado: 'Disponible' },
  { id: 4, torre: '2', apto: '202', residente: 'Sra. Martha', estado: 'Disponible' },
  { id: 5, torre: '3', apto: '301', residente: 'Duberney G.', estado: 'Ocupado' },
];

export default function CitofoniaPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerSection}>
          <Link href="/porteria" className={styles.btnBack}>
            <span>← Volver</span>
          </Link>
          <h1 className={styles.title}>Citofonía Digital</h1>
        </div>

        {/* Buscador de Aptos */}
        <section className={styles.searchBox}>
          <input 
            type="number" 
            placeholder="Torre" 
            className={styles.inputShort} 
          />
          <input 
            type="number" 
            placeholder="Apartamento" 
            className={styles.inputLong} 
          />
          <button className={styles.btnSearch}>🔍</button>
        </section>

        {/* Listado de Directorio */}
        <section className={styles.directoryGrid}>
          {DIRECTORIO.map((contacto) => (
            <div key={contacto.id} className={styles.contactCard}>
              <div className={styles.unitInfo}>
                <span className={styles.label}>Torre {contacto.torre}</span>
                <span className={styles.aptoNumber}>{contacto.apto}</span>
              </div>
              
              <div className={styles.userInfo}>
                <h3 className={styles.residentName}>{contacto.residente}</h3>
                <span className={`${styles.statusDot} ${styles[contacto.estado.replace(/\s+/g, '').toLowerCase()]}`}>
                  {contacto.estado}
                </span>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnCall} title="Llamar al citófono">
                  <div className={styles.iconCircle}>📞</div>
                </button>
                <button className={styles.btnMsg} title="Enviar mensaje de texto">
                  💬
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Marcado Rápido de Emergencia */}
        <section className={styles.emergencyBar}>
          <button className={styles.btnEmergency}>POLICÍA</button>
          <button className={styles.btnEmergency}>BOMBEROS</button>
          <button className={styles.btnEmergency}>ADMIN</button>
        </section>
      </main>
    </div>
  );
}