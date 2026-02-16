"use client";

import { Hand, X } from "lucide-react";
import { WordRequest } from "./types";

interface WordRequestNotificationsProps {
  requests: WordRequest[];
  onClose: (id: string) => void;
}

// Componente para notificaciones de peticiones de palabra
export function WordRequestNotifications({ requests, onClose }: WordRequestNotificationsProps) {
  return (
    <div className="message-notifications">
      {requests.map((req) => (
        <div key={req.id} className="notification-toast notification-hand">
          <div className="notification-content">
            <div className="notification-header">
              <Hand size={16} color="#9c27b0" />
              <span className="notification-title notification-hand-title">Petición de palabra</span>
              <button 
                className="notification-close"
                onClick={() => onClose(req.id)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="notification-author">{req.name}</div>
            <div className="notification-text">Apto {req.apartment}, torre {req.tower}</div>
            <div className="notification-time">{req.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
