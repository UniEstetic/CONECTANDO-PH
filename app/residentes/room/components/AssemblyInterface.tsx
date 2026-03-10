"use client";

import LogoUsuarios from '@/app/components/logo_usuarios';
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";

// Import types and components from separate files 
import { WordRequest } from "../types";
import { MessageNotifications } from "./components/MessageNotifications";
import { WordRequestNotifications } from "./components/WordRequestNotifications";
import { CardMessages } from "@/app/residentes/room/components/components/CardMessages";
import { CardSharedFiles } from "@/app/residentes/room/components/components/CardSharedFiles";
import { CardVideo, CardVideoMethods } from "@/app/residentes/room/components/components/CardVideo";
import { CardAttendance } from "@/app/residentes/room/components/components/CardAttendance";
import { CardRequestToSpeak } from "@/app/residentes/room/components/components/CardRequestToSpeak";
import { CardUsersOnline } from "@/app/residentes/room/components/components/CardUsersOnline";
import { CardAgenda } from "@/app/residentes/room/components/components/CardAgenda";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Conectando PH";

export function AssemblyInterface() {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const assamblyName = "Primera Asamblea General 2026 Conjunto Los Robles";
  const cardVideoMethodsRef = useRef<CardVideoMethods>(null);
  const [wordRequestNotifications, setWordRequestNotifications] = useState<WordRequest[]>([]);

  // Función para cerrar notificación de petición de palabra
  const closeWordRequestNotification = (id: string) => {
    setWordRequestNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Control de cámara y micrófono
  const toggleCamera = () => {
    cardVideoMethodsRef.current?.toggleFn('camera');
  };

  const toggleMic = () => {
    cardVideoMethodsRef.current?.toggleFn('mic');
  };

  return (
    <div className={styles["assembly_container"]}>
      {/* Notificaciones de mensajes */}
      <MessageNotifications />

      {/* Notificaciones de peticiones de palabra */}
      <WordRequestNotifications 
        requests={wordRequestNotifications}
        onClose={closeWordRequestNotification}
      />

      <div className={styles["text-center"]}>
        <div className={styles["logoWrapper"]}>
          <LogoUsuarios />
        </div>
        <div className={styles["blockName"]}>
          <p className="saludo">
            Hola, 
          </p>
          <strong className={styles.saludoName}>{userName}</strong>
        </div>
      </div>

      <div className={styles["assembly-main"]}>
        {/* COLUMNA IZQUIERDA - Video + Archivos + Mensajes */}
        <div className={styles["main-content"]}>
          <div className={`${styles["text-center"]} ${styles["mobile-title-section"]}`}>
            <p className={styles["assembly-title"]}>
              {assamblyName}
            </p>
            <p className={styles["assembly-subtitle"]}>{appName}</p>
          </div>

          <div className={styles["desktop-video-wrapper"]}>
            <CardVideo ref={cardVideoMethodsRef}></CardVideo>
          </div>

          <div className={styles["desktop-bottom-panels"]}>
            <div className={styles["info-card"]}>
              <CardSharedFiles></CardSharedFiles>
            </div>
            <div className={styles["info-card"]}>
              <CardMessages></CardMessages>
            </div>
          </div>
          
          <div className={`${styles["info-card"]} ${styles["mobile-attendance-card"]}`}>
            <CardAttendance></CardAttendance>
          </div>
        </div>

        {/* COLUMNA CENTRO - Orden del día */}
        <CardAgenda></CardAgenda>

        {/* COLUMNA DERECHA */}
        <div className={styles["desktop-right-column"]}>
          <div className={`${styles["info-card"]}`}>
            <CardAttendance></CardAttendance>
          </div>

          <div className={styles["info-card"]}>
            <CardRequestToSpeak></CardRequestToSpeak>
          </div>

          <div className={styles["info-card"]}>
            <CardUsersOnline toggleCamera={toggleCamera} toggleMic={toggleMic}></CardUsersOnline>
          </div>
        </div>
      </div>
    </div>
  );
}