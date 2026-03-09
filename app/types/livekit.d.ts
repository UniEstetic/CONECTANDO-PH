import { propertiesList } from "@/app/types/definitions";

export type UserRole = "ADMIN" | "USER" | "MODERATOR";

export interface RoomParticipant {
  roomName: string;
  identity: string;
  name: string;
  role: UserRole;
  canPublish: boolean;
}

export interface VideoPermissions {
  roomJoin: boolean;
  room: string;
  canSubscribe: boolean;
  canPublish: boolean;
  canPublishData: boolean;
  canUpdateOwnMetadata: boolean;
}

export interface LiveKitResponse {
  accessToken: string;
  url: string;
  roomName: string;
}

export interface CreateRoomRequest {
  roomName: string;
  maxParticipants: number;
  emptyTimeout: number;
  metadata?: string;
}

export interface Room {
  name: string;
  numParticipants: number;
  creationTime: string;
  metadata: string;
}

export interface ListActiveRoomsResponse {
  rooms: Room[];
  total: number;
}

export interface RoomBase {
  name: string;
  numParticipants: number;
  creationTime: string;
  metadata: string;
}

export type RoomDetailResponse = RoomBase;
export type ActiveRoom = RoomBase;

export interface EndRoomRequest {
  roomName: string;
}

export interface EndRoomResponse {
  success: boolean;
}

export interface DeleteRoomResponse {
  success: boolean;
}

export interface ListParticipantsResponse {
  roomName: string;
  participants: any[];
  total: number;
}

// Expulsar participante
export interface KickParticipant {
  identity: string;
  roomName: string;
}

export interface KickParticipantResponse {
  success: string;
  message?: string;
}

// Silenciar participante
export interface MuteParticipant {
  identity: string;
  roomName: string;
  muted: boolean;
}

export interface MuteParticipantResponse {
  success: string;
  message?: string;
}
// Error autorizacion
export interface ErrorAutorization {
  message: string;
  error?: string;
  statusCode: number;
}

// Actualizar permisos participante
export interface RoomUpdateParticipant {
  roomName: string;
  identity: string;
  canPublish: boolean;
  metadata: string;
}

export interface TokenPayload {
  name: string;
  video: VideoPermissions;
  iss: string;
  exp: number;
  nbf: number;
  sub: string;
}
