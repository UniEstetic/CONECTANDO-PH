"use client";

import {
  LiveKitRoom
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LiveKitResponse } from "@/app/types/livekit";
import { Video, Calendar, Clock, Users, ArrowRight } from "lucide-react";
import styles from '@/app/ui/styles/usuarios.module.css';
import UsuariosHeader from '@/app/components/UsuariosHeader';

// Import server actions
import { getLivekitToken, getViewerToken, getHostToken } from "@/app/actions/livekit";

// Import types and components from separate files 
import { AssemblyInterface } from "./components/AssemblyInterface";
import { getByPh } from "@/app/services/assemblies.service";
import { Assembly } from "@/app/types/assemblies";
import { useProperty } from "@/app/context/PropertyContext";

export default function RoomPage() {
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedProperty, selectedPropertyId } = useProperty();

  // Get user data from session
  const userId = session?.user?.id;
  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";
  const userRoles = session?.user?.roles || [];

  const [room, setRoom] = useState("");
  const [name, setName] = useState(userName);
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for assemblies list
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [isLoadingAssemblies, setIsLoadingAssemblies] = useState(false);
  const [assembliesError, setAssembliesError] = useState("");

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

  // Load assemblies for user's PH
  useEffect(() => {
    const loadAssemblies = async () => {
      if (status !== "authenticated" || !selectedPropertyId || room) return;
      
      setIsLoadingAssemblies(true);
      setAssembliesError("");
      
      try {
        const response = await getByPh(selectedPropertyId);
        if (response.data) {
          setAssemblies(response.data);
        }
      } catch (err) {
        console.error('Error loading assemblies:', err);
        setAssembliesError("Error al cargar las asambleas");
      } finally {
        setIsLoadingAssemblies(false);
      }
    };

    loadAssemblies();
  }, [status, selectedPropertyId, room]);

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
      <div className={styles.blockResidentes}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          <div className="flex flex-col gap-4 items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Conectando a la sala...</p>
            {room && <p className="text-sm text-gray-500 mt-2">Sala: {room}</p>}
          </div>
        </main>
      </div>
    );
  }

  // Show assemblies list when no room parameter - using same layout as other resident pages
  if (!room) {
    return (
      <div className={styles.blockResidentes}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Asambleas de tu Propiedad
            </h1>
            {selectedProperty && (
              <p className="text-gray-600 mb-6">
                Propiedad: <span className="font-medium">{selectedProperty.name}</span>
              </p>
            )}
          </div>

          {isLoadingAssemblies && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {assembliesError && (
            <div className="px-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {assembliesError}
              </div>
            </div>
          )}

          {!isLoadingAssemblies && assemblies.length === 0 && (
            <div className="px-4">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">No hay asambleas programadas</h2>
                <p className="text-gray-500 mt-2">No hay asambleas disponibles para tu propiedad en este momento.</p>
              </div>
            </div>
          )}

          <section className={styles.list}>
            {assemblies.map((assembly) => (
              <div 
                key={assembly.id}
                className={`${styles.item} cursor-pointer hover:bg-blue-50`}
                onClick={() => {
                  if (assembly.livekit_room_name) {
                    router.push(`/residentes/room?r=${assembly.livekit_room_name}`);
                  }
                }}
              >
                <div className="flex-1">
                  <span className={styles.fechaResidentes}>{assembly.name}</span>
                  <div className={styles.containerRadioResidentes}>
                    <span className={styles.text}>
                      {assembly.description || 'Asambleas'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 px-4">
                    {assembly.scheduled_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(assembly.scheduled_at).toLocaleDateString('es-CO')}</span>
                      </div>
                    )}
                    {assembly.started_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(assembly.started_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>En vivo</span>
                    </div>
                  </div>
                </div>
                {assembly.livekit_room_name && (
                  <div className="flex items-center pr-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Unirse
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        </main>
      </div>
    );
  }

  // Show error if room is missing after loading
  if (error && !token) {
    return (
      <div className={styles.blockResidentes}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          <div className="flex flex-col gap-4 items-center justify-center py-12">
            <h1 className="text-2xl font-bold text-red-600">
              Error al conectarse
            </h1>
            <p className="text-gray-600 text-center">
              {error}
            </p>
            <p className="text-sm text-gray-500">
              Por favor intenta nuevamente o contacta al administrador.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={styles.blockResidentes}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          <div className="flex flex-col gap-4 items-center justify-center py-12">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Unirse a Video Chat
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col gap-4 w-full max-w-md"
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
                  {selectedProperty && (
                    <p className="text-xs text-blue-600">
                      <span className="font-medium">Propiedad:</span> {selectedProperty.name}
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
        </main>
      </div>
    );
  }

  if(!serverUrl || serverUrl == ""){
    return (
      <div className={styles.blockResidentes}>
        <main className={styles.containerResidentes}>
          <UsuariosHeader />
          <div className="p-4">serverUrl no existe.</div>
        </main>
      </div>
    );
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