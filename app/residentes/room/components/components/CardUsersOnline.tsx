"use client";
import {
  useParticipants,
  useLocalParticipant
} from "@livekit/components-react";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Video,
  Mic,
  ChevronDown,
  ChevronUp,
  Users,
  VideoOff,
  MicOff
} from "lucide-react";
import styles from '@/app/ui/styles/roomResidentes.module.css';

interface FnToggleVideoMethods {
  toggleCamera?: () => void;
  toggleMic?: () => void;
}

export function CardUsersOnline({toggleCamera, toggleMic} : FnToggleVideoMethods) {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const participants = useParticipants();
  const [showConnected, setShowConnected] = useState(true);
  const { localParticipant } = useLocalParticipant();

  return (<>
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
                    if (isLocal && toggleCamera) {
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
                    if (isLocal && toggleMic) {
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
  </>);
}
