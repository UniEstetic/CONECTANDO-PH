'use client';

import s from '@/app/ui/styles/loadingState.module.css';

interface LoadingStateProps {
  /** Texto que se muestra debajo del spinner */
  message?: string;
  /** fullPage: centrado en pantalla, inline: dentro de una sección */
  variant?: 'fullPage' | 'inline';
}

export default function LoadingState({
  message = 'Cargando...',
  variant = 'inline',
}: LoadingStateProps) {
  const isFullPage = variant === 'fullPage';

  return (
    <div
      className={`${s.loadingContainer} ${
        isFullPage ? s.loadingFullPage : s.loadingInline
      }`}
      role="status"
      aria-live="polite"
    >
      <div className={s.loadingInner}>
        <div
          className={`${s.loaderBars} ${!isFullPage ? s.loaderBarsSmall : ''}`}
          aria-hidden="true"
        >
          <span className={s.bar} />
          <span className={s.bar} />
          <span className={s.bar} />
          <span className={s.bar} />
        </div>

        <p className={s.loadingText}>{message}</p>
        <span className={s.loadingSubtext}>Un momento por favor.</span>
      </div>
    </div>
  );
}
