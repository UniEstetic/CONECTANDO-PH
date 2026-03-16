'use client';

import { Property, usePropertySelector } from '@/app/hooks/usePropertySelector';
import { PropertySelector } from '@/app/components/PropertySelector';
import { PropertySelectorModal } from '@/app/components/PropertySelectorModal';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface PropertySelectorProviderProps {
  children: React.ReactNode;
}

export function PropertySelectorProvider({ children }: PropertySelectorProviderProps) {
  const { data: session, status } = useSession();
  const [ownerships, setOwnerships] = useState<Property[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Get ownerships from session once loaded
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      if (user.ownerships && Array.isArray(user.ownerships)) {
        setOwnerships(user.ownerships);
      } else if (user.ownership) {
        setOwnerships([user.ownership]);
      }
    }
    setIsHydrated(true);
  }, [session, status]);

  const {
    properties,
    selectedProperty,
    isLoading,
    hasMultipleProperties,
    showPopup,
    selectProperty,
    closeModal
  } = usePropertySelector(ownerships);

  if (!isHydrated || isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Header Selector */}
      <PropertySelector
        properties={properties}
        selectedProperty={selectedProperty}
        onSelect={selectProperty}
        title="Cambiar propiedad"
      />

      {/* Modal for initial selection */}
      <PropertySelectorModal
        isOpen={showPopup || false}
        properties={properties}
        onSelect={selectProperty}
        onClose={closeModal}
      />

      {children}
    </>
  );
}

// Export individual components for direct use
export { usePropertySelector } from '@/app/hooks/usePropertySelector';
export { PropertySelector } from '@/app/components/PropertySelector';
export { PropertySelectorModal } from '@/app/components/PropertySelectorModal';