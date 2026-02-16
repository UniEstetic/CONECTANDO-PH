"use client";

import { MessageCircle, X } from "lucide-react";
import { Message } from "./types";

interface MessageNotificationsProps {
  messages: Message[];
  onClose: (id: string) => void;
}

// Componente para notificaciones de mensajes
export function MessageNotifications({ messages, onClose }: MessageNotificationsProps) {
  return (
    <div className="message-notifications">
      {messages.map((msg) => (
        <div key={msg.id} className="notification-toast">
          <div className="notification-content">
            <div className="notification-header">
              <MessageCircle size={16} color="#f44336" />
              <span className="notification-title">Nuevo mensaje</span>
              <button 
                className="notification-close"
                onClick={() => onClose(msg.id)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="notification-author">{msg.author}</div>
            <div className="notification-text">{msg.text}</div>
            <div className="notification-time">{msg.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
