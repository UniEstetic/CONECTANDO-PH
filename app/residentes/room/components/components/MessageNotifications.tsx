"use client";

import { MessageCircle, X } from "lucide-react";
import { Message } from "../../types";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';

interface MessageNotificationsProps {
  onClose: (id: string) => void;
}

// Función para obtener la hora actual formateada
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

// Componente para notificaciones de mensajes
export function MessageNotifications() { //{ onClose }: MessageNotificationsProps
  const { data: session } = useSession();
  const userName = session?.user?.name || '';

  // Mensajes y notificaciones
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'Laura Arciniegas, apto 205, torre 1',
      text: 'Agregar el documento de cotización para descargar',
      time: '12:30 p.m.',
      isRead: true,
    },
    {
      id: '2',
      author: 'Laura Arciniegas, apto 205, torre 1',
      text: 'Agregar el documento de cotización para descargar',
      time: '12:30 p.m.',
      isRead: true,
    },
    {
      id: '3',
      author: 'Laura Arciniegas, apto 205, torre 1',
      text: 'Agregar el documento de cotización para descargar',
      time: '12:30 p.m.',
      isRead: true,
    },
    {
      id: '4',
      author: 'Moderador',
      text: 'Ok Agregaremos el documento de cotización para descargar',
      time: '12:30 p.m.',
      isRead: true,
      isModerator: true,
      replyTo: {
        author: 'Moderador',
        text: 'Ok Agregaremos el documento de cotización para descargar'
      }
    },
  ]);
  const [notifications, setNotifications] = useState<Message[]>([]);

  // Función para enviar mensaje
  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      author: userName,
      text: message,
      time: getCurrentTime(),
      isRead: true,
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Crear notificación
    setNotifications(prev => [...prev, { ...newMessage, isRead: false }]);
    
    // Auto-eliminar notificación después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newMessage.id));
    }, 5000);

    setMessage('');
  }

  // Función para cerrar notificación
  const closeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className={styles["message-notifications"]}>
      {notifications.map((msg) => (
        <div key={msg.id} className={styles["notification-toast"]}>
          <div className={styles["notification-content"]}>
            <div className={styles["notification-header"]}>
              <MessageCircle size={16} color="#f44336" />
              <span className={styles["notification-title"]}>Nuevo mensaje</span>
              <button 
                className={styles["notification-close"]}
                onClick={() => closeNotification(msg.id)
                  // onClose(msg.id)
                }
              >
                <X size={14} />
              </button>
            </div>
            <div className={styles["notification-author"]}>{msg.author}</div>
            <div className={styles["notification-text"]}>{msg.text}</div>
            <div className={styles["notification-time"]}>{msg.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
