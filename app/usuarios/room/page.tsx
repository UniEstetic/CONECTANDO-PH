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
} from "lucide-react";

// Componente para el indicador de grabación
function RecordingIndicator() {
  const room = useRoomContext();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!room) return;

    // Verificar estado inicial de grabación
    setIsRecording(room.isRecording);

    // Escuchar eventos de grabación
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

  // Timer para actualizar la duración
  useEffect(() => {
    if (!isRecording || !recordingStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
      setRecordingDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, recordingStartTime]);

  // Formatear tiempo HH:MM:SS
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

// Componente para controlar la grabación (opcional)
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

// Componente interno que usa hooks de LiveKit
function AssemblyInterface() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);

  // UI State
  const [showAgenda, setShowAgenda] = useState(true);
  const [showWordRequests, setShowWordRequests] = useState(false);
  const [showConnected, setShowConnected] = useState(false);
  const [showSharedFiles, setShowSharedFiles] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [message, setMessage] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  // Control de cámara y micrófono
  const toggleCamera = () => {
    localParticipant.setCameraEnabled(!isCameraOn);
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(!isMicOn);
    setIsMicOn(!isMicOn);
  };

  // Obtener el video track principal (speaker o primer participante)
  const mainVideoTrack = tracks.find(
    (track) => track.source === Track.Source.Camera
  );

  return (
    <div className="assembly-container">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        @media screen and (max-width: 1024px){
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Outfit', sans-serif;
          background: #f5f5f5;
          overflow-x: hidden;
        }
          .assembly-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #d4af6e 0%, #c9a461 100%);
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
          z-index: 10;
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

        .control-btn:hover {
          transform: scale(1.05);
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
          width: 35px;
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
        }

        .status-icon.active {
          background: #7cb342;
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

        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 1rem;
          display: flex;
          justify-content: space-around;
          box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
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

        }
        

        @media (min-width: 1024px) {
          .assembly-main {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 1.5rem;
            max-width: 1400px;
            margin: 0 auto;
          }

          .main-content {
            grid-column: 1;
          }

          .sidebar-content {
            grid-column: 2;
          }

          .bottom-nav {
            display: none;
          }

          .video-section {
            min-height: 500px;
          }

          .video-container {
            min-height: 500px;
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
        }
      `}</style>

      <div className="text-center">
        <div className="assembly-header">
          <div className="logo-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="5" height="18" />
              <rect x="10" y="8" width="5" height="13" />
              <rect x="17" y="5" width="5" height="16" />
            </svg>
          </div>
          <div>
            <span className="logo-text">CONECTANDO </span>
            <span className="logo-text logo-ph">PH</span>
          </div>
        </div>
      </div>

      <div className="assembly-main">
        <div className="main-content">
          <h1 className="greeting">Hola, Felipe</h1>
          <div className="text-center">
            <p className="assembly-title">
              Primera Asamblea General 2026 Conjunto Los Robles
            </p>
            <p className="assembly-subtitle">Conectando PH</p>
          </div>

          {/* Video Section with LiveKit */}
          <div className="video-section">
            <div className="current-speaker">
              Amelia Diaz, apto 505, torre B
            </div>

            {/* Indicador de grabación dinámico */}
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
              >
                {isMicOn ? (
                  <Mic size={24} color="#fff" />
                ) : (
                  <MicOff size={24} color="#fff" />
                )}
              </button>
              <button className="control-btn">
                <Monitor size={24} color="#666" />
              </button>
              {/* Botón para controlar la grabación */}
              <RecordingControls />
            </div>
          </div>

          {/* Attendance Card */}
          <div className="info-card">
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

        <div className="sidebar-content">
          {/* Orden del día */}
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
                <ChevronUp size={20} color="white" />
              ) : (
                <ChevronDown size={20} color="white" />
              )}
            </div>

            {showAgenda && (
              <div>
                {/* Punto 1 */}
                <div className="agenda-item">
                  <div className="agenda-header">
                    <div className="agenda-number">
                      <span style={{ fontSize: "0.75rem", color: "#fff" }}>●</span>
                    </div>
                    <div className="agenda-details">
                      <div className="agenda-title-text">PUNTO 1</div>
                      <div style={{ color: "#ccc", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
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
                    <button className="btn-vote">Votar</button>
                    <button className="btn-view">Ver votos</button>
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
                      <div style={{ color: "#ccc", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
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
                    <button className="btn-vote">Votar</button>
                    <button className="btn-view">Ver votos</button>
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
                      <div style={{ color: "#ccc", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
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
                    <button className="btn-vote">Votar</button>
                    <button className="btn-view">Ver votos</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Petición de palabra */}
          <div className="info-card">
            <div
              className="info-card-header"
              onClick={() => setShowWordRequests(!showWordRequests)}
            >
              <div className="info-card-title">
                <div className="info-card-icon icon-word-request">
                  <Hand size={20} color="white" />
                </div>
                <span>Petición de palabra (4)</span>
              </div>
              {showWordRequests ? (
                <ChevronUp size={20} color="white" />
              ) : (
                <ChevronDown size={20} color="white" />
              )}
            </div>

            {showWordRequests && (
              <div>
                <div className="word-request-item">
                  <div className="word-request-info">
                    <div className="word-request-avatar">RP</div>
                    <div className="word-request-name">Rodrigo Pérez, apto 501, torre 6</div>
                  </div>
                  <div className="word-request-action">
                    <Hand size={18} color="white" />
                  </div>
                </div>
                <div className="word-request-item">
                  <div className="word-request-info">
                    <div className="word-request-avatar">CL</div>
                    <div className="word-request-name">Claudia López, apto 303, torre 2</div>
                  </div>
                  <div className="word-request-action">
                    <Hand size={18} color="white" />
                  </div>
                </div>
                <div className="word-request-item">
                  <div className="word-request-info">
                    <div className="word-request-avatar">LA</div>
                    <div className="word-request-name">Laura Arciniegas, apto 205, torre 1</div>
                  </div>
                  <div className="word-request-action">
                    <Hand size={18} color="white" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actualmente conectados */}
          <div className="info-card">
            <div
              className="info-card-header"
              onClick={() => setShowConnected(!showConnected)}
            >
              <div className="info-card-title">
                <div className="info-card-icon icon-connected">
                  <Users size={20} color="#333" />
                </div>
                <span>Actualmente conectados</span>
              </div>
              {showConnected ? (
                <ChevronUp size={20} color="white" />
              ) : (
                <ChevronDown size={20} color="white" />
              )}
            </div>

            {showConnected && (
              <div>
                {participants.map((participant) => (
                  <div className="connected-item" key={participant.identity}>
                    <div className="connected-info">
                      <div className="connected-avatar">
                        {participant.name?.substring(0, 2).toUpperCase() || "??"}
                      </div>
                      <div className="connected-name">{participant.name || participant.identity}</div>
                    </div>
                    <div className="connected-status">
                      <div className={`status-icon ${participant.isCameraEnabled ? "active" : ""}`}>
                        <Video size={14} color="white" />
                      </div>
                      <div className={`status-icon ${participant.isMicrophoneEnabled ? "active" : ""}`}>
                        <Mic size={14} color="white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archivos compartidos */}
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
                <ChevronUp size={20} color="white" />
              ) : (
                <ChevronDown size={20} color="white" />
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

          {/* Mensajes a moderador */}
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
                <ChevronUp size={20} color="white" />
              ) : (
                <ChevronDown size={20} color="white" />
              )}
            </div>

            {showMessages && (
              <div>
                <div className="messages-container">
                  <div className="message-item">
                    <div className="message-header">
                      <div className="message-author">Laura Arciniegas, apto 205, torre 1</div>
                      <div className="message-time">Visto 12:30 p.m.</div>
                    </div>
                    <div className="message-text">
                      Agregar el documento de cotización para descargar
                    </div>
                  </div>

                  <div className="message-item">
                    <div className="message-header">
                      <div className="message-author">Laura Arciniegas, apto 205, torre 1</div>
                      <div className="message-time">Visto 12:30 p.m.</div>
                    </div>
                    <div className="message-text">
                      Agregar el documento de cotización para descargar
                    </div>
                  </div>

                  <div className="message-item">
                    <div className="message-header">
                      <div className="message-author">Laura Arciniegas, apto 205, torre 1</div>
                      <div className="message-time">Visto 12:30 p.m.</div>
                    </div>
                    <div className="message-text">
                      Agregar el documento de cotización para descargar
                    </div>
                  </div>

                  <div className="message-item">
                    <div className="message-reply">
                      <div className="message-reply-author">Moderador</div>
                      <div className="message-reply-text">
                        Ok Agregaremos el documento de cotización para descargar
                      </div>
                    </div>
                    <div className="message-header" style={{ marginTop: "0.5rem" }}>
                      <div className="message-author">Moderador</div>
                      <div className="message-time">12:30 p.m.</div>
                    </div>
                  </div>
                </div>

                <div className="message-input-container">
                  <input
                    type="text"
                    className="message-input"
                    placeholder="Mensaje"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button className="message-send-btn">
                    <Send size={20} color="white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item">
          <Home className="nav-icon" size={24} />
          <div className="nav-label">Inicio</div>
        </div>
        <div className="nav-item">
          <Bell className="nav-icon" size={24} />
          <div className="nav-label">Notificaciones</div>
        </div>
        <div className="nav-item">
          <MessageCircle className="nav-icon" size={24} />
          <div className="nav-label">WhatsApp</div>
        </div>
        <div className="nav-item">
          <HelpCircle className="nav-icon" size={24} />
          <div className="nav-label">Ayuda</div>
        </div>
        <div className="nav-item">
          <User className="nav-icon" size={24} />
          <div className="nav-label">Perfil</div>
        </div>
      </div>
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