'use client';

import { Property } from '@/app/hooks/usePropertySelector';
import { Building2, Check } from 'lucide-react';

interface PropertySelectorProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelect: (property: Property) => void;
  title?: string;
}

export function PropertySelector({ 
  properties, 
  selectedProperty, 
  onSelect,
  title = 'Selecciona una propiedad'
}: PropertySelectorProps) {
  if (properties.length === 0) return null;
  
  if (properties.length === 1) {
    // Single property - just show the name, no selector needed
    return (
      <div className="text-sm text-gray-600">
        <span className="font-medium">{properties[0].name}</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
        <Building2 size={16} />
        <span className="max-w-[120px] truncate">
          {selectedProperty?.name || 'Cambiar propiedad'}
        </span>
      </button>
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
          {title}
        </div>
        {properties.map((property) => (
          <button
            key={property.id}
            onClick={() => onSelect(property)}
            className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
              selectedProperty?.id === property.id ? 'bg-blue-50 text-blue-700' : ''
            }`}
          >
            {property.logo_url ? (
              <img 
                src={property.logo_url} 
                alt={property.name}
                className="w-6 h-6 rounded object-cover"
              />
            ) : (
              <Building2 size={16} className="text-gray-400" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{property.name}</div>
              {property.address && (
                <div className="text-xs text-gray-500 truncate">{property.address}</div>
              )}
            </div>
            {selectedProperty?.id === property.id && (
              <Check size={16} className="text-blue-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}