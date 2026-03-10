"use client";
import {
  useParticipants
} from "@livekit/components-react";
import { useState, Fragment } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';

export function CardAgenda() {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const participants = useParticipants();
  const [showAgenda, setShowAgenda] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentVote, setCurrentVote] = useState<any>(null);

  const votesExample = {
    title: "¿A quién eliges como secretaria de la asamblea?",
    status: "Votación en curso",
    stats: {
      presentes: 420,
      votosRealizados: 250,
      votosRestantes: 150,
      quorum: "87%",
      coeficiente: "90%"
    },
    options: [
      { name: "Pepe Castro", votes: 56, percent: 32.14 },
      { name: "Andrea Vallejo", votes: 27, percent: 21.16 },
      { name: "Martha Cañón", votes: 38, percent: 43.84 },
      { name: "Beymar González", votes: 43, percent: 53.12 },
    ],
    votesMatrix: [
      [true, false, true, false, true, false, true, false, true, false],
      [false, true, false, true, false, true, false, true, false, true],
      [true, false, true, false, true, false, true, false, true, false],
      [false, true, false, true, false, true, false, true, false, true],
      [true, false, true, false, true, false, true, false, true, false],
      [false, true, false, true, false, true, false, true, false, true],
    ]
  };

  return (<>
    <div className={styles["sidebar-content"]}>
      <div className={styles["info-card"]}>
        <div
          className={styles["info-card-header"]}
          onClick={() => setShowAgenda(!showAgenda)}
        >
          <div className={styles["info-card-title"]}>
            <div className={styles["info-card-icon icon-agenda"]}>
              <FileText size={20} color="white" />
            </div>
            <span>Orden del día</span>
          </div>
          {showAgenda ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>

        {showAgenda && (
          <div className={styles["card-seccion-order"]}>
            {/* Punto 1 */}
            <div className={styles["agenda-item"]}>
              <div className={styles["agenda-header"]}>
                <div className={styles["agenda-number"]}>
                  <span style={{ fontSize: "0.75rem", color: "#fff" }}>●</span>
                </div>
                <div className={styles["agenda-details"]}>
                  <div className={styles["agenda-title-text"]}>PUNTO 1</div>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    Elección secretario de la asamblea
                  </div>
                  <div className={`${styles["agenda-status"]} ${styles["closed"]}`}>● Votación cerrada</div>
                </div>
              </div>
              <div className={styles["voting-options"]}>
                <div className={styles["voting-label"]}>Opciones secretaria</div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>Carolina Yepes</div>
                  <div className={styles["option-votes"]}>57</div>
                </div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>Francisca González</div>
                  <div className={styles["option-votes"]}>36</div>
                </div>
                <div className={styles["option-item"]}>
                  <div className={`${styles["option-radio"]} ${styles["selected"]}`}></div>
                  <div className={styles["option-name"]}>Laura Díaz</div>
                  <div className={styles["option-votes"]}>84</div>
                </div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>Diana Forero</div>
                  <div className={styles["option-votes"]}>21</div>
                </div>
              </div>
              <div className={styles["action-buttons"]}>
                <button
                  className={styles["btn-vote"]}
                  onClick={() => {
                    setCurrentVote(votesExample);
                    setShowVoteModal(true);
                  }}
                >
                  Votar
                </button>
                <button
                  className={styles["btn-view"]}
                  onClick={() => {
                    setCurrentVote(votesExample);
                    setShowResultsModal(true);
                  }}
                >
                  Ver votos
                </button>
              </div>
            </div>

            {/* Punto 2 */}
            <div className={styles["agenda-item"]}>
              <div className={styles["agenda-header"]}>
                <div className={styles["agenda-number"]} style={{ background: "#ff9800" }}>
                  <span style={{ fontSize: "0.75rem", color: "#fff" }}>●</span>
                </div>
                <div className={styles["agenda-details"]}>
                  <div className={styles["agenda-title-text"]}>PUNTO 2</div>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    Elección presidente de la asamblea
                  </div>
                  <div className={`${styles["agenda-status"]} ${styles["active"]}`}>● Votación en curso</div>
                </div>
              </div>
              <div className={styles["voting-options"]}>
                <div className={styles["voting-label"]}>Opciones secretaria</div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>Pepe Castro</div>
                  <div className={styles["option-votes"]}>57</div>
                </div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>Andrea Vallejo</div>
                  <div className={styles["option-votes"]}>36</div>
                </div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>Martha Cañón</div>
                  <div className={styles["option-votes"]}>84</div>
                </div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>Beymar González</div>
                  <div className={styles["option-votes"]}>21</div>
                </div>
              </div>
              <div className={styles["action-buttons"]}>
                <button
                  className={styles["btn-vote"]}
                  onClick={() => {
                    setCurrentVote(votesExample);
                    setShowVoteModal(true);
                  }}
                >
                  Votar
                </button>
                <button
                  className={styles["btn-view"]}
                  onClick={() => {
                    setCurrentVote(votesExample);
                    setShowResultsModal(true);
                  }}
                >
                  Ver votos
                </button>
              </div>
            </div>

            {/* Punto 3 */}
            <div className={styles["agenda-item"]}>
              <div className={styles["agenda-header"]}>
                <div className={styles["agenda-number"]}>
                  <span style={{ fontSize: "0.75rem", color: "#fff" }}>●</span>
                </div>
                <div className={styles["agenda-details"]}>
                  <div className={styles["agenda-title-text"]}>PUNTO 3</div>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    Exposición estados financieros
                  </div>
                  <div className={`${styles["agenda-status"]} ${styles["pending"]}`}>● Votación a realizar</div>
                </div>
              </div>
              <div className={styles["voting-options"]}>
                <div className={styles["voting-label"]}>Opciones secretaria</div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>SI</div>
                  <div className={styles["option-votes"]}>0</div>
                </div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>NO</div>
                  <div className={styles["option-votes"]}>0</div>
                </div>
                <div className={styles["option-item"]}>
                  <div className={styles["option-radio"]}></div>
                  <div className={styles["option-name"]}>Abstención</div>
                  <div className={styles["option-votes"]}>0</div>
                </div>
              </div>
              <div className={styles["action-buttons"]}>
                <button
                  className={styles["btn-vote"]}
                  onClick={() => {
                    setCurrentVote(votesExample);
                    setShowVoteModal(true);
                  }}
                >
                  Votar
                </button>
                <button
                  className={styles["btn-view"]}
                  onClick={() => {
                    setCurrentVote(votesExample);
                    setShowResultsModal(true);
                  }}
                >
                  Ver votos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* MODAL PARA VOTAR */}
    {showVoteModal && currentVote && (
      <div className={styles["vote-modal-overlay"]} onClick={() => setShowVoteModal(false)}>
        <div className={styles["vote-modal"]} onClick={(e) => e.stopPropagation()}>
          <div className={styles["vote-header"]}>
            <div className={styles["vote-status"]}>
              <span className={styles["status-dot-green"]}></span>
              {currentVote.status}
            </div>
            <h3>{currentVote.title}</h3>
          </div>

          {/* SECCIÓN DE ASISTENCIA - IGUAL EN TODOS LADOS */}
          <div className={styles["vote-attendance-section"]}>
            <div className={styles["vote-attendance-header"]}>
              <span>Asistencia</span>
            </div>
            <div className={`${styles["attendance-grid"]} ${styles["attendance-votos"]}`}>
              <div className={styles["attendance-item"]}>
                <div className={styles["attendance-label"]}>Coeficiente</div>
                <div className={styles["attendance-value"]}>65%</div>
              </div>
              <div className={styles["attendance-item"]}>
                <div className={styles["attendance-label"]}>Quorum</div>
                <div className={`${styles["attendance-value"]} ${styles["quorum"]}`}>75%</div>
              </div>
            </div>
          </div>

          <div className={styles["vote-options"]}>
            {currentVote.options.map((opt: any, idx: number) => (
              <div
                className={styles["vote-option-item"]}
                key={idx}
                onClick={() => {/* Aquí manejas la selección */ }}
              >
                <div className={styles["vote-radio"]}></div>
                <div className={styles["vote-option-name"]}>{opt.name}</div>
              </div>
            ))}
          </div>

          <div className={styles["vote-actions"]}>
            <button
              className={styles["vote-cancel"]}
              onClick={() => setShowVoteModal(false)}
            >
              Cancelar
            </button>
            <button
              className={styles["vote-submit"]}
              onClick={() => {
                // Aquí envías el voto
                setShowVoteModal(false);
              }}
            >
              Votar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* MODAL PARA VER RESULTADOS */}
    {showResultsModal && currentVote && (
      <div className={styles["results-modal-overlay"]} onClick={() => setShowResultsModal(false)}>
        <div className={styles["results-modal"]} onClick={(e) => e.stopPropagation()}>
          <div className={styles["results-header"]}>
            <div className={styles["results-status"]}>
              <span className={styles["results-status-dot"]}></span>
              {currentVote.status}
            </div>
            <div className={styles["results-title"]}>{currentVote.title}</div>

            {/* CAMBIAR ESTA SECCIÓN POR EL FORMATO DE ASISTENCIA */}
            <div className={styles["results-attendance-section"]}>
              <div className={styles["results-attendance-header"]}>
                <span>Asistencia</span>
              </div>
              <div className={styles["attendance-grid"]}>
                <div className={styles["attendance-item"]}>
                  <div className={styles["attendance-label"]}>Presentes</div>
                  <div className={styles["attendance-value"]}>{participants.length}</div>
                </div>
                <div className={styles["attendance-item"]}>
                  <div className={styles["attendance-label"]}>Ausentes</div>
                  <div className={styles["attendance-value"]}>250</div>
                </div>
                <div className={styles["attendance-item"]}>
                  <div className={styles["attendance-label"]}>Citados</div>
                  <div className={styles["attendance-value"]}>1.000</div>
                </div>
                <div className={styles["attendance-item"]}>
                  <div className={styles["attendance-label"]}>Coeficiente</div>
                  <div className={styles["attendance-value"]}>65%</div>
                </div>
                <div className={styles["attendance-item"]}>
                  <div className={styles["attendance-label"]}>Quorum</div>
                  <div className={`${styles["attendance-value"]} ${styles["quorum"]}`}>75%</div>
                </div>
              </div>
            </div>

            <div className={styles["results-link"]}>
              <a href="#">Ver Reporte</a>
            </div>
          </div>

          <div className={styles["results-table"]}>
            <div className={styles["results-table-header"]}>
              <span>Opción</span>
              <span># Votos</span>
              <span>% Coeficiente</span>
            </div>

            {currentVote.options.map((opt: any, idx: number) => (
              <div className={styles["results-row"]} key={idx}>
                <div className={styles["results-option-name"]}>
                  <span className={styles["results-radio-dot"]}></span>
                  {opt.name}
                </div>
                <div className={styles["results-votes"]}>{opt.votes}</div>
                <div className={styles["results-percentage"]}>
                  <span className={styles["results-percentage-text"]}>{opt.percent}%</span>
                  <div className={styles["results-bar"]}>
                    <div
                      className={styles["results-bar-fill"]}
                      style={{ width: `${opt.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles["results-tabs"]}>
            <button className={`${styles["results-tab"]} ${styles["active"]}`}>Voto realizado</button>
            <button className={styles["results-tab"]}>Votos no realizados</button>
          </div>

          <div className={styles["results-matrix"]}>
            <div className={styles["matrix-header-cell"]}></div>
            {[...Array(10)].map((_, i) => (
              <div className={styles["matrix-header-cell"]} key={i}>
                {String(i + 1).padStart(3, '0')}
              </div>
            ))}

            {currentVote.votesMatrix.map((row: boolean[], rowIdx: number) => (
              <Fragment key={`row-group-${rowIdx}`}>
                <div className={styles["matrix-header-cell"]} key={`row-${rowIdx}`}>
                  {String(rowIdx + 1).padStart(3, '0')}
                </div>
                {row.map((voted, colIdx) => (
                  <div
                    className={`${styles["matrix-cell"]} ${voted ? styles['voted'] : ''}`}
                    key={`${rowIdx}-${colIdx}`}
                  />
                ))}
              </Fragment>
            ))}
          </div>

          <button
            className={styles["results-close"]}
            onClick={() => setShowResultsModal(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    )}
  </>);
}
