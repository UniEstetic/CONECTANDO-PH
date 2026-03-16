"use client";

import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
import styles from '@/app/ui/styles/roomResidentes.module.css';

// Componente para controlar la grabación
export function RecordingControls() {
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
      className={`${styles["control-btn"]} ${isRecording ? styles["recording"] : ""}`}
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
