"use client";

import { useState, useEffect } from "react";

export default function Asamblea() {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const listener = () => setIsMobile(window.innerWidth <= 900);
    listener();
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  const toggle = (key: string) => {
    if (!isMobile) return;
    setOpen(prev => (prev === key ? null : key));
  };

  return (
    <main className="container">

      {/* HEADER */}
      <header className="header">
        <button className="logoBtn">Logo</button>
        <p className="saludo">Hola, Felipe</p>
      </header>

      {/* TITULO + TIEMPO */}
      <section className="titulo">
        <h2>Primera Asamblea General 2026 Conjunto Los Robles</h2>
        <p className="sub">Conectando PH.</p>
        <span className="record">
          <span className="dot" /> 1:20:17 Tiempo de grabación asamblea
        </span>
      </section>

      {/* PANEL CENTRAL  (SIEMPRE VISIBLE) */}
      <section className="panelCentral">
        <div className="pantalla">
          <span className="chipUser">Amelia Diaz, apto 505, torre B</span>
        </div>
        <div className="controles">
          <div className="controlCircle" />
          <div className="controlCircle" />
          <div className="controlCircle" />
        </div>
      </section>

      {/* ORDEN DEL DÍA */}
      <aside className="orden" onClick={() => toggle("order")}>
        <h3>Orden del día</h3>
        {(!isMobile || open === "order") && (
        <div className="ordenBody">
          {/* Punto 1 */}
          <div className="modulo">
            <h4>PUNTO 1</h4>
            <small>Elección secretario de la asamblea</small>

            <div className="box">
              <p className="estado verde">Votación cerrada</p>
              <ul className="list">
                <li>Carolina Yepes <b>57</b></li>
                <li>Francisco González <b>36</b></li>
                <li>Laura Díaz <b>84</b></li>
                <li>Diana Forero <b>21</b></li>
              </ul>
              <div className="acciones">
                <button>Votar</button>
                <button className="sec">Ver votos</button>
              </div>
            </div>
          </div>

          {/* Punto 2 */}
          <div className="modulo">
            <h4>PUNTO 2</h4>
            <small>Elección presidente de la asamblea</small>

            <div className="box">
              <p className="estado verde">Votación en curso</p>
              <ul className="list">
                <li>Pepe Castro <b>47</b></li>
                <li>Andrea Vallejo <b>26</b></li>
                <li>Martha Cañón <b>114</b></li>
                <li>Beymar González <b>81</b></li>
              </ul>
              <div className="acciones">
                <button>Votar</button>
                <button className="sec">Ver votos</button>
              </div>
            </div>
          </div>

          {/* Punto 3 */}
          <div className="modulo">
            <h4>PUNTO 3</h4>
            <small>Exposición estados financieros</small>

            <div className="box">
              <p className="estado amarillo">Votación a realizar</p>
              <ul className="list">
                <li>SI <b>57</b></li>
                <li>NO <b>36</b></li>
                <li>Abstención <b>84</b></li>
              </ul>
              <div className="acciones">
                <button>Votar</button>
                <button className="sec">Ver votos</button>
              </div>
            </div>
          </div>
        </div>
         )}
      </aside>

      {/* COLUMNA DERECHA */}
      <aside className="derecha" onClick={() => toggle("asistencia")}>        
        <div className="boxDer">
          <h4>Asistencia</h4>
          <p>Presentes <b>750</b></p>
          <p>Ausentes <b>250</b></p>
          <p>Citados <b>1.000</b></p>
          <p className="q">Quorum <b>75%</b></p>
        </div>

        {/* PETICIÓN DE PALABRA */}
        <div className="boxDer">
          <button className="mobileTitle" onClick={() => toggle("peticion")}>
            Petición de palabra (4)
          </button>
          {(!isMobile || open === "peticion") && (
            <ul>
              <li>Rodrigo Pérez, apto 501, torre 6</li>
              <li>Claudia López, apto 303, torre 2</li>
              <li>Laura Arciniégas, apto 205, torre 1</li>
              <li>Karen Manios, apto 804, torre 7</li>
            </ul>
          )}
        </div>

        {/* CONECTADOS */}
        <div className="boxDer">
          <button className="mobileTitle" onClick={() => toggle("conectados")}>
            Actualmente conectados
          </button>
          {(!isMobile || open === "conectados") && (
            <ul>
              <li>Rodrigo Pérez, apto 501, torre 6</li>
              <li>Claudia López, apto 303, torre 2</li>
              <li>Laura Arciniégas, apto 205, torre 1</li>
              <li>Karen Manios, apto 804, torre 7</li>
            </ul>
          )}
        </div>
      </aside>

      {/* ARCHIVOS + MENSAJES */}
      <div className="bottom">

        <section className="archivos">
          <button className="mobileTitle" onClick={() => toggle("archivos")}>
            Archivos compartidos
          </button>
          {(!isMobile || open === "archivos") && (
            <>
              <label><input type="checkbox" /> Estados Financieros 2025</label>
              <label><input type="checkbox" /> Estados Financieros 2024</label>
              <label><input type="checkbox" /> Cotización puertas</label>
              <label><input type="checkbox" /> Recibo compra vidrios</label>
            </>
          )}
        </section>

        <section className="mensajes">
          <button className="mobileTitle" onClick={() => toggle("mensajes")}>
            Mensajes a moderador
          </button>
          {(!isMobile || open === "mensajes") && (
            <>
              <article>
                <b>Laura Arciniégas, apto 205</b>
                <p>Agregar el documento de cotización para descargar</p>
              </article>
              <article>
                <b>Laura Arciniégas, apto 205</b>
                <p>Hablar de la propuesta de la nueva puerta</p>
              </article>
            </>
          )}
        </section>
      </div>

      {/* ================= CSS ================= */}
      <style jsx>{`
        .container {
          display: grid;
          grid-template-columns: 1fr 350px 350px;
          gap: 20px;
          padding: 20px;
          font-family: sans-serif;
          margin-bottom: 7rem;
        }

        .header {
          grid-column: 1/4;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logoBtn {
          border: 2px solid #000;
          padding: 10px 20px;
          border-radius: 10px;
          background: white;
        }

        .titulo { grid-column: 1/4; }
        .record { font-size: 13px; }
        .dot { width: 8px; height: 8px; background: red; display: inline-block; border-radius: 50%; margin-right: 4px; }

        .panelCentral {
          border: 2px solid #000;
          border-radius: 6px;
          padding: 10px;
        }
        .pantalla {
          border: 2px solid #000;
          height: 370px;
          border-radius: 6px;
          padding: 8px;
        }
        .chipUser {
          background: white;
          border-radius: 14px;
          padding: 4px 8px;
          font-size: 12px;
          display: inline-block;
        }
        .controles { display: flex; gap: 8px; margin-top: 10px; }
        .controlCircle { width: 28px; height: 28px; background: white; border: 2px solid #000; border-radius: 50%; }

        /* ===== ORDEN DEL DÍA ===== */
        .orden h3 {
          background: #b79b47;
          color: white;
          padding: 6px;
          border-radius: 4px;
        }
        .ordenBody {
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow-y: auto;
          max-height: 78vh;
          padding-right: 6px;
          scrollbar-width: thin;
        }
        .ordenBody::-webkit-scrollbar { width: 6px; }
        .ordenBody::-webkit-scrollbar-thumb { background: #b1974b; border-radius: 8px; }

        .modulo {
          border: 1px solid #000;
          border-radius: 12px;
          padding: 16px;
          background: white;
        }

        .box {
          border: 2px solid #000;
          padding: 10px;
          border-radius: 6px;
          margin-top: 6px;
        }
        .estado { font-size: 13px; margin-bottom: 6px; }
        .verde { color: green; }
        .amarillo { color: #c49a00; }

        .acciones button {
          margin-right: 8px;
          padding: 4px 8px;
          border: 1px solid #000;
          background: white;
        }
        .sec { background: #e5e5e5; }

        /* ===== DERECHA ===== */
        .derecha .boxDer {
          border: 2px solid #000;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 14px;
        }
        .q { background: #b79b47; color: white; padding: 4px; border-radius: 4px; }

        /* ===== BOTTOM ===== */
        .bottom {
          grid-column: 1/4;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 20px;
        }
        .archivos, .mensajes {
          border: 2px solid #000;
          border-radius: 6px;
          padding: 12px;
        }

        .mobileTitle {
          display: none;
          width: 100%;
          text-align: left;
          padding: 8px;
          font-weight: bold;
          border: none;
          background: #b79b47;
          color: white;
          margin-bottom: 8px;
          border-radius: 4px;
        }

        @media (max-width: 900px) {

            /* ===== CONTENEDOR GENERAL ===== */
            .container {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 12px;
                padding-bottom: 100px;
            }

            /* ===== HEADER ===== */
            .header {
                gap: 10px;
            }

            /* ===== TITULO ===== */
            .titulo h2 {
                font-size: 16px;
            }

            .sub {
                font-size: 14px;
            }

            /* ===== PANEL CENTRAL ===== */
            .panelCentral {
                order: 1;
            }

            .pantalla {
                height: 200px;
            }

            /* ===== ORDEN DEL DÍA ===== */
            .orden {
                order: 2;
            }

            .orden h3 {
                background: #b79b47;
                color: #000;
                padding: 10px;
                border-radius: 6px;
                font-weight: bold;
            }

            .ordenBody {
                max-height: none;
                overflow: visible;
                gap: 14px;
            }

            .modulo {
                border: 1px solid #000;
                border-radius: 14px;
                padding: 12px;
                background: #fff;
            }

            .modulo h4 {
                margin-bottom: 2px;
            }

            .box {
                border: 2px solid #000;
                border-radius: 8px;
                padding: 10px;
                margin-top: 6px;
            }

            .estado {
                font-weight: bold;
                font-size: 13px;
            }

            .acciones {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                margin-top: 8px;
            }

            .acciones button {
                width: 50%;
                padding: 6px;
                font-weight: bold;
                border-radius: 6px;
            }

            /* ===== DERECHA (ASISTENCIA) ===== */
            .derecha {
                order: 3;
            }

            .derecha .boxDer:first-child {
                background: white;
                border-radius: 8px;
                padding: 0;
                overflow: hidden;
            }

            .derecha .boxDer:first-child h4 {
                margin: 0;
                padding: 10px;
                font-weight: bold;
            }

            .derecha .boxDer:first-child p {
                display: inline-block;
                width: 33.33%;
                margin: 0;
                padding: 10px 0;
                text-align: center;
                font-size: 14px;
            }

            .derecha .boxDer:first-child .q {
                width: 100%;
                display: block;
                background: #9c9c9c;
                color: #000;
                font-weight: bold;
                padding: 8px 0;
            }

            /* ===== SECCIONES COLAPSABLES ===== */
            .mobileTitle {
                display: block;
                width: 100%;
                text-align: left;
                background: #b79b47;
                color: #000;
                font-weight: bold;
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 8px;
            }

            .boxDer ul,
            .archivos label,
            .mensajes article {
                background: #fff;
                border: 1px solid #000;
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 8px;
            }

            /* ===== ARCHIVOS + MENSAJES ===== */
            .bottom {
                order: 4;
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            .archivos,
            .mensajes {
                padding: 0;
            }

            /* ===== ESPACIADOS GENERALES ===== */
            .orden,
            .derecha,
            .archivos,
            .mensajes {
                margin-bottom: 10px;
            }
            }
            .archivos{
            display: flex;
                flex-direction: column;
            }

      `}</style>

    </main>
  );
}
