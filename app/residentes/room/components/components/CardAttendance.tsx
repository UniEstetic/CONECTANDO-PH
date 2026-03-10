"use client";
import {
  useParticipants
} from "@livekit/components-react";

import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';

export function CardAttendance() {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const participants = useParticipants();

  return (<>
    <div className={styles["info-card-header"]}>
      <div className={styles["info-card-title"]}>
        <div className={`${styles["info-card-icon"]} ${styles["icon-attendance"]}`}>
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>Asistencia</span>
      </div>
    </div>
    <div className={styles["attendance-grid"]}>
      <div className={styles["attendance-item"]}>
        <div className={styles["attendance-label"]}>Presentes</div>
        <div className={styles["attendance-value"]}>{participants.length}</div>
      </div>
      <div className={styles["attendance-item"]}>
        <div className={styles["attendance-label"]}>Ausentes</div>
        <div className={styles["attendance-value"]}>250</div>
      </div>
      <div className={styles["attendance-item"]}>
        <div className={styles["attendance-label"]}>Citados</div>
        <div className={styles["attendance-value"]}>1.000</div>
      </div>
      <div className={styles["attendance-item"]}>
        <div className={styles["attendance-label"]}>Coeficiente</div>
        <div className={styles["attendance-value"]}>65%</div>
      </div>
      <div className={styles["attendance-item"]}>
        <div className={styles["attendance-label"]}>Quorum</div>
        <div className={styles["attendance-value quorum"]}>75%</div>
      </div>
    </div>
  </>);
}
