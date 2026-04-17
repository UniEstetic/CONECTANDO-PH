'use client';

import { useProperty } from '@/app/context/PropertyContext';
import { PropertySelector } from '@/app/components/PropertySelector';

export function HeaderPropertySelector() {
  const {
    properties,
    selectedProperty,
    selectProperty,
    isLoading,
  } = useProperty();

  if (isLoading || properties.length === 0) {
    return null;
  }

  return (
    <PropertySelector
      properties={properties}
      selectedProperty={selectedProperty}
      onSelect={selectProperty}
    />
  );
}