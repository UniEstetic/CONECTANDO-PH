"use client";

import { MessageCircle, X } from "lucide-react";
import { Message } from "../../types";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import {
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";

export function CardSharedFiles() {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const [showSharedFiles, setShowSharedFiles] = useState(true);

  return (<>
      <div
        className={styles["info-card-header"]}
        onClick={() => setShowSharedFiles(!showSharedFiles)}
      >
        <div className={styles["info-card-title"]}>
          <div className={`${styles["info-card-icon"]} ${styles["icon-files"]}`}>
            <FileText size={20} color="white" />
          </div>
          <span>Archivos compartidos</span>
        </div>
        {showSharedFiles ? (
          <ChevronUp size={20} />
        ) : (
          <ChevronDown size={20} />
        )}
      </div>

      {showSharedFiles && (
        <div>
          {["Estados Financieros 2025", "Estados Financieros 2025", "Cotización puertas", "Recibo compra vidrios"].map((file, idx) => (
            <div className={styles["file-item"]} key={idx}>
              <div className={styles["file-info"]}>
                <div className={styles["file-icon"]}>
                  <FileText size={18} color="white" />
                </div>
                <div className={styles["file-name"]}>{file}</div>
              </div>
              <div className={styles["file-actions"]}>
                <div className={styles["file-action-btn"]}>
                  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className={styles["file-action-btn"]}>
                  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
  </>);
}
