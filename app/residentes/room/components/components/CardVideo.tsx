"use client";

import { MessageCircle, X } from "lucide-react";
import { Message } from "../../types";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useSession } from "next-auth/react";
import {
  useParticipants,
  useLocalParticipant,
  useTracks,
  VideoTrack,
  AudioTrack
} from "@livekit/components-react";
import {
  Video,
  Mic,
  Monitor,
  Hand,
  VideoOff,
  MicOff
} from "lucide-react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { RecordingIndicator } from "./RecordingIndicator";
import { RecordingControls } from "./RecordingControls";
import { Track } from "livekit-client";
import { getCurrentTime } from "@/app/utils/utils";

export interface CardVideoMethods {
  toggleFn: (ac: string) => void;
}

export const CardVideo = forwardRef<CardVideoMethods, {}>((props, ref) => {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  // Sincronizar estado inicial
  useEffect(() => {
    setIsCameraOn(localParticipant.isCameraEnabled);
    setIsMicOn(localParticipant.isMicrophoneEnabled);
  }, [localParticipant]);

  // Obtener el video track principal
  const mainVideoTrack = tracks.find(
    (track) => track.source === Track.Source.Camera
  );

  // Control de cámara y micrófono
  const toggleCamera = async () => {
    if (!localParticipant.permissions?.canPublish) {
      console.warn("No tienes permisos para encender la cámara.");
      return;
    }

    try {
      const nextState = !isCameraOn;
      await localParticipant.setCameraEnabled(nextState);
      setIsCameraOn(nextState);
    } catch (error) {
      console.error("Error al publicar cámara:", error);
    }
  };

  const toggleMic = async () => {
    if (!localParticipant.permissions?.canPublish) {
      console.warn("No tienes permisos para encender el micrófono.");
      return;
    }

    try {
      const nextState = !isMicOn;
      await localParticipant.setMicrophoneEnabled(nextState);
      setIsMicOn(nextState);
    } catch (error) {
      console.error("Error al publicar micrófono:", error);
    }
  };

  // Funciones uso dentro de componentes padre
  useImperativeHandle(ref, () => ({
    toggleFn(ac: string) {
      switch (ac) {
        case "mic":
          toggleMic();
          break;
        case "camera":
          toggleCamera();
          break;
      }
    }
  }));

  // Control de petición de palabra
  const toggleHandRaised = () => {
    const newHandRaisedState = !isHandRaised;
    setIsHandRaised(newHandRaisedState);

    if (newHandRaisedState) {
        // Levantar la mano
        /*const newRequest: WordRequest = {
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
        */}
  };

  return (<>
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
  </>);
});

CardVideo.displayName = "CardVideo";
