"use client";

import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";

// Componente para el indicador de grabación
export function RecordingIndicator() {
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
