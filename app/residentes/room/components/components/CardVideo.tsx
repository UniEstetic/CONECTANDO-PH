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
  MicOff,
  MonitorUp 
} from "lucide-react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { RecordingIndicator } from "./RecordingIndicator";
import { RecordingControls } from "./RecordingControls";
import { Track } from "livekit-client";
import { getCurrentTime } from "@/app/utils/utils";
import { getAttendees } from "@/app/services/assemblies.service";
import { create, remove, upvote } from "@/app/services/qa_entries.service";

interface CardVideoProps {
  assemblyId?: string;
}

export interface CardVideoMethods {
  toggleFn: (ac: string) => void;
}

export const CardVideo = forwardRef<CardVideoMethods, CardVideoProps>((props, ref) => {
  const { data: session } = useSession();
  const assemblyId = props.assemblyId;
  const userName = session?.user?.name || '';
  const userId = session?.user?.id || '';
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isLoadingHand, setIsLoadingHand] = useState(false);
  const [currentQaEntryId, setCurrentQaEntryId] = useState<string | null>(null);
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  // Sincronizar estado inicial
  useEffect(() => {
    setIsCameraOn(localParticipant.isCameraEnabled);
    setIsMicOn(localParticipant.isMicrophoneEnabled);
  }, [localParticipant]);

  // Sincronizar estado de la mano con los metadatos reales de LiveKit al montar el componente
  useEffect(() => {
    if (!localParticipant) return;
    try {
      const meta = JSON.parse(localParticipant.metadata || '{}');
      setIsHandRaised(!!meta.handRaised);
    } catch (e) {
      setIsHandRaised(false);
    }
  }, [localParticipant]);

  // Check if user already has an active word request on mount
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!assemblyId || !userId) return;
      
      try {
        const response = await getAttendees(assemblyId);
        if (response.data && Array.isArray(response.data)) {
          // Find current user's attendance
          const userAttendance = response.data.find(
            (attendee: any) => attendee.userId === userId
          );
          if (userAttendance) {
            // Check if user already has an active request (would need to check QA entries)
            // For now, we'll track by local state
          }
        }
      } catch (err) {
        console.error('Error checking existing request:', err);
      }
    };

    checkExistingRequest();
  }, [assemblyId, userId]);

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
  const toggleHandRaised = async () => {
    if (isLoadingHand) return;
    
    // If lowering hand and we have a current QA entry, delete it
    if (isHandRaised && currentQaEntryId) {
      setIsLoadingHand(true);
      try {
        if (localParticipant) {
          const currentMeta = JSON.parse(localParticipant.metadata || '{}');
          const updatedMeta = {
            ...currentMeta,
            handRaised: false,
            handRaisedTimestamp: null
          };
          await localParticipant.setMetadata(JSON.stringify(updatedMeta));
        }
      } catch (err) {
        console.error('Error removing word request:', err);
      } finally {
        setIsLoadingHand(false);
      }
      return;
    }

    // If raising hand, create a new QA entry
    if (!assemblyId) {
      console.warn('No assembly ID available');
      return;
    }

    setIsLoadingHand(true);
    try {
      // First, get the attendees to find the current user's attendance ID
      const attendeesResponse = await getAttendees(assemblyId);
      if (!attendeesResponse.data || !Array.isArray(attendeesResponse.data)) {
        throw new Error('No se pudo obtener la lista de asistentes');
      }

      // Find current user's attendance
      const userAttendance = attendeesResponse.data.find(
        (attendee: any) => attendee.userId === userId
      );

      if (!userAttendance) {
        throw new Error('No se encontró tu registro de asistencia');
      }

      // Create a new QA entry for word request
      const qaEntry = await create({
        assembly_attendances_id: userAttendance.id,
        question_text: "Petición de palabra",
        status: "pending",
        answer_text: "",
        upvotes: 0,
      });

      if (qaEntry.data?.id) {
        setCurrentQaEntryId(qaEntry.data.id);
        setIsHandRaised(true);
     // Notificación en vivo a LiveKit sin alterar el comportamiento de arriba
        if (localParticipant) {
          const currentMeta = JSON.parse(localParticipant.metadata || '{}');
          const updatedMeta = {
            ...currentMeta,
            handRaised: true,
            handRaisedTimestamp: Date.now()
          };
          await localParticipant.setMetadata(JSON.stringify(updatedMeta));
        }
      }
    } catch (err) {
      console.error('Error creating word request:', err);
      alert(err instanceof Error ? err.message : 'Error al solicitar palabra');
    } finally {
      setIsLoadingHand(false);
    }
  };

  /*const handleShareScreen = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    // Aquí puedes conectar el stream al canal de LiveKit o mostrarlo localmente
    console.log("Pantalla compartida:", stream);
  } catch (error) {
    console.error("Error al compartir pantalla:", error);
  }
};*/


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
          title="Pantalla completa"
        >
          <Monitor size={24} color="#666" />
        </button>
        <button
          className={`${styles["control-btn"]} ${isHandRaised ? styles["hand-raised"] : ""}`}
          onClick={toggleHandRaised}
          disabled={isLoadingHand}
          title={isHandRaised ? "Bajar mano" : "Levantar mano"}
        >
          <Hand size={24} color={isHandRaised ? "#fff" : "#666"} />
        </button>
        <button className={styles["control-btn"]} 
        title="Compartir pantalla"
        >
        <MonitorUp size={20} color="black" />
        </button>
        <RecordingControls />
      </div>
    </div>
  </>);
});

CardVideo.displayName = "CardVideo";
