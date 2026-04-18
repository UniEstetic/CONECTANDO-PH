'use client';

import { useProperty } from '@/app/context/PropertyContext';
import { Building2 } from 'lucide-react';
import styles from '@/app/ui/styles/footer.module.css';

export function FooterPropertyIndicator() {
  const { selectedProperty, isLoading } = useProperty();

  if (isLoading || !selectedProperty) return null;

  return (
    <div className={styles.propertyIndicator}>
      <Building2 size={14} className={styles.propertyIcon} />
      <span className={styles.propertyName}>{selectedProperty.name}</span>
    </div>
  );
}
