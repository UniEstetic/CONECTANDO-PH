'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Property {
  id: string;
  name: string;
  tax_id?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  logo_url?: string;
}

const STORAGE_KEY = 'selected_property_id';

// Get selected property from localStorage
export function getSelectedPropertyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

// Set selected property in localStorage
export function setSelectedPropertyId(propertyId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, propertyId);
}

// Clear selected property from localStorage
export function clearSelectedProperty(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Hook to manage property selection
export function usePropertySelector(ownerships: Property[] | undefined) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hasSelectedInitially, setHasSelectedInitially] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize selected property from localStorage or first ownership
  useEffect(() => {
    if (!ownerships || ownerships.length === 0) {
      setIsLoading(false);
      return;
    }

    const storedId = getSelectedPropertyId();
    
    // Check if stored ID exists in ownerships
    const storedProperty = ownerships.find(p => p.id === storedId);
    
    if (storedProperty) {
      setSelectedProperty(storedProperty);
      setHasSelectedInitially(true);
    } else if (ownerships.length === 1) {
      // Single property - auto-select
      setSelectedProperty(ownerships[0]);
      setSelectedPropertyId(ownerships[0].id);
      setHasSelectedInitially(true);
    } else if (!hasSelectedInitially) {
      // Multiple properties and no selection yet - show popup
      setShowPopup(true);
    }
    setIsLoading(false);
  }, [ownerships, hasSelectedInitially]);

  // Handle property selection
  const selectProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
    setSelectedPropertyId(property.id);
    setShowPopup(false);
    setHasSelectedInitially(true);
  }, []);

  // Handle closing popup (if user wants to skip selection)
  const closeModal = useCallback(() => {
    // If no selection made yet but popup is closed, use first property
    if (!selectedProperty && ownerships && ownerships.length > 0) {
      setSelectedProperty(ownerships[0]);
      setSelectedPropertyId(ownerships[0].id);
    }
    setShowPopup(false);
    setHasSelectedInitially(true);
  }, [selectedProperty, ownerships]);

  // Check if should show popup (multiple properties and no selection)
  const shouldShowPopup = ownerships && ownerships.length > 1 && showPopup && !hasSelectedInitially;

  return {
    properties: ownerships || [],
    selectedProperty,
    selectProperty,
    closeModal,
    showPopup: shouldShowPopup,
    hasMultipleProperties: ownerships ? ownerships.length > 1 : false,
    isLoading,
  };
}