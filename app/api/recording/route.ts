import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room, action, egressId } = body;

    console.log("Recording request:", { room, action });

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: "Config error" }, { status: 500 });
    }

    // Usar RoomServiceClient para cambiar el estado de grabación de la sala
    const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);

    if (action === "start") {
      if (!room) {
        return NextResponse.json({ error: "Falta 'room'" }, { status: 400 });
      }

      console.log("▶️ Activando estado de grabación para:", room);

      // Esto activará el indicador de grabación en los clientes
      await roomService.updateRoomMetadata(room, JSON.stringify({
        recording: true,
        recordingStartTime: Date.now()
      }));

      // Generar un ID temporal
      const tempEgressId = `temp-${Date.now()}`;

      return NextResponse.json({ 
        success: true, 
        egressId: tempEgressId,
        message: "Estado de grabación activado (temporal - configura almacenamiento para grabación real)",
        warning: "Configura Egress Storage en LiveKit Cloud para grabaciones reales"
      });

    } else if (action === "stop") {
      console.log("⏹️ Desactivando estado de grabación");

      await roomService.updateRoomMetadata(room, JSON.stringify({
        recording: false
      }));
      
      return NextResponse.json({ 
        success: true,
        message: "Estado de grabación desactivado"
      });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { 
        error: "Error al controlar grabación",
        message: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}