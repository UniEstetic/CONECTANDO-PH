'use client'

import styles from '@/app/ui/styles/StatusToggle.module.css'

type StatusToggleProps = {
  entityLabel: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
  activeText?: string
  inactiveText?: string
  disabled?: boolean
  className?: string
}

export default function StatusToggle({
  entityLabel,
  checked,
  onChange,
  hint,
  activeText = 'activa',
  inactiveText = 'no activa',
  disabled = false,
  className,
}: StatusToggleProps) {
  return (
    <div className={`${styles.card} ${checked ? styles.cardActive : ''} ${className || ''}`}>
      <label className={styles.row}>
        <span className={styles.textWrap}>
          <span className={styles.title}>
            {entityLabel} {checked ? activeText : inactiveText}
          </span>
          {hint ? <span className={styles.hint}>{hint}</span> : null}
        </span>

        <input
          type='checkbox'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={styles.checkbox}
        />
        <span className={styles.track} aria-hidden='true'>
          <span className={styles.thumb}></span>
        </span>
      </label>
    </div>
  )
}