'use client';

import { Property } from '@/app/hooks/usePropertySelector';
import { Building2, Check } from 'lucide-react';
import { useEffect } from 'react';

interface PropertySelectorModalProps {
  isOpen: boolean;
  properties: Property[];
  onSelect: (property: Property) => void;
  onClose?: () => void;
}

export function PropertySelectorModal({ 
  isOpen, 
  properties, 
  onSelect,
  onClose 
}: PropertySelectorModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-white" />
            <div>
              <h2 className="text-lg font-bold text-white">
                Selecciona una propiedad
              </h2>
              <p className="text-blue-100 text-sm">
                Tienes acceso a múltiples propiedades
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Por favor selecciona la propiedad con la que deseas continuar:
          </p>
          
          <div className="space-y-2">
            {properties.map((property) => (
              <button
                key={property.id}
                onClick={() => onSelect(property)}
                className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {property.logo_url ? (
                    <img 
                      src={property.logo_url} 
                      alt={property.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Building2 size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {property.name}
                    </h3>
                    {property.address && (
                      <p className="text-sm text-gray-500 truncate">
                        {property.address}
                      </p>
                    )}
                    {property.city && (
                      <p className="text-xs text-gray-400">
                        {property.city}, {property.state}
                      </p>
                    )}
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-400 flex items-center justify-center">
                    <Check size={14} className="text-blue-600 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            Puedes cambiar de propiedad desde el menú en cualquier momento
          </p>
        </div>
      </div>
    </div>
  );
}