"use client";

import {
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
  useLocalParticipant
} from "@livekit/components-react";
import "@livekit/components-styles";
import LogoUsuarios from '@/app/components/logo_usuarios';
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import {
  Video,
  Mic,
  Monitor,
  ChevronDown,
  ChevronUp,
  Hand,
  Users,
  FileText,
  MessageSquare,
  Send,
  VideoOff,
  MicOff
} from "lucide-react";
import { useSession } from "next-auth/react";

// Import types and components from separate files 
import { Message, WordRequest } from "./types";
import { RecordingIndicator } from "./RecordingIndicator";
import { RecordingControls } from "./RecordingControls";
import { MessageNotifications } from "./MessageNotifications";
import { WordRequestNotifications } from "./WordRequestNotifications";

export function AssemblyInterface() {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);

  // UI State
  const [showAgenda, setShowAgenda] = useState(true);
  const [showWordRequests, setShowWordRequests] = useState(true);
  const [showConnected, setShowConnected] = useState(true);
  const [showSharedFiles, setShowSharedFiles] = useState(true);
  const [showMessages, setShowMessages] = useState(true);
  const [message, setMessage] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Mensajes y notificaciones
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'Laura Arciniegas, apto 205, torre 1',
      text: 'Agregar el documento de cotización para descargar',
      time: '12:30 p.m.',
      isRead: true,
    },
    {
      id: '2',
      author: 'Laura Arciniegas, apto 205, torre 1',
      text: 'Agregar el documento de cotización para descargar',
      time: '12:30 p.m.',
      isRead: true,
    },
    {
      id: '3',
      author: 'Laura Arciniegas, apto 205, torre 1',
      text: 'Agregar el documento de cotización para descargar',
      time: '12:30 p.m.',
      isRead: true,
    },
    {
      id: '4',
      author: 'Moderador',
      text: 'Ok Agregaremos el documento de cotización para descargar',
      time: '12:30 p.m.',
      isRead: true,
      isModerator: true,
      replyTo: {
        author: 'Moderador',
        text: 'Ok Agregaremos el documento de cotización para descargar'
      }
    },
  ]);

  const [notifications, setNotifications] = useState<Message[]>([]);

  // Peticiones de palabra
  const [wordRequests, setWordRequests] = useState<WordRequest[]>([
    {
      id: '1',
      name: 'Rodrigo Pérez',
      apartment: '501',
      tower: '6',
      initials: 'RP',
      time: '12:25 p.m.'
    },
    {
      id: '2',
      name: 'Claudia López',
      apartment: '303',
      tower: '2',
      initials: 'CL',
      time: '12:28 p.m.'
    },
    {
      id: '3',
      name: 'Laura Arciniegas',
      apartment: '205',
      tower: '1',
      initials: 'LA',
      time: '12:29 p.m.'
    }
  ]);
  const [wordRequestNotifications, setWordRequestNotifications] = useState<WordRequest[]>([]);

  // Dos modales separados
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

  // Función para obtener la hora actual formateada
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Función para enviar mensaje
  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      author: userName,
      text: message,
      time: getCurrentTime(),
      isRead: true,
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Crear notificación
    setNotifications(prev => [...prev, { ...newMessage, isRead: false }]);
    
    // Auto-eliminar notificación después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newMessage.id));
    }, 5000);

    setMessage('');
  };

  // Función para cerrar notificación
  const closeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Función para cerrar notificación de petición de palabra
  const closeWordRequestNotification = (id: string) => {
    setWordRequestNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Control de cámara y micrófono
  const toggleCamera = () => {
    localParticipant.setCameraEnabled(!isCameraOn);
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(!isMicOn);
    setIsMicOn(!isMicOn);
  };

  // Control de petición de palabra
  const toggleHandRaised = () => {
    const newHandRaisedState = !isHandRaised;
    setIsHandRaised(newHandRaisedState);

    if (newHandRaisedState) {
      // Levantar la mano
      const newRequest: WordRequest = {
        id: Date.now().toString(),
        name: 'Andrés',
        apartment: '102',
        tower: '3',
        initials: 'AN',
        time: getCurrentTime()
      };

      setWordRequests(prev => [...prev, newRequest]);
      
      // Crear notificación
      setWordRequestNotifications(prev => [...prev, newRequest]);
      
      // Auto-eliminar notificación después de 5 segundos
      setTimeout(() => {
        setWordRequestNotifications(prev => prev.filter(n => n.id !== newRequest.id));
      }, 5000);
    } else {
      // Bajar la mano - eliminar de la lista
      setWordRequests(prev => prev.filter(req => req.name !== 'Andrés'));
    }
  };

  // Sincronizar estado inicial
  useEffect(() => {
    setIsCameraOn(localParticipant.isCameraEnabled);
    setIsMicOn(localParticipant.isMicrophoneEnabled);
  }, [localParticipant]);

  // Obtener el video track principal
  const mainVideoTrack = tracks.find(
    (track) => track.source === Track.Source.Camera
  );

  return (
    <div className={styles["assembly_container"]}>

      {/* Notificaciones de mensajes */}
      <MessageNotifications 
        messages={notifications}
        onClose={closeNotification}
      />

      {/* Notificaciones de peticiones de palabra */}
      <WordRequestNotifications 
        requests={wordRequestNotifications}
        onClose={closeWordRequestNotification}
      />

      <div className={styles["text-center"]}>
        <div className={styles["logoWrapper"]}>
          <LogoUsuarios />
        </div>
        <div className={styles["blockName"]}>
          <p className="saludo">
            Hola, 
          </p>
          <strong className={styles.saludoName}>{userName}</strong>
        </div>
      </div>

      <div className={styles["assembly-main"]}>
        {/* COLUMNA IZQUIERDA - Video + Archivos + Mensajes */}
        <div className={styles["main-content"]}>
          <h1 className={styles["greeting"]}>Hola, {userName}</h1>
          <div className={`${styles["text-center"]} ${styles["mobile-title-section"]}`}>
            <p className={styles["assembly-title"]}>
              Primera Asamblea General 2026 Conjunto Los Robles
            </p>
            <p className={styles["assembly-subtitle"]}>Conectando PH</p>
          </div>

          <div className={styles["desktop-video-wrapper"]}>
            <div className={styles["video-section"]}>
              <div className={styles["current-speaker"]}>
                {userName}, apto 505, torre B
              </div>

              <RecordingIndicator />

              <div className={styles["video-container"]}>
                {mainVideoTrack && (
                  <VideoTrack
                    trackRef={mainVideoTrack}
                    className={styles["livekit-video-track"]}
                  />
                )}
                {tracks
                  .filter((track) => track.source === Track.Source.Microphone)
                  .map((track) => (
                    <AudioTrack key={track.participant.identity} trackRef={track} />
                  ))}
              </div>

              <div className={styles["video-controls"]}>
                <button
                  className={`${styles["control-btn"]} ${isCameraOn ? styles["active"] : styles["inactive"]}`}
                  onClick={toggleCamera}
                  title={isCameraOn ? "Apagar cámara" : "Encender cámara"}
                >
                  {isCameraOn ? (
                    <Video size={24} color="#fff" />
                  ) : (
                    <VideoOff size={24} color="#fff" />
                  )}
                </button>
                <button
                  className={`${styles["control-btn"]} ${isMicOn ? styles["active"] : styles["inactive"]}`}
                  onClick={toggleMic}
                  title={isMicOn ? "Silenciar micrófono" : "Activar micrófono"}
                >
                  {isMicOn ? (
                    <Mic size={24} color="#fff" />
                  ) : (
                    <MicOff size={24} color="#fff" />
                  )}
                </button>
                <button 
                  className={styles["control-btn"]}
                  title="Compartir pantalla"
                >
                  <Monitor size={24} color="#666" />
                </button>
                <button
                  className={`${styles["control-btn"]} ${isHandRaised ? styles["hand-raised"] : ""}`}
                  onClick={toggleHandRaised}
                  title={isHandRaised ? "Bajar mano" : "Levantar mano"}
                >
                  <Hand size={24} color={isHandRaised ? "#fff" : "#666"} />
                </button>
                <RecordingControls />
              </div>
            </div>
          </div>

          <div className={styles["desktop-bottom-panels"]}>
            <div className={styles["info-card"]}>
              <div
                className={styles["info-card-header"]}
                onClick={() => setShowSharedFiles(!showSharedFiles)}
              >
                <div className={styles["info-card-title"]}>
                  <div className={`${styles["info-card-icon"]} ${styles["icon-files"]}`}>
                    <FileText size={20} color="white" />
                  </div>
                  <span>Archivos compartidos</span>
                </div>
                {showSharedFiles ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {showSharedFiles && (
                <div>
                  {["Estados Financieros 2025", "Estados Financieros 2025", "Cotización puertas", "Recibo compra vidrios"].map((file, idx) => (
                    <div className={styles["file-item"]} key={idx}>
                      <div className={styles["file-info"]}>
                        <div className={styles["file-icon"]}>
                          <FileText size={18} color="white" />
                        </div>
                        <div className={styles["file-name"]}>{file}</div>
                      </div>
                      <div className={styles["file-actions"]}>
                        <div className={styles["file-action-btn"]}>
                          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className={styles["file-action-btn"]}>
                          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles["info-card"]}>
              <div
                className={styles["info-card-header"]}
                onClick={() => setShowMessages(!showMessages)}
              >
                <div className={styles["info-card-title"]}>
                  <div className={`${styles["info-card-icon"]} ${styles["icon-messages"]}`}>
                    <MessageSquare size={20} color="white" />
                  </div>
                  <span>Mensajes a moderador</span>
                </div>
                {showMessages ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {showMessages && (
                <div>
                  <div className={styles["messages-container"]}>
                    {messages.map((msg) => (
                      <div className={styles["message-item"]} key={msg.id}>
                        {msg.replyTo && (
                          <div className={styles["message-reply"]}>
                            <div className={styles["message-reply-author"]}>{msg.replyTo.author}</div>
                            <div className={styles["message-reply-text"]}>{msg.replyTo.text}</div>
                          </div>
                        )}
                        <div className={styles["message-header"]} style={msg.replyTo ? { marginTop: "0.5rem" } : {}}>
                          <div className={styles["message-author"]}>{msg.author}</div>
                          <div className={styles["message-time"]}>{msg.time}</div>
                        </div>
                        {!msg.replyTo && (
                          <div className={styles["message-text"]}>{msg.text}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className={styles["message-input-container"]}>
                    <input
                      type="text"
                      className={styles["message-input"]}
                      placeholder="Mensaje"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <button 
                      className={styles["message-send-btn"]}
                      onClick={sendMessage}
                      disabled={!message.trim()}
                    >
                      <Send size={20} color="white" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`${styles["info-card"]} ${styles["mobile-attendance-card"]}`}>
            <div className={styles["info-card-header"]}>
              <div className={styles["info-card-title"]}>
                <div className={`${styles["info-card-icon"]} ${styles["icon-attendance"]}`}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Asistencia</span>
              </div>
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
                <div className={styles["attendance-value quorum"]}>75%</div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRO - Orden del día */}
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

        {/* COLUMNA DERECHA */}
        <div className={styles["desktop-right-column"]}>
          <div className={`${styles["info-card"]} ${styles["desktop-attendance-card"]}`}>
            <div className={styles["info-card-header"]}>
              <div className={styles["info-card-title"]}>
                <div className={`${styles["info-card-icon"]} ${styles["icon-attendance"]}`}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Asistencia</span>
              </div>
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

          <div className={styles["info-card"]}>
            <div
              className={styles["info-card-header"]}
              onClick={() => setShowWordRequests(!showWordRequests)}
            >
              <div className={styles["info-card-title"]}>
                <div className={`${styles["info-card-icon"]} ${styles["icon-word-request"]}`}>
                  <Hand size={20} color="white" />
                </div>
                <span>Petición de palabra ({wordRequests.length})</span>
              </div>
              {showWordRequests ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>

            {showWordRequests && (
              <div>
                {wordRequests.map((request) => (
                  <div className={styles["word-request-item"]} key={request.id}>
                    <div className={styles["word-request-info"]}>
                      <div className={styles["word-request-avatar"]}>{request.initials}</div>
                      <div className={styles["word-request-name"]}>
                        {request.name}, apto {request.apartment}, torre {request.tower}
                      </div>
                    </div>
                    <div className={styles["word-request-time"]}>{request.time}</div>
                  </div>
                ))}
                {wordRequests.length === 0 && (
                  <div className={styles["no-requests"]}>No hay peticiones de palabra</div>
                )}
              </div>
            )}
          </div>

          <div className={styles["info-card"]}>
            <div
              className={styles["info-card-header"]}
              onClick={() => setShowConnected(!showConnected)}
            >
              <div className={styles["info-card-title"]}>
                <div className={`${styles["info-card-icon"]} ${styles["icon-connected"]}`}>
                  <Users size={20} color="#333" />
                </div>
                <span>Actualmente conectados ({participants.length})</span>
              </div>
              {showConnected ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>

            {showConnected && (
              <div>
                {participants.map((participant) => {
                  const isLocal = participant.identity === localParticipant.identity;
                  
                  return (
                    <div className={styles["connected-item"]} key={participant.identity}>
                      <div className={styles["connected-info"]}>
                        <div className={styles["connected-avatar"]}>
                          {participant.name?.substring(0, 2).toUpperCase() || "??"}
                        </div>
                        <div className={styles["connected-name"]}>
                          {participant.name || participant.identity}
                          {isLocal && " (Tú)"}
                        </div>
                      </div>
                      <div className={styles["connected-status"]}>
                        <div 
                          className={`${styles["status-icon"]} ${participant.isCameraEnabled ? styles["active"] : ""}`}
                          onClick={() => {
                            if (isLocal) {
                              toggleCamera();
                            }
                          }}
                          style={{ cursor: isLocal ? "pointer" : "default" }}
                          title={isLocal ? (participant.isCameraEnabled ? "Apagar cámara" : "Encender cámara") : ""}
                        >
                          {participant.isCameraEnabled ? (
                            <Video size={14} color="white" />
                          ) : (
                            <VideoOff size={14} color="white" />
                          )}
                        </div>
                        <div 
                          className={`${styles["status-icon"]} ${participant.isMicrophoneEnabled ? styles["active"] : ""}`}
                          onClick={() => {
                            if (isLocal) {
                              toggleMic();
                            }
                          }}
                          style={{ cursor: isLocal ? "pointer" : "default" }}
                          title={isLocal ? (participant.isMicrophoneEnabled ? "Silenciar micrófono" : "Activar micrófono") : ""}
                        >
                          {participant.isMicrophoneEnabled ? (
                            <Mic size={14} color="white" />
                          ) : (
                            <MicOff size={14} color="white" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
                  onClick={() => {/* Aquí manejas la selección */}}
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
                <>
                  <div className={styles["matrix-header-cell"]} key={`row-${rowIdx}`}>
                    {String(rowIdx + 1).padStart(3, '0')}
                  </div>
                  {row.map((voted, colIdx) => (
                    <div 
                      className={`${styles["matrix-cell"]} ${voted ? styles['voted'] : ''}`} 
                      key={`${rowIdx}-${colIdx}`}
                    />
                  ))}
                </>
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
    </div>
  );
}