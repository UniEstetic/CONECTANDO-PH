import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import Link from 'next/link';

import UsuariosHeader from '@/app/usuarios/components/UsuariosHeader';

export default function menuAsambleas() {
  
  return (
    <div className={styles.container}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />
        
        <div className={styles.assambleasContainer}>
          <div className={styles.assambleasSidebar}>
            <Link href="/usuarios/administrativo/administrarasambleas" className={styles.btnUsuarios}>
              <button className={styles.configButton}>
                Configurar nueva asamblea
                </button>
            </Link>
            
            
            <div className={styles.assambleasList}>
              <h3 className={styles.assambleasTitle}>Asambleas programadas</h3>
              
              <div className={styles.assambleaItem}>
                <span className={styles.titleAsambleasTitle}>Asamblea marzo 30 2026</span>
                <div className={styles.radioGroup}>
                  <input type="radio" name="asamblea" id="marzo" />
                  <label htmlFor="marzo"></label>
                </div>
              </div>
              
              <div className={styles.assambleaItem}>
                <span className={styles.titleAsambleasTitle}>Asamblea julio 16 2026</span>
                <div className={styles.radioGroup}>
                  <input type="radio" name="asamblea" id="julio" />
                  <label htmlFor="julio"></label>
                </div>
              </div>
            </div>
          </div>

          {/* Sección derecha - Tutoriales */}
          <div className={styles.containerSelection}>
            <div className={styles.tutorialesSection}>
            <div className={styles.tutorialesHeader}>
              <h2 className={styles.titleBlock}>Tutoriales</h2>
            </div>
            
            <div className={styles.tutorialesGrid}>
              <div className={styles.tutorialCard}>
                <h4>Tutorial configuración previa de asamblea</h4>
              </div>
              
              <div className={styles.tutorialCard}>
                <h4>Tutorial gestión durante la asamblea</h4>
              </div>
              
              <div className={styles.tutorialCard}>
                <h4>Tutorial gestión durante la asamblea</h4>
              </div>
            </div>
            </div>

            <div className={styles.tutorialesSection}>
            <div className={styles.tutorialesHeader}>
              <h2 className={styles.titleBlock}>Asambleas realizadas</h2>
            </div>
            
            <div className={styles.tutorialesGrid}>
              <div className={styles.tutorialCard}>
                <p>Tutorial configuración previa de asamblea</p>
              </div>
              
              <div className={styles.tutorialCard}>
                <p>Tutorial gestión durante la asamblea</p>
              </div>
              
              <div className={styles.tutorialCard}>
                <p>Tutorial gestión durante la asamblea</p>
              </div>
            </div>
            </div>
          </div>
          
          
        </div>
      </main>
    </div>
  );
}