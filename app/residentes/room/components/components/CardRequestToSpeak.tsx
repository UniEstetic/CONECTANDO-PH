"use client";

import { WordRequest } from "../../types";
import { useState, useEffect } from "react";

import {
  ChevronDown,
  ChevronUp,
  Hand

} from "lucide-react";

import styles from '@/app/ui/styles/roomResidentes.module.css';
import { getActiveByAssembly } from "@/app/services/qa_entries.service";
import { getAttendees, getCited } from "@/app/services/assemblies.service";

interface CardRequestToSpeakProps {
  assemblyId?: string;
  refreshKey?: number;
}

const normalizeText = (value: string): string => String(value || '').trim().toLowerCase();

const isWordRequest = (value: string): boolean => {
  const normalized = normalizeText(value);
  return normalized === 'petición de palabra' || normalized === 'peticion de palabra';
};

const isEntryActive = (entry: any): boolean => {
  const status = normalizeText(String(entry?.status || 'pending'));
  const inactiveStatuses = new Set([
    'rejected',
    'removed',
    'deleted',
    'resolved',
    'answered',
    'cancelled',
    'canceled',
    'inactive',
    'closed',
  ]);

  return !inactiveStatuses.has(status);
};

const getEntryText = (entry: any): string => String(
  entry?.text ||
  entry?.question_text ||
  ''
).trim();

const getEntryAuthor = (entry: any): string => String(
  entry?.author ||
  entry?.user_name ||
  ''
).trim();

const formatTime = (value: any): string => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return String(value);
};

const getAttendanceId = (item: any): string => String(
  item?.id ||
  item?.assembly_attendance_id ||
  item?.assemblyAttendanceId ||
  item?.attendance_id ||
  ''
);

const getUserId = (item: any): string => String(
  item?.authorId ||
  item?.author_id ||
  item?.userId ||
  item?.userid ||
  item?.user_id ||
  item?.user?.id ||
  item?.unit_assignment?.user?.id ||
  ''
);

function buildPersonData(item: any) {
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
  const apartment = String(
    item?.apartment ||
    item?.unit ||
    item?.unit_number ||
    item?.unit_number ||
    item?.u_unit_number ||
    item?.unit_assignment?.unit?.unit_number ||
    ''
  ).trim();
  const tower = String(
    item?.tower ||
    item?.torre ||
    item?.block ||
    item?.u_block ||
    item?.unit_assignment?.unit?.block ||
    ''
  ).trim();

  return { firstName, lastName, apartment, tower };
}

export function CardRequestToSpeak({ assemblyId, refreshKey = 0 }: CardRequestToSpeakProps) {
  const [showWordRequests, setShowWordRequests] = useState(true);
  const [wordRequests, setWordRequests] = useState<WordRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapWordRequests = (activeEntries: any[], attendees: any[], cited: any[]): WordRequest[] => {
    const attendeeByAttendanceId = new Map<string, any>();

    attendees.forEach((item: any) => {
      const attendanceId = getAttendanceId(item);
      if (attendanceId) attendeeByAttendanceId.set(attendanceId, item);
    });

    const citedByUserId = new Map<string, any>();
    cited.forEach((item: any) => {
      const userId = getUserId(item);
      if (userId) citedByUserId.set(userId, item);
    });

    const mapped = activeEntries
      .filter((entry: any) => isWordRequest(getEntryText(entry)) && isEntryActive(entry))
      .map((entry: any) => {
        const entryAttendanceId = getAttendanceId(entry);
        const attendeeFromAttendance = attendeeByAttendanceId.get(entryAttendanceId);
        const entryUserId = getUserId(entry) || getUserId(attendeeFromAttendance);
        const citedFromUser = entryUserId ? citedByUserId.get(entryUserId) : undefined;

        const person = buildPersonData(entry);
        const fallbackA = buildPersonData(attendeeFromAttendance);
        const fallbackB = buildPersonData(citedFromUser);

        const firstName = person.firstName || fallbackA.firstName || fallbackB.firstName;
        const lastName = person.lastName || fallbackA.lastName || fallbackB.lastName;
        const apartment = person.apartment || fallbackA.apartment || fallbackB.apartment;
        const tower = person.tower || fallbackA.tower || fallbackB.tower;
        const explicitAuthor = getEntryAuthor(entry);
        const fullName = `${firstName} ${lastName}`.trim();
        const finalName = explicitAuthor || fullName || 'Usuario';

        const initials = firstName && lastName
          ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
          : finalName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join('') || '??';

        const time = formatTime(entry?.time || entry?.created_at);

        return {
          id: entry.id || '',
          name: finalName,
          apartment: apartment || '',
          tower: tower || '',
          initials,
          time,
        };
      });

    // Keep one active request per person/attendance to avoid duplicate visual rows.
    const unique = new Map<string, WordRequest>();
    mapped.forEach((request) => {
      const key = normalizeText(`${request.name}|${request.apartment}|${request.tower}`);
      if (!unique.has(key)) {
        unique.set(key, request);
      }
    });

    return Array.from(unique.values());
  };

  const fetchWordRequests = async (showLoader = false) => {
    if (!assemblyId) {
      setWordRequests([]);
      return;
    }

    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      const [activeResponse, attendeesResponse, citedResponse] = await Promise.all([
        getActiveByAssembly(assemblyId),
        getAttendees(assemblyId),
        getCited(assemblyId),
      ]);

      const activeEntries = Array.isArray(activeResponse?.data) ? activeResponse.data : [];
      const attendees = Array.isArray(attendeesResponse?.data) ? attendeesResponse.data : [];
      const cited = Array.isArray(citedResponse?.data) ? citedResponse.data : [];

      const mappedRequests: WordRequest[] = mapWordRequests(activeEntries, attendees, cited);
      setWordRequests(mappedRequests);
    } catch (err) {
      console.error('Error fetching word requests:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar peticiones');
      setWordRequests([]);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  // Fetch word requests from API
  useEffect(() => {
    void fetchWordRequests(true);
  }, [assemblyId, refreshKey]);

  // Refresh when the tab becomes visible again.
  useEffect(() => {
    if (!assemblyId) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchWordRequests(false);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [assemblyId]);

  // Keep word-request state in near real-time for users in the room.
  useEffect(() => {
    if (!assemblyId) return;

    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      void fetchWordRequests(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [assemblyId]);

  return (<>
    <div
      className={styles["info-card-header"]}
      onClick={() => setShowWordRequests(!showWordRequests)}
    >
      <div className={styles["info-card-title"]}>
        <div className={`${styles["info-card-icon"]} ${styles["icon-word-request"]}`}>
          <Hand size={20} color="white" />
        </div>
        <span>Petición de palabra ({wordRequests.length})</span>
      </div>
      {showWordRequests ? (
        <ChevronUp size={20} />
      ) : (
        <ChevronDown size={20} />
      )}
    </div>

    {showWordRequests && (
      <div>
        {isLoading && wordRequests.length === 0 ? (
          <div className={styles["no-requests"]}>Cargando peticiones...</div>
        ) : error ? (
          <div className={styles["no-requests"]}>{error}</div>
        ) : wordRequests.length > 0 ? (
          wordRequests.map((request) => (
            <div className={styles["word-request-item"]} key={request.id}>
              <div className={styles["word-request-info"]}>
                <div className={styles["word-request-avatar"]}>{request.initials}</div>
                <div className={styles["word-request-name"]}>
                  {request.name}
                  {request.apartment ? `, apto ${request.apartment}` : ''}
                  {request.tower ? `, torre ${request.tower}` : ''}
                </div>
              </div>
              <div className={styles["word-request-time"]}>{request.time}</div>
            </div>
          ))
        ) : (
          <div className={styles["no-requests"]}>No hay peticiones de palabra</div>
        )}
      </div>
    )}
  </>);
}
