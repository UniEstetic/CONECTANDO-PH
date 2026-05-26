"use client";

import { MessageCircle, X } from "lucide-react";
import { Message } from "../../types";
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
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
import { getAttendees, getCited } from "@/app/services/assemblies.service";
import { create as createAttendance } from "@/app/services/assembly-attendances.service";
import { create, getActiveByAssembly, remove, update } from "@/app/services/qa_entries.service";

interface CardVideoProps {
  assemblyId?: string;
  onWordRequestChanged?: () => void;
}

export interface CardVideoMethods {
  toggleFn: (ac: string) => void;
}

export const CardVideo = forwardRef<CardVideoMethods, CardVideoProps>((props, ref) => {
  const { data: session } = useSession();
  const assemblyId = props.assemblyId;
  const onWordRequestChanged = props.onWordRequestChanged;
  const userName = session?.user?.name || '';
  const userId = session?.user?.id || '';
  const userEmail = session?.user?.email || '';
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isLoadingHand, setIsLoadingHand] = useState(false);
  const [currentQaEntryId, setCurrentQaEntryId] = useState<string | null>(null);
  const [currentAttendanceId, setCurrentAttendanceId] = useState<string | null>(null);
  const handActionLockRef = useRef(false);
  const currentQaEntryIdRef = useRef<string | null>(null);
  const currentAttendanceIdRef = useRef<string | null>(null);
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  const FALLBACK_PROXY_FILE_ID = '00000000-0000-0000-0000-000000000000';

  const normalizeText = (value: string): string => String(value || '').trim().toLowerCase();

  const getPersonId = (item: any): string => String(
    item?.userId ||
    item?.userid ||
    item?.user_id ||
    item?.user?.id ||
    item?.unit_assignment?.user?.id ||
    ''
  );

  const getPersonEmail = (item: any): string => String(
    item?.email ||
    item?.user_email ||
    item?.user?.email ||
    item?.unit_assignment?.user?.email ||
    ''
  );

  const getPersonName = (item: any): string => {
    const firstName = String(
      item?.first_name ||
      item?.user_first_name ||
      item?.user?.first_name ||
      item?.unit_assignment?.user?.first_name ||
      ''
    );
    const lastName = String(
      item?.last_name ||
      item?.user_last_name ||
      item?.user?.last_name ||
      item?.unit_assignment?.user?.last_name ||
      ''
    );
    return `${firstName} ${lastName}`.trim();
  };

  const matchesCurrentUser = (item: any): boolean => {
    const sameById = getPersonId(item) && userId && getPersonId(item) === String(userId);
    const sameByEmail = normalizeText(getPersonEmail(item)) && normalizeText(userEmail) && normalizeText(getPersonEmail(item)) === normalizeText(userEmail);
    const sameByName = normalizeText(getPersonName(item)) && normalizeText(userName) && normalizeText(getPersonName(item)) === normalizeText(userName);
    return Boolean(sameById || sameByEmail || sameByName);
  };

  const getAttendanceId = (item: any): string => String(
    item?.id ||
    item?.assembly_attendance_id ||
    item?.assemblyAttendanceId ||
    item?.assembly_attendances_id ||
    item?.attendance_id ||
    ''
  );

  const getEntryAttendanceId = (item: any): string => String(
    item?.assembly_attendances_id ||
    item?.assembly_attendance_id ||
    item?.assemblyAttendanceId ||
    item?.attendance_id ||
    ''
  );

  const getEntryAuthorId = (item: any): string => String(
    item?.authorId ||
    item?.author_id ||
    item?.user_id ||
    item?.userId ||
    ''
  );

  const getQaEntryId = (item: any): string => String(
    item?.id ||
    item?.qa_entry_id ||
    item?.question_id ||
    ''
  );

  const getUnitAssignmentId = (item: any): string => String(
    item?.unit_assignments_id ||
    item?.unitAssignmentId ||
    item?.ua_id ||
    ''
  );

  const isWordRequestEntry = (entry: any): boolean => {
    const text = String(entry?.text || entry?.question_text || '').trim();
    const normalized = normalizeText(text);
    return normalized === 'petición de palabra' || normalized === 'peticion de palabra';
  };

  const isActiveWordRequestEntry = (entry: any): boolean => {
    if (!isWordRequestEntry(entry)) return false;

    const status = normalizeText(String(entry?.status || 'pending'));
    const inactiveStatuses = new Set([
      'rejected',
      'removed',
      'deleted',
      'resolved',
      'answered',
      'cancelled',
      'canceled',
      'inactive',
      'closed',
    ]);

    return !inactiveStatuses.has(status);
  };

  const findExistingWordRequests = async (attendanceId: string): Promise<any[]> => {
    if (!assemblyId || !attendanceId) return [];

    const activeResponse = await getActiveByAssembly(assemblyId);
    const activeEntries = Array.isArray(activeResponse?.data) ? activeResponse.data : [];

    const result = activeEntries.filter((entry: any) => {
      const entryAttendanceId = getEntryAttendanceId(entry);
      const entryAuthorId = getEntryAuthorId(entry);
      const sameAttendance = Boolean(entryAttendanceId) && entryAttendanceId === attendanceId;
      const sameAuthor = Boolean(entryAuthorId) && Boolean(userId) && entryAuthorId === String(userId);
      return (sameAttendance || sameAuthor) && isActiveWordRequestEntry(entry);
    });

    return result;
  };

  const removeWordRequestsForAttendance = async (
    attendanceId: string,
    initialIds: string[] = []
  ): Promise<void> => {
    const firstBatch = Array.from(new Set(initialIds.filter(Boolean)));

    const deactivateById = async (id: string) => {
      try {
        await remove(String(id));
      } catch {
        // Fallback when backend does soft-state transitions instead of hard delete.
        await update(String(id), { status: 'rejected' } as any);
      }
    };

    if (firstBatch.length > 0) {
      await Promise.all(firstBatch.map((id) => deactivateById(id)));
    }

    const remaining = await findExistingWordRequests(attendanceId);
    const remainingIds = remaining
      .map((item: any) => getQaEntryId(item))
      .filter(Boolean);

    if (remainingIds.length > 0) {
      await Promise.all(remainingIds.map((id) => deactivateById(id)));
    }
  };

  useEffect(() => {
    currentQaEntryIdRef.current = currentQaEntryId;
  }, [currentQaEntryId]);

  useEffect(() => {
    currentAttendanceIdRef.current = currentAttendanceId;
  }, [currentAttendanceId]);

  const resolveAttendanceId = async (): Promise<string> => {
    if (!assemblyId) return '';
    if (currentAttendanceId) return currentAttendanceId;

    const attendeesResponse = await getAttendees(assemblyId);
    const attendees = Array.isArray(attendeesResponse?.data) ? attendeesResponse.data : [];
    const matchedAttendee = attendees.find((item: any) => matchesCurrentUser(item));

    if (matchedAttendee) {
      const existingAttendanceId = getAttendanceId(matchedAttendee);
      if (existingAttendanceId) {
        setCurrentAttendanceId(existingAttendanceId);
        return existingAttendanceId;
      }
    }

    const citedResponse = await getCited(assemblyId);
    const cited = Array.isArray(citedResponse?.data) ? citedResponse.data : [];
    const matchedCited = cited.find((item: any) => matchesCurrentUser(item));

    if (!matchedCited) return '';

    const unitAssignmentId = getUnitAssignmentId(matchedCited);
    if (!unitAssignmentId) return '';

    const createdAttendance = await createAttendance({
      assemblies_id: assemblyId,
      unit_assignments_id: unitAssignmentId,
      arrival_at: new Date().toISOString(),
      is_present: true,
      proxy_file_id: FALLBACK_PROXY_FILE_ID,
      notes: 'Registro automático para petición de palabra',
    });

    const createdAttendanceId = String(createdAttendance?.data?.id || '');
    if (createdAttendanceId) {
      setCurrentAttendanceId(createdAttendanceId);
    }

    return createdAttendanceId;
  };

  const syncHandRaisedState = async () => {
    if (!assemblyId) return;

    try {
      const attendanceId = await resolveAttendanceId();
      if (!attendanceId) {
        setCurrentQaEntryId(null);
        setIsHandRaised(false);
        return;
      }

      const existingRequests = await findExistingWordRequests(attendanceId);
      const existingRequestId = getQaEntryId(existingRequests[0]);

      if (existingRequestId) {
        setCurrentQaEntryId(existingRequestId);
        setIsHandRaised(true);
      } else {
        setCurrentQaEntryId(null);
        setIsHandRaised(false);
      }
    } catch (err) {
      console.error('Error syncing hand raised state:', err);
    }
  };

  // Sincronizar estado inicial
  useEffect(() => {
    setIsCameraOn(localParticipant.isCameraEnabled);
    setIsMicOn(localParticipant.isMicrophoneEnabled);
  }, [localParticipant]);

  // Check if user already has an active word request on mount/user changes.
  useEffect(() => {
    if (!assemblyId) return;
    void syncHandRaisedState();
  }, [assemblyId, userId, userEmail, userName]);

  // Keep the hand button synchronized with backend state.
  useEffect(() => {
    if (!assemblyId) return;

    const interval = setInterval(() => {
      if (handActionLockRef.current || isLoadingHand) return;
      if (document.visibilityState !== 'visible') return;
      void syncHandRaisedState();
    }, 5000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncHandRaisedState();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [assemblyId, isLoadingHand]);

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
    if (isLoadingHand || handActionLockRef.current) return;
    if (!assemblyId) {
      console.warn('No assembly ID available');
      return;
    }

    handActionLockRef.current = true;
    setIsLoadingHand(true);
    try {
      const attendanceId = await resolveAttendanceId();
      if (!attendanceId) {
        throw new Error('No se encontró tu registro de asistencia');
      }

      const existingRequests = await findExistingWordRequests(attendanceId);
      const existingRequestIds = existingRequests
        .map((item: any) => getQaEntryId(item))
        .filter(Boolean);
      const existingRequestId = existingRequestIds[0] || '';

      if (isHandRaised) {
        const idsToRemove = Array.from(new Set([
          ...(currentQaEntryId ? [currentQaEntryId] : []),
          ...existingRequestIds,
        ])).filter(Boolean);

        if (idsToRemove.length === 0) {
          setCurrentQaEntryId(null);
          setIsHandRaised(false);
          onWordRequestChanged?.();
          return;
        }

        await removeWordRequestsForAttendance(attendanceId, idsToRemove);
        await syncHandRaisedState();
        onWordRequestChanged?.();
        return;
      }

      if (existingRequestId) {
        setCurrentQaEntryId(existingRequestId);
        setIsHandRaised(true);
        onWordRequestChanged?.();
        return;
      }

      // Create a new QA entry for word request
      const qaEntry = await create({
        assembly_attendances_id: attendanceId,
        question_text: "Petición de palabra",
      });

      const createdEntryId = getQaEntryId((qaEntry as any)?.data);
      if (createdEntryId) {
        setCurrentQaEntryId(createdEntryId);
        setIsHandRaised(true);
        onWordRequestChanged?.();
      }
    } catch (err) {
      console.error('Error toggling word request:', err);
      alert(err instanceof Error ? err.message : 'Error al actualizar petición de palabra');
    } finally {
      setIsLoadingHand(false);
      handActionLockRef.current = false;
    }
  };

  // Si el usuario sale de la sala, limpiamos su petición de palabra para evitar estados "pegados".
  useEffect(() => {
    return () => {
      if (!assemblyId || handActionLockRef.current) return;

      const cleanup = async () => {
        try {
          let requestId = currentQaEntryIdRef.current;
          const attendanceId = currentAttendanceIdRef.current || (await resolveAttendanceId());

          if (!requestId && attendanceId) {
            const existingRequests = await findExistingWordRequests(attendanceId);
            requestId = getQaEntryId(existingRequests[0]);
          }

          if (requestId) {
            await remove(requestId);
          }
        } catch (err) {
          console.error('Error cleaning word request on leave:', err);
        }
      };

      void cleanup();
    };
  }, [assemblyId]);

  /*const handleShareScreen = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    // Aquí puedes conectar el stream al canal de LiveKit o mostrarlo localmente
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
