"use client";

import {
  LiveKitRoom
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LiveKitResponse } from "@/app/types/livekit";

// Import server actions
import { getLivekitToken, getViewerToken, getHostToken } from "@/app/actions/livekit";

// Import types and components from separate files 
import { AssemblyInterface } from "./components/AssemblyInterface";

export default function RoomPage() {
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get user data from session
  const userProfile = session?.user?.userProfile;
  const userId = session?.user?.userId;
  const userName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : "";
  const userEmail = userProfile?.email || "";
  const userRoles = userProfile?.roles || [];
  const ownership = session?.user?.ownership?.[0];

  const [room, setRoom] = useState("");
  const [name, setName] = useState(userName);
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get room from URL query parameter 'r'
  useEffect(() => {
    const roomParam = params.get("r");
    if (roomParam) {
      setRoom(roomParam);
    }
  }, [params]);

  // Auto-fill name from session
  useEffect(() => {
    if (userName && !name) {
      setName(userName);
    }
  }, [userName, name]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Auto-join room when session is loaded and room is available
  useEffect(() => {
    const autoJoin = async () => {
      if (status === "authenticated" && room && userName) {
        const identity = userId || userEmail || name;
        const displayName = name || userName;

        if (!identity) {
          setError("No se pudo obtener la información del usuario.");
          return;
        }

        // Determine role based on user profile
        const userRole = userRoles.includes('admin') ? 'ADMIN' : 
                         userRoles.includes('moderator') ? 'MODERATOR' : 'USER';
        
        // Regular users can only subscribe (view-only), admins and moderators can publish
        const canPublish = userRole === 'ADMIN' || userRole === 'MODERATOR';

        setIsLoading(true);
        setError("");

        try {
          const result: LiveKitResponse = canPublish 
            ? await getLivekitToken(room, identity, displayName)
            : await getViewerToken(room, identity, displayName);

          if (!result.accessToken) {
            throw new Error("Error al obtener el token de LiveKit");
          }

          setToken(result.accessToken);
          if (result.url) {
            setServerUrl(result.url);
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Error al unirse a la sala"
          );
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    autoJoin();
  }, [status, room, userName, userId, userEmail, name, userRoles]);

  // Show loading while checking auth or joining room
  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Conectando a la sala...</p>
            {room && <p className="text-sm text-gray-500 mt-2">Sala: {room}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Show error if room is missing
  if (!room) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
            Error
          </h1>
          <p className="text-gray-600 text-center">
            No se ha especificado la sala de video.
          </p>
          <p className="text-sm text-gray-500 text-center mt-4">
            Usa el formato: /residentes/room?r=nombre-sala
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
            Error al conectarse
          </h1>
          <p className="text-gray-600 text-center mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500 text-center">
            Por favor intenta nuevamente o contacta al administrador.
          </p>
        </div>
      </div>
    );
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
            {session ? (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Conectado como:</span> {userName}
                </p>
                {ownership && (
                  <p className="text-xs text-blue-600">
                    <span className="font-medium">Propiedad:</span> {ownership.name}
                  </p>
                )}
              </div>
            ) : null}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tu nombre
              </label>
              <input
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || !!userName}
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

  if(!serverUrl || serverUrl == ""){
    return (<>serverUrl no existe.</>);
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      onDisconnected={() => {
        setToken("");
        setServerUrl("");
        setRoom("");
        setName("");
      }}
    >
      <AssemblyInterface />
    </LiveKitRoom>
  );
}