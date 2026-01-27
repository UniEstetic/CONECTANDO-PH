'use client';

import { SetStateAction, useState } from 'react';
import styles from '@/app/ui/styles/roomStylesAdministrativo.module.css';
import UsuariosHeader from '@/app/usuarios/components/UsuariosHeader';

export default function menuAsambleas() {
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  
  const handleSeleccionarTipo = (tipo: SetStateAction<string>) => {
    setTipoSeleccionado(tipo);
    setMostrarOpciones(false);
  };
  
  return (
    <div className={styles.container}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />
        
        <div className={styles.asambleaConfigContainer}>
          {/* Sección izquierda - Información General */}
          <div className={styles.infoGeneralSection}>
            <div className={styles.sectionHeader}>
              <h2>Información General de Asamblea</h2>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="fecha">Fecha de asamblea:</label>
              <div className={styles.inputWithIcon}>
                <input type="text" id="fecha" />
                <button className={styles.calendarIcon}>📅</button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="hora">Hora de la asamblea:</label>
              <div className={styles.inputWithIcon}>
                <input type="text" id="hora" />
                <button className={styles.calendarIcon}>🕐</button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="titulo">Título de asamblea:</label>
              <input type="text" id="titulo" />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="asistentes">Asistentes:</label>
              <select id="asistentes" className={styles.formSelect}/>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="invita">Invita:</label>
              <input type="text" id="invita" />
            </div>
          </div>

          {/* Sección derecha - Orden del día */}
          <div className={styles.ordenDiaSection}>
            <div className={styles.sectionHeader}>
              <h2>Orden del día</h2>
            </div>
            
            <div className={styles.ordenDiaContent}>
              <div className={styles.agregarPuntoContainer}>
                <button 
                  className={styles.agregarPuntoBtn}
                  onClick={() => setMostrarOpciones(!mostrarOpciones)}
                >
                  Agregar punto <span className={styles.plusIcon}>+</span>
                </button>
                
                {tipoSeleccionado && (
                  <span className={styles.tipoSeleccionadoBadge}>{tipoSeleccionado}</span>
                )}
              </div>
              
              {mostrarOpciones && (
                <div className={styles.opcionesMenu}>
                  <button 
                    className={styles.opcionBtn}
                    onClick={() => handleSeleccionarTipo('Encuesta')}
                  >
                    Encuesta
                  </button>
                  <button 
                    className={styles.opcionBtn}
                    onClick={() => handleSeleccionarTipo('Documento')}
                  >
                    Documento
                  </button>
                  <button 
                    className={styles.opcionBtn}
                    onClick={() => handleSeleccionarTipo('Texto')}
                  >
                    Texto
                  </button>
                </div>
              )}
              
              {tipoSeleccionado === 'Encuesta' && (
                <div className={styles.encuestaForm}>
                  <div className={styles.formField}>
                    <label>Pregunta:</label>
                    <input type="text" className={styles.inputRounded} />
                  </div>
                  
                  <div className={styles.formField}>
                    <label>Opciones:</label>
                    <div className={styles.opcionesInputs}>
                      <input type="text" className={styles.inputRounded} />
                      <input type="text" className={styles.inputRounded} />
                      <input type="text" className={styles.inputRounded} />
                      <input type="text" className={styles.inputRounded} />
                      <input type="text" className={styles.inputRounded} />
                    </div>
                  </div>
                </div>
              )}
              
              {tipoSeleccionado === 'Documento' && (
                <div className={styles.documentoForm}>
                  <div className={styles.formField}>
                    <label>Título</label>
                    <input type="text" className={styles.inputRounded} />
                  </div>
                  
                  <div className={styles.documentosUpload}>
                    <div className={styles.uploadField}>
                      <label>Documento:</label>
                      <button className={styles.explorarBtn}>Explorar</button>
                    </div>
                    
                    <div className={styles.uploadField}>
                      <label>Documento:</label>
                      <button className={styles.explorarBtn}>Explorar</button>
                    </div>
                    
                    <div className={styles.uploadField}>
                      <label>Documento:</label>
                      <button className={styles.explorarBtn}>Explorar</button>
                    </div>
                  </div>
                </div>
              )}
              
              {tipoSeleccionado === 'Texto' && (
                <div className={styles.textoForm}>
                  <div className={styles.formField}>
                    <label>Texto:</label>
                    <textarea 
                      className={styles.textareaRounded} 
                     
                      placeholder="Escribe tu texto aquí..."
                    ></textarea>
                  </div>
                </div>
              )}
              
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}