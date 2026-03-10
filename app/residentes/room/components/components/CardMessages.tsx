"use client";

import { MessageCircle, X } from "lucide-react";
import { Message } from "../../types";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send
} from "lucide-react";
import { getCurrentTime } from "@/app/utils/utils";

export function CardMessages() {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const [showMessages, setShowMessages] = useState(true);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<Message[]>([]);

  // Mensajes y notificaciones
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

  return (<>
      <div
        className={styles["info-card-header"]}
        onClick={() => setShowMessages(!showMessages)}
      >
        <div className={styles["info-card-title"]}>
          <div className={`${styles["info-card-icon"]} ${styles["icon-messages"]}`}>
            <MessageSquare size={20} color="white" />
          </div>
          <span>Mensajes a moderador</span>
        </div>
        {showMessages ? (
          <ChevronUp size={20} />
        ) : (
          <ChevronDown size={20} />
        )}
      </div>

      {showMessages && (
        <div>
          <div className={styles["messages-container"]}>
            {messages.map((msg) => (
              <div className={styles["message-item"]} key={msg.id}>
                {msg.replyTo && (
                  <div className={styles["message-reply"]}>
                    <div className={styles["message-reply-author"]}>{msg.replyTo.author}</div>
                    <div className={styles["message-reply-text"]}>{msg.replyTo.text}</div>
                  </div>
                )}
                <div className={styles["message-header"]} style={msg.replyTo ? { marginTop: "0.5rem" } : {}}>
                  <div className={styles["message-author"]}>{msg.author}</div>
                  <div className={styles["message-time"]}>{msg.time}</div>
                </div>
                {!msg.replyTo && (
                  <div className={styles["message-text"]}>{msg.text}</div>
                )}
              </div>
            ))}
          </div>

          <div className={styles["message-input-container"]}>
            <input
              type="text"
              className={styles["message-input"]}
              placeholder="Mensaje"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              className={styles["message-send-btn"]}
              onClick={sendMessage}
              disabled={!message.trim()}
            >
              <Send size={20} color="white" />
            </button>
          </div>
        </div>
      )}
  </>);
}
