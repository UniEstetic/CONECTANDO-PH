"use client";

import { MessageCircle, X, ThumbsUp, Wifi, WifiOff, Send } from "lucide-react";
import { Message } from "../../types";
import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { getCurrentTime } from "@/app/utils/utils";
import { useChatSocket, ChatMessage } from '@/app/services/socket.service';
import { getActiveByAssembly, create, upvote } from '@/app/services/qa_entries.service';
import { Assembly } from "@/app/types/assemblies";

interface CardMessagesProps {
  assemblyDetails?: Assembly | null;
}

export function CardMessages({ assemblyDetails }: CardMessagesProps) {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const userId = session?.user?.userId as string || '';
  
  // Determine user role from session (default: participant)
  const userRoles = session?.user?.userProfile?.roles || [];
  const userRole = userRoles.includes('admin') ? 'admin' : 
                   userRoles.includes('moderator') ? 'moderator' : 'participant';

  const [showMessages, setShowMessages] = useState(true);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get assembly ID from details
  const assemblyId = assemblyDetails?.id || '';

  // Use socket hook for real-time communication
  const { 
    messages: socketMessages, 
    isConnected, 
    error, 
    sendQuestion,
    upvoteQuestion 
  } = useChatSocket({
    assemblyId,
    userName,
    userId,
    userRole,
  });

  // Convert ChatMessage to Message format for display
  const convertToMessage = (chatMsg: ChatMessage): Message => ({
    id: chatMsg.id,
    author: chatMsg.author,
    text: chatMsg.text,
    time: chatMsg.time,
    isRead: chatMsg.isRead,
    isModerator: chatMsg.isModerator,
    replyTo: chatMsg.replyTo ? {
      author: chatMsg.replyTo.author,
      text: chatMsg.replyTo.text
    } : undefined
  });

  // Merge socket messages with local state
  const [messages, setMessages] = useState<Message[]>([]);

  // Load initial data from REST API when assembly ID is available
  useEffect(() => {
    const loadInitialData = async () => {
      if (!assemblyId) return;
      
      setIsLoading(true);
      try {
        // Get active questions for the assembly
        const response = await getActiveByAssembly(assemblyId);
        if (response.data && response.data.length > 0) {
          const initialMessages = response.data.map((q) => ({
            id: q.id || Date.now().toString(),
            author: `Usuario ${q.assembly_attendances_id?.slice(0, 8)}`,
            text: q.question_text,
            time: new Date(q.created_at).toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isRead: false,
          }));
          setMessages(initialMessages);
        }
      } catch (err) {
        console.error('Error loading initial questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [assemblyId]);

  // Update local messages when socket messages arrive
  useEffect(() => {
    if (socketMessages.length > 0) {
      const formattedMessages = socketMessages.map(convertToMessage);
      setMessages(formattedMessages);
    }
  }, [socketMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to send question via socket and persist to backend
  const sendMessage = async () => {
    if (!message.trim() || !assemblyId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      author: userName,
      text: message,
      time: getCurrentTime(),
      isRead: true,
    };

    // Send via socket for real-time
    sendQuestion(message);

    // Also persist to backend via REST API
    try {
      await create({
        assembly_attendances_id: assemblyId,
        question_text: message,
        status: 'pending',
        answer_text: '',
        upvotes: 0,
      });
    } catch (err) {
      console.error('Error saving question to backend:', err);
    }

    // Add to local state immediately
    setMessages(prev => [...prev, newMessage]);

    // Create notification
    setNotifications(prev => [...prev, { ...newMessage, isRead: false }]);

    // Auto-eliminar notificación después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newMessage.id));
    }, 5000);

    setMessage('');
  };

  // Function to handle upvote
  const handleUpvote = (questionId: string) => {
    upvoteQuestion(questionId);
    // Also call REST API
    upvote(questionId).catch(err => console.error('Error upvoting:', err));
  };

  return (<>
      <div
        className={styles["info-card-header"]}
        onClick={() => setShowMessages(!showMessages)}
      >
        <div className={styles["info-card-title"]}>
          <div className={`${styles["info-card-icon"]} ${styles["icon-messages"]}`}>
            <MessageSquare size={20} color="white" />
          </div>
          <span>Preguntas al moderador</span>
        </div>
        {showMessages ? (
          <ChevronUp size={20} />
        ) : (
          <ChevronDown size={20} />
        )}
      </div>

      {showMessages && (
        <div>
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 text-xs ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            {isConnected ? (
              <>
                <Wifi size={14} />
                <span>En vivo</span>
              </>
            ) : (
              <>
                <WifiOff size={14} />
                <span>Sin conexión en tiempo real</span>
              </>
            )}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

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
                
                {/* Upvote button for participants */}
                {userRole !== 'admin' && userRole !== 'moderator' && (
                  <button 
                    onClick={() => handleUpvote(msg.id)}
                    className="flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ThumbsUp size={14} />
                    <span>Votar</span>
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles["message-input-container"]}>
            <input
              type="text"
              className={styles["message-input"]}
              placeholder="Escribe tu pregunta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={!assemblyId}
            />
            <button
              className={styles["message-send-btn"]}
              onClick={sendMessage}
              disabled={!message.trim() || !assemblyId}
            >
              <Send size={20} color="white" />
            </button>
          </div>
        </div>
      )}
  </>);
}
