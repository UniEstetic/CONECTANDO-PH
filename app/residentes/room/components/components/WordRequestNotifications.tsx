"use client";

import { Hand, X } from "lucide-react";
import { WordRequest } from "../../types";
import styles from '@/app/ui/styles/roomResidentes.module.css';

interface WordRequestNotificationsProps {
  requests: WordRequest[];
  onClose: (id: string) => void;
}

// Componente para notificaciones de peticiones de palabra
export function WordRequestNotifications({ requests, onClose }: WordRequestNotificationsProps) {
  return (
    <div className={styles["message-notifications"]}>
      {requests.map((req) => (
        <div key={req.id} className={`${styles["notification-toast"]} ${styles["notification-hand"]}`}>
          <div className={styles["notification-content"]}>
            <div className={styles["notification-header"]}>
              <Hand size={16} color="#9c27b0" />
              <span className={`${styles["notification-title"]} ${styles["notification-hand-title"]}`}>Petición de palabra</span>
              <button 
                className={styles["notification-close"]}
                onClick={() => onClose(req.id)}
              >
                <X size={14} />
              </button>
            </div>
            <div className={styles["notification-author"]}>{req.name}</div>
            <div className={styles["notification-text"]}>Apto {req.apartment}, torre {req.tower}</div>
            <div className={styles["notification-time"]}>{req.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
