"use client";

import { Wifi, WifiOff, Send } from "lucide-react";
import { Message } from "../../types";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { getCurrentTime } from "@/app/utils/utils";
import { useChatSocket, ChatMessage } from '@/app/services/socket.service';
import { getByAssembly, create } from '@/app/services/qa_entries.service';
import { getAttendees, getCited } from '@/app/services/assemblies.service';
import { create as createAttendance } from '@/app/services/assembly-attendances.service';
import { Assembly } from "@/app/types/assemblies";

interface CardMessagesProps {
  assemblyDetails?: Assembly | null;
}

type InternalMessage = Message & { sortTimestamp?: number };

export function CardMessages({ assemblyDetails }: CardMessagesProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const userId = session?.user?.id || '';
  const userEmail = session?.user?.email || '';
  const displayName = userName || userEmail || 'Usuario';
  
  // Determine user role from session (default: participant)
  const userRoles = session?.user?.roles || [];
  const userRole = userRoles.includes('admin') ? 'admin' : 
                   userRoles.includes('moderator') ? 'moderator' : 'participant';

  const [showMessages, setShowMessages] = useState(true);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get assembly ID from details
  const assemblyId = assemblyDetails?.id || '';

  // Use socket hook for real-time communication
  const { 
    messages: socketMessages, 
    isConnected, 
    sendQuestion,
  } = useChatSocket({
    assemblyId,
    userName: displayName,
    userId,
    userRole,
  });

  const extractSocketText = (chatMsg: any): string => String(
    chatMsg?.text ||
    chatMsg?.question_text ||
    chatMsg?.message ||
    chatMsg?.answerText ||
    ''
  ).trim();

  const toTimestamp = (value: any): number | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.getTime();
  };

  const formatDisplayTime = (value: any): string => {
    if (!value) return getCurrentTime();

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return String(value);
  };

  const getSocketMessageId = (chatMsg: any): string => {
    const explicitId = String(
      chatMsg?.id ||
      chatMsg?.question_id ||
      chatMsg?.qa_entry_id ||
      ''
    ).trim();

    if (explicitId) return explicitId;

    const fingerprint = [
      String(chatMsg?.authorId || chatMsg?.author_id || chatMsg?.user_id || ''),
      String(chatMsg?.author || chatMsg?.user_name || chatMsg?.username || ''),
      extractSocketText(chatMsg),
      String(chatMsg?.time || ''),
      String(chatMsg?.created_at || ''),
    ]
      .map((v) => normalizeText(v))
      .join('|');

    return `socket-${fingerprint || Date.now().toString()}`;
  };

  const resolveSocketAuthor = (chatMsg: any, prevMessages: Message[]): string => {
    const explicitAuthor = String(
      chatMsg?.author ||
      chatMsg?.user_name ||
      chatMsg?.username ||
      ''
    ).trim();

    if (explicitAuthor && normalizeText(explicitAuthor) !== 'usuario') {
      return explicitAuthor;
    }

    const authorId = String(chatMsg?.authorId || chatMsg?.author_id || chatMsg?.user_id || '').trim();
    if (authorId && userId && authorId === String(userId)) {
      return displayName;
    }

    const candidateText = extractSocketText(chatMsg);
    if (candidateText) {
      const sameTextFromMe = [...prevMessages]
        .reverse()
        .find(
          (m) =>
            normalizeText(m.text) === normalizeText(candidateText) &&
            normalizeText(m.author) === normalizeText(displayName)
        );

      if (sameTextFromMe?.author) {
        return sameTextFromMe.author;
      }
    }

    return explicitAuthor || 'Usuario';
  };

  // Convert ChatMessage to Message format for display
  const convertToMessage = (chatMsg: ChatMessage, prevMessages: Message[]): Message => {
    const rawTime = (chatMsg as any)?.time || (chatMsg as any)?.created_at;
    const sortTimestamp = toTimestamp(rawTime) || Date.now();

    return {
      id: getSocketMessageId(chatMsg),
      author: resolveSocketAuthor(chatMsg, prevMessages),
      text: extractSocketText(chatMsg),
      time: formatDisplayTime(rawTime),
      isRead: Boolean((chatMsg as any)?.isRead),
      isModerator: Boolean((chatMsg as any)?.isModerator),
      replyTo: (chatMsg as any)?.replyTo ? {
        author: String((chatMsg as any).replyTo.author || 'Moderador'),
        text: String((chatMsg as any).replyTo.text || '')
      } : undefined,
      sortTimestamp,
    } as InternalMessage;
  };
  const sortMessagesChronologically = (list: Message[]): Message[] => {
    return [...list].sort((a, b) => {
      const aTs = (a as InternalMessage).sortTimestamp ?? 0;
      const bTs = (b as InternalMessage).sortTimestamp ?? 0;
      if (aTs !== bTs) return aTs - bTs;
      return String(a.id).localeCompare(String(b.id));
    });
  };


  // Merge socket messages with local state
  const [messages, setMessages] = useState<Message[]>([]);

  const FALLBACK_PROXY_FILE_ID = '00000000-0000-0000-0000-000000000000';

  const normalizeText = (value: string): string => String(value || '').trim().toLowerCase();

  const normalizeName = (value: string): string =>
    normalizeText(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const isTransientId = (id: string): boolean =>
    id.startsWith('tmp-') || id.startsWith('temp_') || id.startsWith('socket-');

  const isSameAuthor = (a: string, b: string): boolean => {
    const aName = normalizeName(a);
    const bName = normalizeName(b);
    if (!aName || !bName) return false;
    return aName === bName || aName.includes(bName) || bName.includes(aName);
  };

  const choosePreferredMessage = (a: Message, b: Message): Message => {
    const score = (m: Message): number => {
      let points = 0;
      if (!isTransientId(m.id)) points += 3;
      if (m.author && normalizeText(m.author) !== 'usuario') points += 2;
      points += Math.min(m.author.length, 40) / 100;
      return points;
    };

    const best = score(a) >= score(b) ? a : b;
    const other = best === a ? b : a;

    const bestName = normalizeName(best.author);
    const otherName = normalizeName(other.author);
    if (isSameAuthor(best.author, other.author) && otherName.length > bestName.length) {
      return { ...best, author: other.author };
    }

    return best;
  };

  const dedupeSimilarMessages = (list: Message[]): Message[] => {
    const result: Message[] = [];

    for (const msg of list) {
      const idx = result.findIndex((existing) => {
        const sameText = normalizeText(existing.text) === normalizeText(msg.text);
        const sameAuthor = isSameAuthor(existing.author, msg.author);
        const sameTime = normalizeText(existing.time) === normalizeText(msg.time);
        const transientPair = isTransientId(existing.id) || isTransientId(msg.id);

        return sameText && sameAuthor && (sameTime || transientPair);
      });

      if (idx >= 0) {
        result[idx] = choosePreferredMessage(result[idx], msg);
      } else {
        result.push(msg);
      }
    }

    return result;
  };

  const getPersonId = (item: any): string => String(
    item?.userId ||
    item?.userid ||
    item?.user_id ||
    item?.user?.id ||
    item?.unit_assignment?.user?.id ||
    ''
  );

  const getPersonEmail = (item: any): string => String(
    item?.email ||
    item?.user_email ||
    item?.user?.email ||
    item?.unit_assignment?.user?.email ||
    ''
  );

  const getPersonName = (item: any): string => {
    const firstName = String(
      item?.first_name ||
      item?.user_first_name ||
      item?.user?.first_name ||
      item?.unit_assignment?.user?.first_name ||
      ''
    );
    const lastName = String(
      item?.last_name ||
      item?.user_last_name ||
      item?.user?.last_name ||
      item?.unit_assignment?.user?.last_name ||
      ''
    );
    return `${firstName} ${lastName}`.trim();
  };

  const matchesCurrentUser = (item: any): boolean => {
    const sameById = getPersonId(item) && userId && getPersonId(item) === String(userId);
    const sameByEmail = normalizeText(getPersonEmail(item)) && normalizeText(userEmail) && normalizeText(getPersonEmail(item)) === normalizeText(userEmail);
    const sameByName = normalizeText(getPersonName(item)) && normalizeText(userName) && normalizeText(getPersonName(item)) === normalizeText(userName);
    return Boolean(sameById || sameByEmail || sameByName);
  };

  const getAttendanceId = (item: any): string => String(
    item?.id ||
    item?.assembly_attendance_id ||
    item?.assemblyAttendanceId ||
    item?.attendance_id ||
    ''
  );

  const getUnitAssignmentId = (item: any): string => String(
    item?.unit_assignments_id ||
    item?.unitAssignmentId ||
    item?.ua_id ||
    ''
  );

  const buildPersonData = (item: any) => {
    const firstName = String(
      item?.first_name ||
      item?.user_first_name ||
      item?.user?.first_name ||
      item?.unit_assignment?.user?.first_name ||
      ''
    ).trim();

    const lastName = String(
      item?.last_name ||
      item?.user_last_name ||
      item?.user?.last_name ||
      item?.unit_assignment?.user?.last_name ||
      ''
    ).trim();

    return { firstName, lastName };
  };

  const mergeById = (prev: Message[], incoming: Message[]): Message[] => {
    const byId = new Map<string, Message>();
    [...prev, ...incoming].forEach((msg) => byId.set(msg.id, msg));
    return sortMessagesChronologically(Array.from(byId.values()));
  };

  const removeTempDuplicates = (list: Message[]): Message[] => {
    const persisted = list.filter((msg) => !msg.id.startsWith('tmp-'));
    const temps = list.filter((msg) => msg.id.startsWith('tmp-'));

    const nonDuplicatedTemps = temps.filter((tmp) => {
      return !persisted.some(
        (p) => normalizeText(p.author) === normalizeText(tmp.author) && normalizeText(p.text) === normalizeText(tmp.text)
      );
    });

    return sortMessagesChronologically(dedupeSimilarMessages([...persisted, ...nonDuplicatedTemps]));
  };

  const mapApiMessages = (entries: any[], attendees: any[], cited: any[]): Message[] => {
    const attendeeByAttendanceId = new Map<string, any>();
    const attendeeByUnitAssignmentId = new Map<string, any>();
    attendees.forEach((item: any) => {
      const attendance = getAttendanceId(item);
      const unitAssignment = getUnitAssignmentId(item);
      if (attendance) attendeeByAttendanceId.set(attendance, item);
      if (unitAssignment) attendeeByUnitAssignmentId.set(unitAssignment, item);
    });

    const citedByUserId = new Map<string, any>();
    const citedByUnitAssignmentId = new Map<string, any>();
    cited.forEach((item: any) => {
      const id = getPersonId(item);
      const unitAssignment = getUnitAssignmentId(item);
      if (id) citedByUserId.set(id, item);
      if (unitAssignment) citedByUnitAssignmentId.set(unitAssignment, item);
    });

    return entries.map((entry: any) => {
      const attendanceId = String(entry?.assembly_attendances_id || '');
      const attendee = attendeeByAttendanceId.get(attendanceId);
      const unitAssignmentId = getUnitAssignmentId(entry) || getUnitAssignmentId(attendee);
      const attendeeByUnit = unitAssignmentId ? attendeeByUnitAssignmentId.get(unitAssignmentId) : undefined;
      const entryUserId = getPersonId(entry) || getPersonId(attendee);
      const citedByUser = entryUserId ? citedByUserId.get(entryUserId) : undefined;
      const citedByUnit = unitAssignmentId ? citedByUnitAssignmentId.get(unitAssignmentId) : undefined;

      const base = buildPersonData(entry);
      const fallbackA = buildPersonData(attendee);
      const fallbackB = buildPersonData(attendeeByUnit);
      const fallbackC = buildPersonData(citedByUser);
      const fallbackD = buildPersonData(citedByUnit);

      const firstName = base.firstName || fallbackA.firstName || fallbackB.firstName || fallbackC.firstName || fallbackD.firstName;
      const lastName = base.lastName || fallbackA.lastName || fallbackB.lastName || fallbackC.lastName || fallbackD.lastName;
      const explicitAuthor = String(entry?.author || entry?.user_name || '').trim();
      const author = explicitAuthor || `${firstName} ${lastName}`.trim() || `Usuario ${attendanceId.slice(0, 8)}`;
      const text = String(entry?.text || entry?.question_text || '').trim();
      const rawTime = entry?.time || entry?.created_at;
      const time = formatDisplayTime(rawTime);
      const sortTimestamp = toTimestamp(rawTime) || 0;

      return {
        id: entry.id || Date.now().toString(),
        author,
        text,
        time,
        isRead: false,
        sortTimestamp,
      } as InternalMessage;
    });
  };

  const syncMessagesFromApi = async (showLoader = false) => {
    if (!assemblyId) return;

    if (showLoader) setIsLoading(true);

    try {
      const [activeResponse, attendeesResponse, citedResponse] = await Promise.all([
        getByAssembly(assemblyId),
        getAttendees(assemblyId),
        getCited(assemblyId),
      ]);

      const activeEntries = Array.isArray(activeResponse?.data) ? activeResponse.data : [];
      const attendees = Array.isArray(attendeesResponse?.data) ? attendeesResponse.data : [];
      const cited = Array.isArray(citedResponse?.data) ? citedResponse.data : [];

      const initialMessages = mapApiMessages(activeEntries, attendees, cited);
      setMessages((prev) => removeTempDuplicates(mergeById(prev, initialMessages)));
    } catch (err) {
      console.error('Error loading initial questions:', err);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const resolveAttendanceId = async (): Promise<string> => {
    if (!assemblyId) return '';
    if (attendanceId) return attendanceId;

    const attendeesResponse = await getAttendees(assemblyId);
    const attendees = Array.isArray(attendeesResponse?.data) ? attendeesResponse.data : [];
    const matchedAttendee = attendees.find((item: any) => matchesCurrentUser(item));

    if (matchedAttendee) {
      const existingAttendanceId = getAttendanceId(matchedAttendee);
      if (existingAttendanceId) {
        setAttendanceId(existingAttendanceId);
        return existingAttendanceId;
      }
    }

    const citedResponse = await getCited(assemblyId);
    const cited = Array.isArray(citedResponse?.data) ? citedResponse.data : [];
    const matchedCited = cited.find((item: any) => matchesCurrentUser(item));

    if (!matchedCited) return '';

    const unitAssignmentId = getUnitAssignmentId(matchedCited);
    if (!unitAssignmentId) return '';

    const createdAttendance = await createAttendance({
      assemblies_id: assemblyId,
      unit_assignments_id: unitAssignmentId,
      arrival_at: new Date().toISOString(),
      is_present: true,
      proxy_file_id: FALLBACK_PROXY_FILE_ID,
      notes: 'Registro automático para pregunta al moderador',
    });

    const createdAttendanceId = String(createdAttendance?.data?.id || '');
    if (createdAttendanceId) {
      setAttendanceId(createdAttendanceId);
    }

    return createdAttendanceId;
  };

  // Load initial data from REST API when assembly ID is available
  useEffect(() => {
    void syncMessagesFromApi(true);
  }, [assemblyId]);

  useEffect(() => {
    if (!assemblyId || !isConnected) return;
    void syncMessagesFromApi(false);
  }, [assemblyId, isConnected]);

  // Update local messages when socket messages arrive
  useEffect(() => {
    if (socketMessages.length > 0) {
      setMessages((prev) => {
        const formattedMessages = socketMessages
          .map((socketMsg) => convertToMessage(socketMsg, prev))
          .filter((msg) => msg.text || msg.replyTo?.text);

        return removeTempDuplicates(mergeById(prev, formattedMessages));
      });
    }
  }, [socketMessages]);

  // Keep chat pinned to latest message without affecting page scroll.
  useEffect(() => {
    if (!showMessages) return;

    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, showMessages]);

  // Function to send question via socket and persist to backend
  const sendMessage = async () => {
    if (!message.trim() || !assemblyId) return;

    let resolvedAttendanceId = '';
    try {
      resolvedAttendanceId = await resolveAttendanceId();
      if (!resolvedAttendanceId) {
        alert('No se encontró tu registro de asistencia para enviar preguntas.');
        return;
      }
    } catch (err) {
      console.error('Error resolving attendance for question:', err);
      alert(err instanceof Error ? err.message : 'Error al preparar tu pregunta');
      return;
    }

    const nowTs = Date.now();
    const newMessage: Message = {
      id: `tmp-${Date.now()}`,
      author: displayName,
      text: message,
      time: getCurrentTime(),
      isRead: true,
      sortTimestamp: nowTs,
    } as InternalMessage;

    setMessages((prev) => mergeById(prev, [newMessage]));

    // Send via socket for real-time
    sendQuestion(message);

    // Also persist to backend via REST API
    try {
      const created = await create({
        assembly_attendances_id: resolvedAttendanceId,
        question_text: message,
      });
      const createdData = (created as any)?.data || {};

      const persistedRawTime = createdData?.time || createdData?.created_at;
      const persistedMessage: Message = {
        id: createdData?.id || newMessage.id,
        author: String(createdData?.author || displayName).trim() || displayName,
        text: String(createdData?.text || createdData?.question_text || message).trim() || message,
        time: formatDisplayTime(persistedRawTime),
        isRead: false,
        sortTimestamp: toTimestamp(persistedRawTime) || nowTs,
      } as InternalMessage;

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== newMessage.id);
        return mergeById(withoutTemp, [persistedMessage]);
      });
    } catch (err) {
      console.error('Error saving question to backend:', err);
      setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
      alert(err instanceof Error ? err.message : 'Error al guardar la pregunta');
      return;
    }

    // Create notification
    setNotifications(prev => [...prev, { ...newMessage, isRead: false }]);

    // Auto-eliminar notificación después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newMessage.id));
    }, 5000);

    setMessage('');
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

          <div className={styles["messages-container"]} ref={chatContainerRef}>
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
