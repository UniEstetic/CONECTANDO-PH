"use client";

import { WordRequest } from "../../types";
import { useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Hand

} from "lucide-react";

import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';

export function CardRequestToSpeak() {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const [showWordRequests, setShowWordRequests] = useState(true);

  // Peticiones de palabra
  const [wordRequests, setWordRequests] = useState<WordRequest[]>([
    {
      id: '1',
      name: 'Rodrigo Pérez ok',
      apartment: '501',
      tower: '6',
      initials: 'RP',
      time: '12:25 p.m.'
    },
    {
      id: '2',
      name: 'Claudia López',
      apartment: '303',
      tower: '2',
      initials: 'CL',
      time: '12:28 p.m.'
    },
    {
      id: '3',
      name: 'Laura Arciniegas',
      apartment: '205',
      tower: '1',
      initials: 'LA',
      time: '12:29 p.m.'
    }
  ]);

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
        {wordRequests.map((request) => (
          <div className={styles["word-request-item"]} key={request.id}>
            <div className={styles["word-request-info"]}>
              <div className={styles["word-request-avatar"]}>{request.initials}</div>
              <div className={styles["word-request-name"]}>
                {request.name}, apto {request.apartment}, torre {request.tower}
              </div>
            </div>
            <div className={styles["word-request-time"]}>{request.time}</div>
          </div>
        ))}
        {wordRequests.length === 0 && (
          <div className={styles["no-requests"]}>No hay peticiones de palabra</div>
        )}
      </div>
    )}
  </>);
}
