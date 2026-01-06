import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const room = request.nextUrl.searchParams.get("room");
    const username = request.nextUrl.searchParams.get("username");

    console.log("Request recibido:", { room, username });

    if (!room) {
      return NextResponse.json(
        { error: "Falta el parámetro 'room'" },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: "Falta el parámetro 'username'" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    console.log("Variables de entorno:", {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
    });

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { 
          error: "Servidor mal configurado - faltan credenciales de LiveKit",
          details: {
            hasApiKey: !!apiKey,
            hasApiSecret: !!apiSecret,
          }
        },
        { status: 500 }
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      ttl: "10m",
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    console.log("Token generado exitosamente");

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error al generar token:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}