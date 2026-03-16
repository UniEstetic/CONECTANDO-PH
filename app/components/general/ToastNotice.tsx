'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/ui/styles/ToastNotice.module.css'

type ToastMessage = {
  type: 'success' | 'error'
  text: string
}

type ToastNoticeProps = {
  message: ToastMessage | null
  onClear: () => void
  durationMs?: number
}

export default function ToastNotice({
  message,
  onClear,
  durationMs = 3000,
}: ToastNoticeProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return

    setVisible(true)

    const fadeAt = Math.max(0, durationMs - 400)
    const fadeTimer = setTimeout(() => {
      setVisible(false)
    }, fadeAt)

    const clearTimer = setTimeout(() => {
      onClear()
    }, durationMs)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(clearTimer)
    }
  }, [message, onClear, durationMs])

  if (!message) return null

  return (
    <div className={`${styles.wrapper} ${visible ? styles.show : styles.hide}`}>
      <div className={message.type === 'error' ? styles.toastError : styles.toastSuccess}>
        <p className={styles.text}>{message.text}</p>
      </div>
    </div>
  )
}
