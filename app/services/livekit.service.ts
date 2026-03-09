"use server";

import { apiClientSession } from "@/app/utils/apiClient";
import {
  RoomParticipant,
  CreateRoomRequest,
  RoomDetailResponse,
  ListActiveRoomsResponse,
  Room,
  DeleteRoomResponse,
  EndRoomRequest,
  EndRoomResponse,
  ListParticipantsResponse,
  KickParticipant,
  KickParticipantResponse,
  MuteParticipant,
  MuteParticipantResponse,
  RoomUpdateParticipant
} from "@/app/types/livekit";

// Generar token de acceso a sala de video
export async function getToken(
  payload: RoomParticipant,
): Promise<RoomParticipant> {
  const res = await apiClientSession(`/video/token`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al obtener token.");
  }
  return res.json() as Promise<RoomParticipant>;
}

// Generear token de solo vista (viewer)
export async function getTokenViewer(
  payload: RoomParticipant,
): Promise<RoomParticipant> {
  const res = await apiClientSession(`/video/token/viewer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    throw new Error("Error al obtener token viewer.");
  }
  return res.json() as Promise<RoomParticipant>;
}

// Generear token de host (puede publicar)
export async function getTokenHost(
  payload: RoomParticipant,
): Promise<RoomParticipant> {
  const res = await apiClientSession(`/video/token/host`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al obtener token host.");
  }
  return res.json() as Promise<RoomParticipant>;
}

// crear una sala de video
export async function createRoom(
  payload: CreateRoomRequest,
): Promise<RoomDetailResponse> {
  const res = await apiClientSession(`/video/room`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al crear sala.");
  }
  return res.json() as Promise<RoomDetailResponse>;
}

// listar todas las salas activas
export async function listRooms(): Promise<ListActiveRoomsResponse> {
  const res = await apiClientSession(`/video/rooms`);
  if (!res.ok) {
    throw new Error("Error al obtener listado de salas.");
  }
  return res.json() as Promise<ListActiveRoomsResponse>;
}

// Obtener informacion de una sala
export async function getRoom(roomName: string): Promise<Room> {
  const res = await apiClientSession(`/video/room/${roomName}`);
  if (!res.ok) {
    throw new Error("Error al obtener informsacion sala.");
  }
  return res.json() as Promise<Room>;
}

// Eliminar una sala
export async function deleteRoom(
  roomName: string,
): Promise<DeleteRoomResponse> {
  const res = await apiClientSession(`/video/room/${roomName}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Error al eliminar sala.");
  }
  return res.json() as Promise<DeleteRoomResponse>;
}

// Finalizar una sala
export async function endRoom(
  payload: EndRoomRequest,
): Promise<EndRoomResponse> {
  const res = await apiClientSession(`/video/room/end`, { method: "POST" });
  if (!res.ok) {
    throw new Error("Error al finalizar sala.");
  }
  return res.json() as Promise<EndRoomResponse>;
}

// listar de participantes de una sala
export async function listParticipantsPerRoom(
  roomName: string,
): Promise<ListParticipantsResponse> {
  const res = await apiClientSession(`/video/room/${roomName}/participants`);
  if (!res.ok) {
    throw new Error("Error al obtener listado de participantes.");
  }
  return res.json() as Promise<ListParticipantsResponse>;
}

// Expulsar un participante
export async function kickParticipants(
  payload: KickParticipant,
): Promise<KickParticipantResponse> {
  const res = await apiClientSession(`/video/participants/kick`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al explusar un participante.");
  }
  return res.json() as Promise<KickParticipantResponse>;
}

// Silenciar un participante
export async function muteParticipants(
  payload: MuteParticipant,
): Promise<MuteParticipantResponse> {
  const res = await apiClientSession(`/video/participants/mute`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al silenciar un participante.");
  }
  return res.json() as Promise<MuteParticipantResponse>;
}

// Actualizar permisos de un participante
export async function updateParticipant(
  payload: RoomUpdateParticipant,
): Promise<RoomUpdateParticipant> {
  const res = await apiClientSession(`/video/participants/mute`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al actualiar premisos del participante.");
  }
  return res.json() as Promise<RoomUpdateParticipant>;
}

// servicio para recibir eventor de livekit
export async function webhooks(): Promise<RoomUpdateParticipant> {
  const res = await apiClientSession(`/video/webhooks`, {
    method: "POST"
  });
  if (!res.ok) {
    throw new Error("Error webhook livekit.");
  }
  return res.json() as Promise<RoomUpdateParticipant>;
}
