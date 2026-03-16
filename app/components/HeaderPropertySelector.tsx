'use client';

import { usePropertySelector } from '@/app/hooks/usePropertySelector';
import { PropertySelector } from '@/app/components/PropertySelector';
import { PropertySelectorModal } from '@/app/components/PropertySelectorModal';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Property } from '@/app/hooks/usePropertySelector';

export function HeaderPropertySelector() {
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
    showPopup,
    selectProperty,
    closeModal
  } = usePropertySelector(ownerships);

  if (!isHydrated || isLoading || properties.length === 0) {
    return null;
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
    </>
  );
}