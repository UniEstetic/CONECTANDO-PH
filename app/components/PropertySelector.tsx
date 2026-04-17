'use client';

import { Property } from '@/app/context/PropertyContext';
import { Building2, Check, ChevronDown, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import s from '@/app/ui/styles/propertySelector.module.css';

interface PropertySelectorProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelect: (property: Property) => void;
}

export function PropertySelector({
  properties,
  selectedProperty,
  onSelect,
}: PropertySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (properties.length === 0) return null;

  if (properties.length === 1) {
    return (
      <div className={s.singlePill}>
        <Building2 size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
        <span>{properties[0].name}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${s.trigger} ${open ? s.triggerOpen : ''}`}
      >
        <Building2 size={16} style={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />
        <span className={s.triggerName}>
          {selectedProperty?.name || 'Seleccionar'}
        </span>
        <span className={s.badge}>{properties.length}</span>
        <ChevronDown
          size={15}
          className={`${s.chevron} ${open ? s.chevronOpen : ''}`}
        />
      </button>

      {/* Dropdown */}
      <div className={`${s.dropdown} ${open ? s.dropdownVisible : s.dropdownHidden}`}>
        <div className={s.panel}>
          {/* Header */}
          <div className={s.panelHeader}>
            <div>
              <p className={s.panelTitle}>Cambiar copropiedad</p>
              <p className={s.panelSubtitle}>
                {properties.length} disponible{properties.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className={s.panelHeaderIcon}>
              <Building2 size={16} style={{ color: '#fff' }} />
            </div>
          </div>

          {/* List */}
          <div className={s.list}>
            {properties.map((property) => {
              const isActive = selectedProperty?.id === property.id;
              return (
                <button
                  key={property.id}
                  onClick={() => { onSelect(property); setOpen(false); }}
                  className={`${s.item} ${isActive ? s.itemActive : ''}`}
                >
                  <div className={`${s.itemIcon} ${isActive ? s.itemIconActive : ''}`}>
                    <Building2
                      size={16}
                      style={{ color: isActive ? '#fff' : '#B08D4A' }}
                    />
                  </div>

                  <div className={s.itemText}>
                    <p className={`${s.itemName} ${isActive ? s.itemNameActive : ''}`}>
                      {property.name}
                    </p>
                    {property.address && (
                      <p className={s.itemAddress}>
                        <MapPin size={10} style={{ flexShrink: 0 }} />
                        {property.address}
                        {property.city ? `, ${property.city}` : ''}
                      </p>
                    )}
                  </div>

                  <div className={`${s.itemCheck} ${isActive ? s.itemCheckActive : ''}`}>
                    {isActive && <Check size={12} style={{ color: '#fff' }} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className={s.footer}>
            <p className={s.footerText}>Cambia de copropiedad en cualquier momento</p>
          </div>
        </div>
      </div>
    </div>
  );
}