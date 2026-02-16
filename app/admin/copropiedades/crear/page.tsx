'use client';

import { SetStateAction, useState, useEffect } from 'react';
import styles from '@/app/ui/styles/menuAsambleas.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';
import { getAll as listPhs, getById as getByIdPhs, create as createPhs, update as updatePhs, remove as removePhs } from "@/app/services/phs.service";
import { Phs, responseListPhs, responsePhs } from '@/app/types/phs';
import { removeRegister, listFilters } from '@/app/types/definitions';

export default function MenuAsambleas() {
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [phs, setPhs] = useState<responseListPhs>();
  const [rescreateph, setrescreatePh] = useState<responsePhs>();
  const [resupdateph, setresupdatePh] = useState<responsePhs>();
  const [resgeteph, setresgetPh] = useState<responsePhs>();
  const [resremove, setresremove] = useState<removeRegister>();

  useEffect(() => {
    (async () => {
      // servicio para listar
      try {
        const filter:listFilters={ fields:"*", where:"", limit:"100", page:"1"}; 
        const data = await listPhs(filter);
        setPhs(data);
      } catch (error) {
        console.error("Error cargando PHS:", error);
      }
      // servicio para crear
      try {
        const payloadPh: Phs= {
          "name": "Conjunto Residencial Los Álamos",
          "tax_id": "900123456-1",
          "address": "Calle 123 # 45-67, Bogotá",
          "phone_number": "+576012345678",
          "email": "administracion@alamos.com",
          "logo_url": "https://storage.googleapis.com/tu-bucket/logos/logo.png",
          "legal_representative": "Carlos Mario Restrepo",
          "city": "Bogotá DC",
          "state": "Bogotá DC",
          "country": "Colombia",
          "stratum": "EXAMPLE_STRATUM",
          "number_of_towers": "EXAMPLE_NUMBER_OF_TOWERS",
          "amount_of_real_estate": "EXAMPLE_AMOUNT_OF_REAL_ESTATE",
          "horizontal_property_regulations": "EXAMPLE_HORIZONTAL_PROPERTY_REGULATIONS",
          "is_active": true,
          "created_by": "d290f1ee-6c54-4b01-90e6-d701748f0851"
        };
        const data = await createPhs(payloadPh);
        setrescreatePh(data);
      } catch (error) {
        console.error("Error create PHS:", error);
      }
      // servicio para obtener detalle
      try {
        const data = await getByIdPhs("d290f1ee-6c54-4b01-90e6-d701748f0851");
        setresgetPh(data);
      } catch (error) {
        console.error("Error obtener PHS:", error);
      }
      // servicio para actualuzar
      try {
        const payloadPhUpdate: Phs= {
          "name": "Conjunto Residencial Los Álamos",
          "tax_id": "900123456-1",
          "address": "Calle 123 # 45-67, Bogotá",
          "phone_number": "+576012345678",
          "email": "administracion@alamos.com",
          "logo_url": "https://storage.googleapis.com/tu-bucket/logos/logo.png",
          "legal_representative": "Carlos Mario Restrepo",
          "city": "Bogotá DC",
          "state": "Bogotá DC",
          "country": "Colombia",
          "stratum": "EXAMPLE_STRATUM",
          "number_of_towers": "EXAMPLE_NUMBER_OF_TOWERS",
          "amount_of_real_estate": "EXAMPLE_AMOUNT_OF_REAL_ESTATE",
          "horizontal_property_regulations": "EXAMPLE_HORIZONTAL_PROPERTY_REGULATIONS",
          "is_active": true,
          "created_by": "d290f1ee-6c54-4b01-90e6-d701748f0851"
        };
        const data = await updatePhs("d290f1ee-6c54-4b01-90e6-d701748f0851", payloadPhUpdate);
        setresupdatePh(data);
      } catch (error) {
        console.error("Error update PHS:", error);
      }
      // servicio para eliminar
      try {
        const data = await removePhs("d290f1ee-6c54-4b01-90e6-d701748f0851");
        setresremove(data);
      } catch (error) {
        console.error("Error remove PHS:", error);
      }
    })()

  }, []);

  useEffect(() => {
    console.log('phs', phs);
    console.log('rescreateph',rescreateph);
    console.log('resupdateph',resupdateph);
    console.log('resgeteph',resgeteph);
    console.log('resremove',resremove);
  }, [phs,rescreateph,resupdateph, resgeteph, resremove]);


  // Estados para los modales
  const [mostrarModalTorre, setMostrarModalTorre] = useState(false);
  const [mostrarModalInmueble, setMostrarModalInmueble] = useState(false);
  const [nuevaTorre, setNuevaTorre] = useState('');
  const [torres, setTorres] = useState<string[]>([]);
  const [inmuebles, setInmuebles] = useState<any[]>([]); // 👈 Nuevo estado para guardar inmuebles

  // Estados para el formulario de inmueble
  const [inmuebleData, setInmuebleData] = useState({
    responsableFiscal: '',
    tipoDocumento: '',
    numeroDocumento: '',
    numeroInmueble: '',
    torreInterior: '',
    piso: '',
    tipoInmueble: '',
    coeficiente: '',
    area: ''
  });

  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombreConjunto: '',
    representanteLegal: '',
    nit: '',
    pais: '',
    departamento: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    email: '',
    cantidadTorres: '',
    cantidadInmuebles: '',
    estrato: '',
    reglamento: null as File | null,
    logotipo: null as File | null
  });

  const handleSeleccionarTipo = (tipo: SetStateAction<string>) => {
    setTipoSeleccionado(tipo);
    setMostrarOpciones(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInmuebleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInmuebleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  // 👇 FUNCIÓN PRINCIPAL PARA GUARDAR TODO
  const handleGuardarCambios = () => {
    const datosCompletos = {
      ...formData,
      torres: torres,
      inmuebles: inmuebles,
      fechaCreacion: new Date().toISOString()
    };

    console.log('📦 Guardando TODOS los cambios:', datosCompletos);

    // Aquí iría tu lógica para enviar a la API/backend
    // Ejemplo:
    // await fetch('/api/propiedad-horizontal', {
    //   method: 'POST',
    //   body: JSON.stringify(datosCompletos)
    // });

    alert('✅ Cambios guardados exitosamente');
  };

  const handleAgregarTorre = () => {
    if (nuevaTorre.trim()) {
      setTorres([...torres, nuevaTorre.trim()]);
      setNuevaTorre('');
    }
  };

  const handleEliminarTorre = (index: number) => {
    setTorres(torres.filter((_, i) => i !== index));
  };

  const handleGuardarTorres = () => {
    console.log('Torres guardadas:', torres);
    setMostrarModalTorre(false);
  };

  const handleGuardarInmueble = () => {
    // 👇 Agregar el inmueble al array de inmuebles
    setInmuebles([...inmuebles, { ...inmuebleData, id: Date.now() }]);
    console.log('Inmueble guardado:', inmuebleData);

    // Limpiar el formulario
    setInmuebleData({
      responsableFiscal: '',
      tipoDocumento: '',
      numeroDocumento: '',
      numeroInmueble: '',
      torreInterior: '',
      piso: '',
      tipoInmueble: '',
      coeficiente: '',
      area: ''
    });

    setMostrarModalInmueble(false);
  };

  return (
    <div className={styles.container}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.mainContent}>
          <div className={styles.columnLeft}>
            <div className={styles.sectionHeader}>
              Crear Propiedad Horizontal
            </div>

            <div className={styles.formContainer}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Nombre del conjunto:
                </label>
                <input
                  type="text"
                  name="nombreConjunto"
                  value={formData.nombreConjunto}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Representante legal:
                </label>
                <input
                  type="text"
                  name="representanteLegal"
                  value={formData.representanteLegal}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  NIT:
                </label>
                <input
                  type="text"
                  name="nit"
                  value={formData.nit}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  País:
                </label>
                <select
                  name="pais"
                  value={formData.pais}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="">Seleccionar país</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Argentina">Argentina</option>
                  <option value="México">México</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Departamento:
                </label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="">Seleccionar departamento</option>
                  <option value="Cundinamarca">Cundinamarca</option>
                  <option value="Antioquia">Antioquia</option>
                  <option value="Valle del Cauca">Valle del Cauca</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Ciudad:
                </label>
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="">Seleccionar ciudad</option>
                  <option value="Bogotá">Bogotá</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cali">Cali</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Dirección:
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Teléfono:
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRowDouble}>
                <div>
                  <label className={styles.formLabelShort}>
                    Cantidad torres/interiores:
                  </label>
                  <input
                    type="text"
                    name="cantidadTorres"
                    value={formData.cantidadTorres}
                    onChange={handleInputChange}
                    className={styles.formInputShort}
                  />
                </div>

                <div>
                  <label className={styles.formLabelNoMin}>
                    Cantidad de inmuebles:
                  </label>
                  <input
                    type="text"
                    name="cantidadInmuebles"
                    value={formData.cantidadInmuebles}
                    onChange={handleInputChange}
                    className={styles.formInputShort}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Estrato:
                </label>
                <input
                  type="text"
                  name="estrato"
                  value={formData.estrato}
                  onChange={handleInputChange}
                  className={styles.formInputShort}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Reglamento:
                </label>
                <div className={styles.buttonGroup}>
                  <button className={styles.buttonUpload}>
                    Subir archivo
                  </button>
                  <button className={styles.buttonUpload}>
                    Copiar texto
                  </button>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Logotipo:
                </label>
                <button className={styles.buttonUpload}>
                  Subir archivo
                </button>
              </div>
            </div>
          </div>

          <div className={styles.columnRight}>
            <div className={styles.sectionHeader}>
              Configurar Propiedad Horizontal
            </div>

            <div className={styles.configContainer}>
              <button
                onClick={() => setMostrarModalTorre(true)}
                className={`${styles.configButton} ${styles.configButtonPurple}`}
              >
                Crear torre/Interior
              </button>

              <button
                onClick={() => setMostrarModalInmueble(true)}
                className={`${styles.configButton} ${styles.configButtonBlue}`}
              >
                Crear inmueble/local
              </button>

              <button className={`${styles.configButton} ${styles.configButtonOrange}`}>
                Crear zonas comunes
              </button>
            </div>
          </div>
        </div>

        {/* 👇 BOTÓN GUARDAR CAMBIOS CENTRADO AL FINAL */}
        <div className={styles.saveButtonContainer}>
          <button
            onClick={handleGuardarCambios}
            className={styles.saveButton}
          >
            Guardar cambios
          </button>
        </div>

        {mostrarModalTorre && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  Creando torre/Interior:
                </h2>
                <p className={styles.modalSubtitle}>
                  Nombre o número de la nueva torre/Interior:
                </p>
              </div>

              <input
                type="text"
                value={nuevaTorre}
                onChange={(e) => setNuevaTorre(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAgregarTorre();
                  }
                }}
                className={styles.modalInput}
              />

              <div className={styles.torresList}>
                {torres.length === 0 ? (
                  <p className={styles.torresListEmpty}>
                    No hay torres creadas aún
                  </p>
                ) : (
                  torres.map((torre, index) => (
                    <div key={index} className={styles.torreItem}>
                      <label className={styles.torreLabel}>
                        {torre}
                      </label>
                      <button
                        onClick={() => handleEliminarTorre(index)}
                        className={styles.deleteButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.modalButtonContainer}>
                <button
                  onClick={handleGuardarTorres}
                  className={styles.modalSaveButton}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarModalInmueble && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.modalContentWide}`}>
              <h2 className={styles.modalTitleBlue}>
                Creando inmueble:
              </h2>

              <p className={styles.modalSubtitleBlue}>
                Responsable fiscal del apartamento:
              </p>

              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="responsableFiscal"
                  value={inmuebleData.responsableFiscal}
                  onChange={handleInmuebleInputChange}
                  className={styles.modalInputGray}
                />

                <select
                  name="tipoDocumento"
                  value={inmuebleData.tipoDocumento}
                  onChange={handleInmuebleInputChange}
                  className={styles.modalSelect}
                >
                  <option value="">Tipo de documento responsable fiscal:</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="NIT">NIT</option>
                  <option value="PAS">Pasaporte</option>
                </select>

                <input
                  type="text"
                  name="numeroDocumento"
                  placeholder="Número de documento:"
                  value={inmuebleData.numeroDocumento}
                  onChange={handleInmuebleInputChange}
                  className={styles.modalInputGray}
                />

                <input
                  type="text"
                  name="numeroInmueble"
                  placeholder="Número del inmueble:"
                  value={inmuebleData.numeroInmueble}
                  onChange={handleInmuebleInputChange}
                  className={styles.modalInputGray}
                />

                <div className={styles.formGroupRow}>
                  <select
                    name="torreInterior"
                    value={inmuebleData.torreInterior}
                    onChange={handleInmuebleInputChange}
                    className={styles.modalSelect}
                  >
                    <option value="">Torre/Interior:</option>
                    {torres.map((torre, index) => (
                      <option key={index} value={torre}>{torre}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    name="piso"
                    placeholder="Piso:"
                    value={inmuebleData.piso}
                    onChange={handleInmuebleInputChange}
                    className={styles.modalInputGray}
                  />
                </div>

                <div className={styles.formGroupRow}>
                  <select
                    name="tipoInmueble"
                    value={inmuebleData.tipoInmueble}
                    onChange={handleInmuebleInputChange}
                    className={styles.modalSelect}
                  >
                    <option value="">Tipo de inmueble:</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Casa">Casa</option>
                    <option value="Local">Local</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Parqueadero">Parqueadero</option>
                  </select>

                  <input
                    type="text"
                    name="coeficiente"
                    placeholder="Coeficiente del inmueble. (%):"
                    value={inmuebleData.coeficiente}
                    onChange={handleInmuebleInputChange}
                    className={styles.modalInputGray}
                  />
                </div>

                <input
                  type="text"
                  name="area"
                  placeholder="Área del inmueble. (m2):"
                  value={inmuebleData.area}
                  onChange={handleInmuebleInputChange}
                  className={styles.modalInputGray}
                />
              </div>

              <div className={styles.modalButtonContainer}>
                <button
                  onClick={handleGuardarInmueble}
                  className={`${styles.modalSaveButton} ${styles.modalSaveButtonBlue}`}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}