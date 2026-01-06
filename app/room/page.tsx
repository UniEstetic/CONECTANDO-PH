"use client";

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
      setError(err instanceof Error ? err.message : "Error al unirse a la sala");
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
    <div>
        <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100dvh"}}
      onDisconnected={() => {
        setToken("");
        setRoom("");
        setName("");
      }}
    >
      {/* VideoConference incluye todo: GridLayout, ParticipantTile, ControlBar, etc. */}
      <VideoConference />
    </LiveKitRoom>
    </div>
    
  );
}