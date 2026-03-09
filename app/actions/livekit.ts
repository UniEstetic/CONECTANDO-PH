"use server";

import { getToken, getTokenViewer, getTokenHost } from "@/app/services/livekit.service";
import { RoomParticipant, LiveKitResponse } from "@/app/types/livekit";

export async function getLivekitToken(
  roomName: string, 
  identity: string, 
  name: string,
  role: "ADMIN" | "USER" | "MODERATOR" = "USER",
  canPublish: boolean = true
): Promise<LiveKitResponse> {
  const payload: RoomParticipant = {
    roomName,
    identity,
    name,
    role,
    canPublish,
  };

  const result = await getToken(payload);
  // The backend returns LiveKitResponse, cast it properly
  return result as unknown as LiveKitResponse;
}

export async function getViewerToken(roomName: string, identity: string, name: string): Promise<LiveKitResponse> {
  const payload: RoomParticipant = {
    roomName,
    identity,
    name,
    role: "USER",
    canPublish: false,
  };

  const result = await getTokenViewer(payload);
  return result as unknown as LiveKitResponse;
}

export async function getHostToken(roomName: string, identity: string, name: string): Promise<LiveKitResponse> {
  const payload: RoomParticipant = {
    roomName,
    identity,
    name,
    role: "MODERATOR",
    canPublish: true,
  };

  const result = await getTokenHost(payload);
  return result as unknown as LiveKitResponse;
}
