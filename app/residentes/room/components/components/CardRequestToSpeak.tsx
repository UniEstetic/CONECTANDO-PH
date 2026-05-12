"use client";

import { WordRequest } from "../../types";
import { useState, useEffect } from "react";

import {
  ChevronDown,
  ChevronUp,
  Hand

} from "lucide-react";

import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { getActiveByAssembly } from "@/app/services/qa_entries.service";

interface CardRequestToSpeakProps {
  assemblyId?: string;
}

export function CardRequestToSpeak({ assemblyId }: CardRequestToSpeakProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const [showWordRequests, setShowWordRequests] = useState(true);
  const [wordRequests, setWordRequests] = useState<WordRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch word requests from API
  useEffect(() => {
    const fetchWordRequests = async () => {
      if (!assemblyId) {
        // If no assemblyId, show empty state
        setWordRequests([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getActiveByAssembly(assemblyId);
        
        if (response.data && Array.isArray(response.data)) {
          // Map QA entries to WordRequest format
          const mappedRequests: WordRequest[] = response.data.map((entry: any) => {
            // Try to get user info from the entry
            const firstName = entry.unit_assignment?.user?.first_name || '';
            const lastName = entry.unit_assignment?.user?.last_name || '';
            const unitNumber = entry.unit_assignment?.unit?.unit_number || '';
            const block = entry.unit_assignment?.unit?.block || '';
            
            // Generate initials from name
            const initials = firstName && lastName 
              ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
              : '??';

            // Format time from created_at
            const time = entry.created_at 
              ? new Date(entry.created_at).toLocaleTimeString('es-CO', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              : '';

            return {
              id: entry.id || '',
              name: `${firstName} ${lastName}`.trim() || 'Usuario',
              apartment: unitNumber,
              tower: block,
              initials: initials,
              time: time
            };
          });

          setWordRequests(mappedRequests);
        } else {
          setWordRequests([]);
        }
      } catch (err) {
        console.error('Error fetching word requests:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar peticiones');
        setWordRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordRequests();
  }, [assemblyId]);

  // Auto-refresh every 30 seconds to get new requests
  useEffect(() => {
    if (!assemblyId) return;

    const interval = setInterval(async () => {
      try {
        const response = await getActiveByAssembly(assemblyId);
        if (response.data && Array.isArray(response.data)) {
          const mappedRequests: WordRequest[] = response.data.map((entry: any) => {
            const firstName = entry.unit_assignment?.user?.first_name || '';
            const lastName = entry.unit_assignment?.user?.last_name || '';
            const unitNumber = entry.unit_assignment?.unit?.unit_number || '';
            const block = entry.unit_assignment?.unit?.block || '';
            
            const initials = firstName && lastName 
              ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
              : '??';

            const time = entry.created_at 
              ? new Date(entry.created_at).toLocaleTimeString('es-CO', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              : '';

            return {
              id: entry.id || '',
              name: `${firstName} ${lastName}`.trim() || 'Usuario',
              apartment: unitNumber,
              tower: block,
              initials: initials,
              time: time
            };
          });

          setWordRequests(mappedRequests);
        }
      } catch (err) {
        console.error('Error refreshing word requests:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
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
                  {request.name}, apto {request.apartment}, torre {request.tower}
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
