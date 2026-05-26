'use client';

import { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseChatSocketProps {
  assemblyId: string;
  userName: string;
  userId?: string;
  userRole?: 'participant' | 'moderator' | 'admin';
}

export interface ChatMessage {
  id: string;
  assemblyId: string;
  author: string;
  authorId?: string;
  text: string;
  time: string;
  isRead?: boolean;
  isModerator?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  replyTo?: {
    author: string;
    text: string;
  };
  answerText?: string;
  upvotes?: number;
}

// Socket server URL - defaults to NestJS backend on port 3001
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
const SOCKET_NAMESPACE = process.env.NEXT_PUBLIC_SOCKET_NAMESPACE || '/qa';

// Global socket reference for context
let globalSocket: Socket | null = null;

export function useChatSocket({ 
  assemblyId, 
  userName, 
  userId,
  userRole = 'participant' 
}: UseChatSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!assemblyId) return;

    // Create socket connection to /qa namespace
    const socket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
      query: {
        assemblyId,
        userName,
        userId: userId || '',
        userRole,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    globalSocket = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    // Listen for incoming questions
    socket.on('new_question', (question: ChatMessage) => {
      setMessages((prev) => [...prev, question]);
    });

    // Listen for question updates (approved, rejected, answered)
    socket.on('question_updated', (updatedQuestion: ChatMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedQuestion.id ? updatedQuestion : msg
        )
      );
    });

    // Listen for upvotes
    socket.on('question_upvoted', (updatedQuestion: ChatMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedQuestion.id ? { ...msg, upvotes: updatedQuestion.upvotes } : msg
        )
      );
    });

    // Listen for moderator responses
    socket.on('moderator_response', (response: ChatMessage) => {
      setMessages((prev) => [...prev, response]);
    });

    // Join assembly room
    socket.emit('join_assembly', { assemblyId, userName, userId, userRole });

    // Cleanup on unmount
    return () => {
      socket.emit('leave_assembly', { assemblyId });
      socket.disconnect();
      socketRef.current = null;
      globalSocket = null;
    };
  }, [assemblyId, userName, userId, userRole]);

  // Send question function
  const sendQuestion = useCallback(
    (text: string) => {
      if (!socketRef.current || !text.trim()) return;

      const questionPayload = {
        assemblyId,
        authorId: userId || '',
        author: userName,
        text: text.trim(),
        isPrivate: false,
      };

      // Legacy-compatible payload in case backend still reads old keys internally.
      const legacyPayload = {
        userId: userId || '',
        userName,
        questionText: text.trim(),
      };

      // Emit to server
      socketRef.current.emit('send_question', {
        ...questionPayload,
        ...legacyPayload,
      });
    },
    [assemblyId, userName, userId]
  );

  // Upvote question function
  const upvoteQuestion = useCallback(
    (questionId: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit('upvote_question', { questionId, assemblyId });
    },
    [assemblyId]
  );

  // Mark question as read
  const markAsRead = useCallback(
    (questionId: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit('mark_read', { questionId, assemblyId });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === questionId ? { ...msg, isRead: true } : msg
        )
      );
    },
    [assemblyId]
  );

  return {
    messages,
    isConnected,
    error,
    sendQuestion,
    upvoteQuestion,
    markAsRead,
  };
}

// Socket context for global access
export interface SocketContextType {
  isConnected: boolean;
  emitEvent: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
      transports: ['websocket'],
      reconnection: true,
    });

    globalSocket = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
      globalSocket = null;
    };
  }, []);

  const emitEvent = useCallback((event: string, data: any) => {
    globalSocket?.emit(event, data);
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, emitEvent }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}