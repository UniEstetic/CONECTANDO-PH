"use client";

import {
  LiveKitRoom,
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import LogoUsuarios from '@/app/usuarios/components/logo_usuarios';
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { Track, RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Home,
  Bell,
  MessageCircle,
  HelpCircle,
  User,
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
  MicOff,
  Circle,
  X,
} from "lucide-react";

// Tipo para los mensajes
interface Message {
  id: string;
  author: string;
  text: string;
  time: string;
  isRead: boolean;
  isModerator?: boolean;
  replyTo?: {
    author: string;
    text: string;
  };
}

// Tipo para peticiones de palabra
interface WordRequest {
  id: string;
  name: string;
  apartment: string;
  tower: string;
  initials: string;
  time: string;
}

// Componente para el indicador de grabación
function RecordingIndicator() {
  const room = useRoomContext();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!room) return;

    setIsRecording(room.isRecording);

    const handleRecordingStatusChanged = () => {
      const recording = room.isRecording;
      setIsRecording(recording);
      
      if (recording) {
        setRecordingStartTime(Date.now());
      } else {
        setRecordingStartTime(null);
        setRecordingDuration(0);
      }
    };

    room.on(RoomEvent.RecordingStatusChanged, handleRecordingStatusChanged);

    return () => {
      room.off(RoomEvent.RecordingStatusChanged, handleRecordingStatusChanged);
    };
  }, [room]);

  useEffect(() => {
    if (!isRecording || !recordingStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
      setRecordingDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, recordingStartTime]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  return (
    <div className="recording-indicator">
      <div className="recording-dot"></div>
      <span>Tiempo de grabación asamblea</span>
      <span style={{ fontWeight: "700" }}>{formatDuration(recordingDuration)}</span>
    </div>
  );
}

// Componente para controlar la grabación
function RecordingControls() {
  const room = useRoomContext();
  const [isRecording, setIsRecording] = useState(false);
  const [egressId, setEgressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!room) return;
    setIsRecording(room.isRecording);

    const handleRecordingStatusChanged = () => {
      setIsRecording(room.isRecording);
    };

    room.on(RoomEvent.RecordingStatusChanged, handleRecordingStatusChanged);

    return () => {
      room.off(RoomEvent.RecordingStatusChanged, handleRecordingStatusChanged);
    };
  }, [room]);

  const startRecording = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: room.name,
          action: "start",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEgressId(data.egressId);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stop",
          egressId,
        }),
      });
      setEgressId(null);
    } catch (error) {
      console.error("Error stopping recording:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isLoading}
      className={`control-btn ${isRecording ? "recording" : ""}`}
      title={isRecording ? "Detener grabación" : "Iniciar grabación"}
    >
      <Circle 
        size={24} 
        color={isRecording ? "#ff4444" : "#666"}
        fill={isRecording ? "#ff4444" : "transparent"}
      />
    </button>
  );
}

// Componente para notificaciones de mensajes
function MessageNotifications({ 
  messages, 
  onClose 
}: { 
  messages: Message[], 
  onClose: (id: string) => void 
}) {
  return (
    <div className="message-notifications">
      {messages.map((msg) => (
        <div key={msg.id} className="notification-toast">
          <div className="notification-content">
            <div className="notification-header">
              <MessageCircle size={16} color="#f44336" />
              <span className="notification-title">Nuevo mensaje</span>
              <button 
                className="notification-close"
                onClick={() => onClose(msg.id)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="notification-author">{msg.author}</div>
            <div className="notification-text">{msg.text}</div>
            <div className="notification-time">{msg.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para notificaciones de peticiones de palabra
function WordRequestNotifications({ 
  requests, 
  onClose 
}: { 
  requests: WordRequest[], 
  onClose: (id: string) => void 
}) {
  return (
    <div className="message-notifications">
      {requests.map((req) => (
        <div key={req.id} className="notification-toast notification-hand">
          <div className="notification-content">
            <div className="notification-header">
              <Hand size={16} color="#9c27b0" />
              <span className="notification-title notification-hand-title">Petición de palabra</span>
              <button 
                className="notification-close"
                onClick={() => onClose(req.id)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="notification-author">{req.name}</div>
            <div className="notification-text">Apto {req.apartment}, torre {req.tower}</div>
            <div className="notification-time">{req.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente interno que usa hooks de LiveKit
function AssemblyInterface() {
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
      author: 'Andrés (Tú)',
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
    <div className="assembly_container">
      <style jsx global>{`

        .logoWrapper{
          justify-content: center;
          display: flex;
        }

        .blockName{
          font-size: 24px;
          margin-top:1rem;
          gap: 7px;
          display: flex;
        }
        
        .text-center{
          padding-top: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .assembly_container {
          min-height: 100vh;
          background: linear-gradient(#f3deaa 0%, #b68c3a 24%, #9c7b2f 100%);
          padding: 0;
        }

        .assembly-header {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.5rem auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: #d4af6e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .logo-ph {
          color: #d4af6e;
        }

        .assembly-main {
          padding: 0 1.5rem 6rem;
        }

        .greeting {
          font-size: 2.5rem;
          font-weight: 300;
          color: white;
          text-align: center;
          margin-bottom: 1rem;
        }

        .assembly-title {
          font-size: 1rem;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .assembly-subtitle {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 1.5rem;
        }

        .video-section {
          background: #1a1a1a;
          border-radius: 20px;
          padding: 0;
          margin-bottom: 1.5rem;
          min-height: 400px;
          position: relative;
          overflow: hidden;
        }

        .video-container {
          width: 100%;
          height: 100%;
          min-height: 400px;
          position: relative;
        }

        .livekit-video-track {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .current-speaker {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: white;
          border-radius: 50px;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          color: #333;
          z-index: 10;
        }

        .video-controls {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          display: flex;
          gap: 1rem;
          z-index: 0;
        }

        .control-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }

        .control-btn.active {
          background: #7cb342;
        }

        .control-btn.inactive {
          background: #f44336;
        }

        .control-btn.recording {
          background: #ff4444;
          animation: pulse-button 2s infinite;
        }

        .control-btn.hand-raised {
          background: #9c27b0;
          animation: pulse-hand 2s infinite;
        }

        .control-btn:hover {
          transform: scale(1.05);
        }

        @keyframes pulse-hand {
          0%, 100% { 
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 2px 20px rgba(156, 39, 176, 0.6);
            transform: scale(1.05);
          }
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes pulse-button {
          0%, 100% { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); }
          50% { box-shadow: 0 2px 20px rgba(255, 68, 68, 0.6); }
        }

        .recording-indicator {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          z-index: 10;
        }

        .recording-dot {
          width: 10px;
          height: 10px;
          background: #ff4444;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Estilos para notificaciones */
        .message-notifications {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 380px;
        }

        .notification-toast {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          padding: 1rem;
          animation: slideIn 0.3s ease-out;
          border-left: 4px solid #f44336;
        }

        .notification-toast.notification-hand {
          border-left-color: #9c27b0;
        }

        .notification-hand-title {
          color: #9c27b0 !important;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .notification-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .notification-title {
          flex: 1;
          font-weight: 600;
          font-size: 0.875rem;
          color: #f44336;
        }

        .notification-close {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .notification-close:hover {
          background: #f5f5f5;
        }

        .notification-author {
          font-size: 0.8rem;
          font-weight: 600;
          color: #222;
        }

        .notification-text {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.4;
        }

        .notification-time {
          font-size: 0.75rem;
          color: #999;
          margin-top: 0.25rem;
        }

        .info-card {
          background: #2a2a2a;
          border-radius: 15px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .info-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          margin-bottom: 0.75rem;
        }

        .info-card-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .info-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-attendance { background: #7cb342; }
        .icon-agenda { background: #ff9800; }
        .icon-word-request { background: #9c27b0; }
        .icon-connected { background: #ffd740; }
        .icon-files { background: #e91e63; }
        .icon-messages { background: #f44336; }

        .attendance-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .attendance-item {
          text-align: center;
        }

        .attendance-label {
          font-size: 0.75rem;
          color: #999;
          margin-bottom: 0.25rem;
        }

        .attendance-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .attendance-value.quorum {
          background: #7cb342;
          padding: 0.5rem;
          border-radius: 10px;
          font-size: 1rem;
        }

        .agenda-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 0.75rem;
        }

        .agenda-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .agenda-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .agenda-details {
          flex: 1;
        }

        .agenda-title-text {
          color: #ccc;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .agenda-status {
          font-size: 0.8rem;
          color: #999;
        }

        .agenda-status.closed { color: #999; }
        .agenda-status.active { color: #7cb342; }
        .agenda-status.pending { color: #999; }

        .voting-options {
          margin-top: 0.75rem;
        }

        .voting-label {
          color: #999;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
        }

        .option-radio {
          width: 20px;
          height: 20px;
          border: 2px solid #666;
          border-radius: 50%;
          position: relative;
        }

        .option-radio.selected {
          border-color: #ff9800;
          background: rgba(255, 152, 0, 0.2);
        }

        .option-radio.selected::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background: #ff9800;
          border-radius: 50%;
        }

        .option-name {
          flex: 1;
          color: white;
          font-size: 0.875rem;
        }

        .option-votes {
          color: #999;
          font-size: 0.875rem;
          min-width: 30px;
          text-align: right;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }

        .btn-vote {
          flex: 1;
          background: #666;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-vote:hover {
          background: #777;
        }

        .btn-view {
          flex: 1;
          background: #ff9800;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-view:hover {
          background: #fb8c00;
        }

        .word-request-item,
        .connected-item,
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin-bottom: 0.5rem;
        }

        .word-request-info,
        .connected-info,
        .file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .word-request-avatar,
        .connected-avatar {
          width: 44px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .word-request-avatar {
          background: #9c27b0;
        }

        .connected-avatar {
          background: #ffd740;
          color: #333;
        }

        .word-request-name,
        .connected-name,
        .file-name {
          color: white;
          font-size: 0.875rem;
        }

        .connected-status {
          display: flex;
          gap: 0.5rem;
        }

        .status-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #555;
          transition: all 0.2s;
        }

        .status-icon.active {
          background: #7cb342;
        }

        .status-icon:hover {
          transform: scale(1.1);
        }

        .file-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #555;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-actions {
          display: flex;
          gap: 0.5rem;
        }

        .file-action-btn,
        .word-request-action {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: #e91e63;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .word-request-action {
          background: #9c27b0;
        }

        .word-request-time {
          color: #999;
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .no-requests {
          text-align: center;
          color: #999;
          padding: 1.5rem;
          font-size: 0.875rem;
        }

        .messages-container {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 0.75rem;
        }

        .message-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .message-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .message-author {
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .message-time {
          color: #999;
          font-size: 0.75rem;
        }

        .message-text {
          color: #ccc;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .message-reply {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          margin-top: 0.5rem;
        }

        .message-reply-author {
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .message-reply-text {
          color: #999;
          font-size: 0.75rem;
        }

        .message-input-container {
          display: flex;
          gap: 0.75rem;
        }

        .message-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
        }

        .message-input::placeholder {
          color: #999;
        }

        .message-send-btn {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: #f44336;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .message-send-btn:hover {
          background: #e53935;
          transform: scale(1.05);
        }

        .message-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile: mostrar attendance card, ocultar desktop-bottom-panels */
        .mobile-attendance-card {
          display: block;
        }

        .desktop-attendance-card {
          display: none;
        }

        .desktop-bottom-panels {
          display: none;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-item:hover {
          transform: translateY(-2px);
        }

        .nav-icon {
          color: #d4af6e;
        }

        .nav-label {
          font-size: 0.75rem;
          color: #666;
        }

        /* MODAL DE VOTAR (el original) */
        .vote-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .vote-modal {
          background: #fff;
          width: 520px;
          max-width: 90%;
          border-radius: 24px;
          padding: 24px;
        }

        .vote-header h3 {
          margin-top: 10px;
          font-size: 18px;
          color: black;
        }

        .vote-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: black;
        }

        .status-dot-green {
          width: 12px;
          height: 12px;
          background: #4caf50;
          border-radius: 50%;
        }

        .vote-options {
          margin-top: 20px;
        }

        .vote-option-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 10px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .vote-option-item:hover {
          background: #e8e8e8;
        }

        .vote-option-item.selected {
          background: rgba(255, 152, 0, 0.15);
          border: 2px solid #ff9800;
        }

        .vote-radio {
          width: 20px;
          height: 20px;
          border: 2px solid #999;
          border-radius: 50%;
          position: relative;
        }

        .vote-radio.selected {
          border-color: #ff9800;
        }

        .vote-radio.selected::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background: #ff9800;
          border-radius: 50%;
        }

        .vote-option-name {
          flex: 1;
          color: #222;
          font-weight: 500;
        }

        .vote-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }

        .vote-cancel {
          flex: 1;
          background: #e0e0e0;
          color: #333;
          border: none;
          padding: 12px;
          border-radius: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .vote-submit {
          flex: 1;
          background: #c9a461;
          color: #000;
          border: none;
          padding: 12px;
          border-radius: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        /* MODAL DE VER RESULTADOS (nuevo - estilo imagen) */
        .results-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .results-modal {
          background: #fff;
          width: 750px;
          max-width: 95%;
          border-radius: 20px;
          padding: 24px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .results-header {
          margin-bottom: 20px;
        }

        .results-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #4caf50;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .results-status-dot {
          width: 10px;
          height: 10px;
          background: #4caf50;
          border-radius: 50%;
        }

        .results-title {
          font-size: 16px;
          color: #222;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .results-stats {
          display: flex;
          gap: 12px;
          background: #66c04a;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 15px;
        }

        .results-stat {
          flex: 1;
          text-align: center;
        }

        .results-stat-label {
          font-size: 14px;
          color: white;
          margin-bottom: 4px;
        }

        .results-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: white;
        }

        .results-link {
          text-align: right;
          margin-bottom: 20px;
        }

        .results-link a {
          color: #c9a461;
          font-size: 14px;
          text-decoration: none;
          font-weight: 600;
        }

        .results-table {
          margin-bottom: 20px;
        }

        .results-table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr;
          gap: 10px;
          padding: 8px 12px;
          font-weight: 600;
          font-size: 13px;
          color: #666;
          border-bottom: 2px solid #e0e0e0;
          margin-bottom: 10px;
        }

        .results-row {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr;
          gap: 10px;
          padding: 10px 12px;
          align-items: center;
          background: #f9f9f9;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .results-option-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #222;
        }

        .results-radio-dot {
          width: 14px;
          height: 14px;
          border: 2px solid #999;
          border-radius: 50%;
        }

        .results-votes {
          font-size: 14px;
          color: #222;
          font-weight: 600;
        }

        .results-percentage {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .results-percentage-text {
          font-size: 13px;
          color: #666;
        }

        .results-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
        }

        .results-bar-fill {
          height: 100%;
          background: #c9a461;
          border-radius: 10px;
        }

        .results-tabs {
          display: flex;
          gap: 5px;
          margin-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .results-tab {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #999;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .results-tab.active {
          color: #222;
          border-bottom-color: #c9a461;
        }

        .results-matrix {
          display: grid;
          grid-template-columns: auto repeat(10, 1fr);
          gap: 2px;
          margin-bottom: 20px;
        }

        .matrix-header-cell {
          padding: 8px 4px;
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          color: #666;
        }

        .matrix-cell {
          aspect-ratio: 1;
          border: 1px solid #ddd;
          background: #fff;
        }

        .matrix-cell.voted {
          background: #c9a461;
        }

        .results-close {
          width: 100%;
          background: #5B2D4E;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
        }

        /* Desktop Styles */
        @media (min-width: 1024px) {
          .card-seccion-order .agenda-item{
            margin-top: 3rem;
            margin-bottom: 3rem;
          }

          body {
            background: #d4af6e;
          }

          .assembly-container {
            background: linear-gradient(135deg, #d4af6e 0%, #c9a461 100%);
          }

          .assembly-main {
            display: grid;
            grid-template-columns: 1fr 400px 320px;
            gap: 1.5rem;
            max-width: 1600px;
            margin: 0 auto;
            padding: 2rem;
            padding-bottom: 5rem;
          }

          .main-content {
            grid-column: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .desktop-video-wrapper {
            flex: 1;
          }

          .desktop-bottom-panels {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }

          .sidebar-content {
            grid-column: 2;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-height: calc(165vh - 120px);
            overflow-y: auto;
            padding-right: 0.5rem;
          }

          .desktop-right-column {
            grid-column: 3;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding-right: 0.5rem;
          }

          .mobile-attendance-card {
            display: none;
          }

          .desktop-attendance-card {
            display: block;
          }

          .desktop-bottom-panels {
            display: grid;
          }

          .greeting {
            display: none;
          }

          .mobile-title-section {
            display: none;
          }

          .info-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            color: #1a1a1a;
          }

          .info-card-title span {
            color: #1a1a1a;
          }

          .video-section {
            background: #000;
            border-radius: 24px;
            overflow: hidden;
            min-height: 520px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }

          .video-container {
            min-height: 520px;
          }

          .agenda-item,
          .word-request-item,
          .connected-item,
          .file-item,
          .message-item {
            background: #f5f5f5;
            color: #222;
            border-radius: 12px;
          }

          .agenda-title-text,
          .agenda-status,
          .option-name,
          .option-votes,
          .word-request-name,
          .connected-name,
          .file-name {
            color: #222;
          }

          .word-request-time {
            color: #666;
          }

          .no-requests {
            color: #999;
          }

          .option-radio {
            border-color: #999;
          }

          .option-radio.selected {
            border-color: #ff9800;
            background: rgba(255,152,0,0.15);
          }

          .btn-vote {
            background: #e0e0e0;
            color: #333;
          }

          .btn-view {
            background: #ff9800;
            color: white;
          }

          .current-speaker {
            background: white;
            color: #222;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }

          .connected-avatar {
            background: #ffd740;
            color: #333;
          }

          .status-icon {
            background: #ccc;
          }

          .status-icon.active {
            background: #7cb342;
          }

          .message-item {
            background: white;
          }

          .message-author {
            color: #222;
          }

          .message-text {
            color: #444;
          }

          .message-input {
            background: #f0f0f0;
            color: #222;
            border: 1px solid #ddd;
          }

          .message-input::placeholder {
            color: #999;
          }

          .attendance-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 7px;
          }

          .attendance-votos{
            grid-template-columns: repeat(2, 1fr);
            gap: 7px;
          }

          .attendance-label {
            color: #666;
          }

          .attendance-value {
            color: #1a1a1a;
          }
        }

        @media (max-width: 640px) {
          .greeting {
            font-size: 2rem;
          }

          .attendance-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .attendance-item:nth-child(4),
          .attendance-item:nth-child(5) {
            grid-column: span 1;
          }

          .video-container video {
            min-height: 400px;
          }

          .message-notifications {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
          }
        }
      `}</style>

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

      <div className="text-center">
        <div className="logoWrapper">
          <LogoUsuarios />
        </div>
        <div className="blockName">
          <p className="saludo">
            Hola, 
          </p>
          <strong className={styles.saludoName}>Andrés</strong>
        </div>
      </div>

      <div className="assembly-main">
        {/* COLUMNA IZQUIERDA - Video + Archivos + Mensajes */}
        <div className="main-content">
          <h1 className="greeting">Hola, Felipe</h1>
          <div className="text-center mobile-title-section">
            <p className="assembly-title">
              Primera Asamblea General 2026 Conjunto Los Robles
            </p>
            <p className="assembly-subtitle">Conectando PH</p>
          </div>

          <div className="desktop-video-wrapper">
            <div className="video-section">
              <div className="current-speaker">
                Amelia Diaz, apto 505, torre B
              </div>

              <RecordingIndicator />

              <div className="video-container">
                {mainVideoTrack && (
                  <VideoTrack
                    trackRef={mainVideoTrack}
                    className="livekit-video-track"
                  />
                )}
                {tracks
                  .filter((track) => track.source === Track.Source.Microphone)
                  .map((track) => (
                    <AudioTrack key={track.participant.identity} trackRef={track} />
                  ))}
              </div>

              <div className="video-controls">
                <button
                  className={`control-btn ${isCameraOn ? "active" : "inactive"}`}
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
                  className={`control-btn ${isMicOn ? "active" : "inactive"}`}
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
                  className="control-btn"
                  title="Compartir pantalla"
                >
                  <Monitor size={24} color="#666" />
                </button>
                <button
                  className={`control-btn ${isHandRaised ? "hand-raised" : ""}`}
                  onClick={toggleHandRaised}
                  title={isHandRaised ? "Bajar mano" : "Levantar mano"}
                >
                  <Hand size={24} color={isHandRaised ? "#fff" : "#666"} />
                </button>
                <RecordingControls />
              </div>
            </div>
          </div>

          <div className="desktop-bottom-panels">
            <div className="info-card">
              <div
                className="info-card-header"
                onClick={() => setShowSharedFiles(!showSharedFiles)}
              >
                <div className="info-card-title">
                  <div className="info-card-icon icon-files">
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
                    <div className="file-item" key={idx}>
                      <div className="file-info">
                        <div className="file-icon">
                          <FileText size={18} color="white" />
                        </div>
                        <div className="file-name">{file}</div>
                      </div>
                      <div className="file-actions">
                        <div className="file-action-btn">
                          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="file-action-btn">
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

            <div className="info-card">
              <div
                className="info-card-header"
                onClick={() => setShowMessages(!showMessages)}
              >
                <div className="info-card-title">
                  <div className="info-card-icon icon-messages">
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
                  <div className="messages-container">
                    {messages.map((msg) => (
                      <div className="message-item" key={msg.id}>
                        {msg.replyTo && (
                          <div className="message-reply">
                            <div className="message-reply-author">{msg.replyTo.author}</div>
                            <div className="message-reply-text">{msg.replyTo.text}</div>
                          </div>
                        )}
                        <div className="message-header" style={msg.replyTo ? { marginTop: "0.5rem" } : {}}>
                          <div className="message-author">{msg.author}</div>
                          <div className="message-time">{msg.time}</div>
                        </div>
                        {!msg.replyTo && (
                          <div className="message-text">{msg.text}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="message-input-container">
                    <input
                      type="text"
                      className="message-input"
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
                      className="message-send-btn"
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

          <div className="info-card mobile-attendance-card">
            <div className="info-card-header">
              <div className="info-card-title">
                <div className="info-card-icon icon-attendance">
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Asistencia</span>
              </div>
            </div>
            <div className="attendance-grid">
              <div className="attendance-item">
                <div className="attendance-label">Presentes</div>
                <div className="attendance-value">{participants.length}</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Ausentes</div>
                <div className="attendance-value">250</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Citados</div>
                <div className="attendance-value">1.000</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Coeficiente</div>
                <div className="attendance-value">65%</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Quorum</div>
                <div className="attendance-value quorum">75%</div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRO - Orden del día */}
        <div className="sidebar-content">
          <div className="info-card">
            <div
              className="info-card-header"
              onClick={() => setShowAgenda(!showAgenda)}
            >
              <div className="info-card-title">
                <div className="info-card-icon icon-agenda">
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
              <div className="card-seccion-order">
                {/* Punto 1 */}
                <div className="agenda-item">
                  <div className="agenda-header">
                    <div className="agenda-number">
                      <span style={{ fontSize: "0.75rem", color: "#fff" }}>●</span>
                    </div>
                    <div className="agenda-details">
                      <div className="agenda-title-text">PUNTO 1</div>
                      <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                        Elección secretario de la asamblea
                      </div>
                      <div className="agenda-status closed">● Votación cerrada</div>
                    </div>
                  </div>
                  <div className="voting-options">
                    <div className="voting-label">Opciones secretaria</div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">Carolina Yepes</div>
                      <div className="option-votes">57</div>
                    </div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">Francisca González</div>
                      <div className="option-votes">36</div>
                    </div>
                    <div className="option-item">
                      <div className="option-radio selected"></div>
                      <div className="option-name">Laura Díaz</div>
                      <div className="option-votes">84</div>
                    </div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">Diana Forero</div>
                      <div className="option-votes">21</div>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="btn-vote"
                      onClick={() => {
                        setCurrentVote(votesExample);
                        setShowVoteModal(true);
                      }}
                    >
                      Votar
                    </button>
                    <button
                      className="btn-view"
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
                <div className="agenda-item">
                  <div className="agenda-header">
                    <div className="agenda-number" style={{ background: "#ff9800" }}>
                      <span style={{ fontSize: "0.75rem", color: "#fff" }}>●</span>
                    </div>
                    <div className="agenda-details">
                      <div className="agenda-title-text">PUNTO 2</div>
                      <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                        Elección presidente de la asamblea
                      </div>
                      <div className="agenda-status active">● Votación en curso</div>
                    </div>
                  </div>
                  <div className="voting-options">
                    <div className="voting-label">Opciones secretaria</div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">Pepe Castro</div>
                      <div className="option-votes">57</div>
                    </div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">Andrea Vallejo</div>
                      <div className="option-votes">36</div>
                    </div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">Martha Cañón</div>
                      <div className="option-votes">84</div>
                    </div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">Beymar González</div>
                      <div className="option-votes">21</div>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="btn-vote"
                      onClick={() => {
                        setCurrentVote(votesExample);
                        setShowVoteModal(true);
                      }}
                    >
                      Votar
                    </button>
                    <button
                      className="btn-view"
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
                <div className="agenda-item">
                  <div className="agenda-header">
                    <div className="agenda-number">
                      <span style={{ fontSize: "0.75rem", color: "#fff" }}>●</span>
                    </div>
                    <div className="agenda-details">
                      <div className="agenda-title-text">PUNTO 3</div>
                      <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                        Exposición estados financieros
                      </div>
                      <div className="agenda-status pending">● Votación a realizar</div>
                    </div>
                  </div>
                  <div className="voting-options">
                    <div className="voting-label">Opciones secretaria</div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">SI</div>
                      <div className="option-votes">0</div>
                    </div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">NO</div>
                      <div className="option-votes">0</div>
                    </div>
                    <div className="option-item">
                      <div className="option-radio"></div>
                      <div className="option-name">Abstención</div>
                      <div className="option-votes">0</div>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="btn-vote"
                      onClick={() => {
                        setCurrentVote(votesExample);
                        setShowVoteModal(true);
                      }}
                    >
                      Votar
                    </button>
                    <button
                      className="btn-view"
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
        <div className="desktop-right-column">
          <div className="info-card desktop-attendance-card">
            <div className="info-card-header">
              <div className="info-card-title">
                <div className="info-card-icon icon-attendance">
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Asistencia</span>
              </div>
            </div>
            <div className="attendance-grid">
              <div className="attendance-item">
                <div className="attendance-label">Presentes</div>
                <div className="attendance-value">{participants.length}</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Ausentes</div>
                <div className="attendance-value">250</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Citados</div>
                <div className="attendance-value">1.000</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Coeficiente</div>
                <div className="attendance-value">65%</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Quorum</div>
                <div className="attendance-value quorum">75%</div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div
              className="info-card-header"
              onClick={() => setShowWordRequests(!showWordRequests)}
            >
              <div className="info-card-title">
                <div className="info-card-icon icon-word-request">
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
                  <div className="word-request-item" key={request.id}>
                    <div className="word-request-info">
                      <div className="word-request-avatar">{request.initials}</div>
                      <div className="word-request-name">
                        {request.name}, apto {request.apartment}, torre {request.tower}
                      </div>
                    </div>
                    <div className="word-request-time">{request.time}</div>
                  </div>
                ))}
                {wordRequests.length === 0 && (
                  <div className="no-requests">No hay peticiones de palabra</div>
                )}
              </div>
            )}
          </div>

          <div className="info-card">
            <div
              className="info-card-header"
              onClick={() => setShowConnected(!showConnected)}
            >
              <div className="info-card-title">
                <div className="info-card-icon icon-connected">
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
                    <div className="connected-item" key={participant.identity}>
                      <div className="connected-info">
                        <div className="connected-avatar">
                          {participant.name?.substring(0, 2).toUpperCase() || "??"}
                        </div>
                        <div className="connected-name">
                          {participant.name || participant.identity}
                          {isLocal && " (Tú)"}
                        </div>
                      </div>
                      <div className="connected-status">
                        <div 
                          className={`status-icon ${participant.isCameraEnabled ? "active" : ""}`}
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
                          className={`status-icon ${participant.isMicrophoneEnabled ? "active" : ""}`}
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
        <div className="vote-modal-overlay" onClick={() => setShowVoteModal(false)}>
          <div className="vote-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vote-header">
              <div className="vote-status">
                <span className="status-dot-green"></span>
                {currentVote.status}
              </div>
              <h3>{currentVote.title}</h3>
            </div>

            {/* SECCIÓN DE ASISTENCIA - IGUAL EN TODOS LADOS */}
            <div className="vote-attendance-section">
              <div className="vote-attendance-header">
                <span>Asistencia</span>
              </div>
              <div className="attendance-grid attendance-votos">
                <div className="attendance-item">
                  <div className="attendance-label">Coeficiente</div>
                  <div className="attendance-value">65%</div>
                </div>
                <div className="attendance-item">
                  <div className="attendance-label">Quorum</div>
                  <div className="attendance-value quorum">75%</div>
                </div>
              </div>
            </div>

            <div className="vote-options">
              {currentVote.options.map((opt: any, idx: number) => (
                <div 
                  className="vote-option-item" 
                  key={idx}
                  onClick={() => {/* Aquí manejas la selección */}}
                >
                  <div className="vote-radio"></div>
                  <div className="vote-option-name">{opt.name}</div>
                </div>
              ))}
            </div>

            <div className="vote-actions">
              <button
                className="vote-cancel"
                onClick={() => setShowVoteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="vote-submit"
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
        <div className="results-modal-overlay" onClick={() => setShowResultsModal(false)}>
          <div className="results-modal" onClick={(e) => e.stopPropagation()}>
            <div className="results-header">
              <div className="results-status">
                <span className="results-status-dot"></span>
                {currentVote.status}
              </div>
              <div className="results-title">{currentVote.title}</div>

              {/* CAMBIAR ESTA SECCIÓN POR EL FORMATO DE ASISTENCIA */}
              <div className="results-attendance-section">
                <div className="results-attendance-header">
                  <span>Asistencia</span>
                </div>
                <div className="attendance-grid">
                  <div className="attendance-item">
                    <div className="attendance-label">Presentes</div>
                    <div className="attendance-value">{participants.length}</div>
                  </div>
                  <div className="attendance-item">
                    <div className="attendance-label">Ausentes</div>
                    <div className="attendance-value">250</div>
                  </div>
                  <div className="attendance-item">
                    <div className="attendance-label">Citados</div>
                    <div className="attendance-value">1.000</div>
                  </div>
                  <div className="attendance-item">
                    <div className="attendance-label">Coeficiente</div>
                    <div className="attendance-value">65%</div>
                  </div>
                  <div className="attendance-item">
                    <div className="attendance-label">Quorum</div>
                    <div className="attendance-value quorum">75%</div>
                  </div>
                </div>
              </div>

              <div className="results-link">
                <a href="#">Ver Reporte</a>
              </div>
            </div>

            <div className="results-table">
              <div className="results-table-header">
                <span>Opción</span>
                <span># Votos</span>
                <span>% Coeficiente</span>
              </div>

              {currentVote.options.map((opt: any, idx: number) => (
                <div className="results-row" key={idx}>
                  <div className="results-option-name">
                    <span className="results-radio-dot"></span>
                    {opt.name}
                  </div>
                  <div className="results-votes">{opt.votes}</div>
                  <div className="results-percentage">
                    <span className="results-percentage-text">{opt.percent}%</span>
                    <div className="results-bar">
                      <div
                        className="results-bar-fill"
                        style={{ width: `${opt.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="results-tabs">
              <button className="results-tab active">Voto realizado</button>
              <button className="results-tab">Votos no realizados</button>
            </div>

            <div className="results-matrix">
              <div className="matrix-header-cell"></div>
              {[...Array(10)].map((_, i) => (
                <div className="matrix-header-cell" key={i}>
                  {String(i + 1).padStart(3, '0')}
                </div>
              ))}
              
              {currentVote.votesMatrix.map((row: boolean[], rowIdx: number) => (
                <>
                  <div className="matrix-header-cell" key={`row-${rowIdx}`}>
                    {String(rowIdx + 1).padStart(3, '0')}
                  </div>
                  {row.map((voted, colIdx) => (
                    <div 
                      className={`matrix-cell ${voted ? 'voted' : ''}`} 
                      key={`${rowIdx}-${colIdx}`}
                    />
                  ))}
                </>
              ))}
            </div>

            <button
              className="results-close"
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

export default function RoomPage() {
  const params = useSearchParams();

  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const r = params.get("room");
    const n = params.get("name");
    if (r && n) {
      setRoom(r);
      setName(n);
    }
  }, [params]);

  async function joinRoom() {
    if (!room || !name) {
      setError("Por favor ingresa nombre de sala y tu nombre");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/get-participant-token?room=${encodeURIComponent(room)}&username=${encodeURIComponent(name)}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al obtener el token");
      }

      setToken(data.token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al unirse a la sala"
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Unirse a Video Chat
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              joinRoom();
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre de la sala
              </label>
              <input
                placeholder="Ej: reunion-equipo"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tu nombre
              </label>
              <input
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded font-medium transition-colors"
            >
              {isLoading ? "Conectando..." : "Unirse"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      onDisconnected={() => {
        setToken("");
        setRoom("");
        setName("");
      }}
    >
      <AssemblyInterface />
    </LiveKitRoom>
  );
}