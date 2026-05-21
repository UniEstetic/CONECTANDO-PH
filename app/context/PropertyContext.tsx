'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Interfaz que define la estructura de una Copropiedad
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

interface PropertyApiResponse {
  data?: unknown;
}

// Definición de los valores que el Contexto compartirá con toda la app
interface PropertyContextValue {
  // Todas las copropiedades a las que el usuario tiene acceso 
  properties: Property[];
  // La copropiedad seleccionada actualmente (null mientras carga)
  selectedProperty: Property | null;
  // Función para seleccionar una copropiedad y guardarla en el navegador
  selectProperty: (property: Property) => void;
  // Indica si se debe mostrar el modal de selección inicial
  showModal: boolean;
  // Cierra el modal (selecciona la primera propiedad si no se eligió ninguna)
  closeModal: () => void;
  // Indica si el usuario tiene más de una propiedad asignada
  hasMultipleProperties: boolean;
  // Atajo para obtener solo el ID de la propiedad seleccionada
  selectedPropertyId: string | undefined;
  // True mientras se resuelve la sesión o los datos del localStorage
  isLoading: boolean;
}

const PropertyContext = createContext<PropertyContextValue | null>(null);

// Clave para guardar la selección en la memoria del navegador
const STORAGE_KEY = 'selected_property_id';

// Función auxiliar para recuperar el ID guardado
function getStoredId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

// Función auxiliar para guardar el ID en el navegador
function storeId(id: string) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, id);
}

function normalizeProperties(input: unknown): Property[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => ({
      id: item?.id,
      name: item?.name,
      tax_id: item?.tax_id,
      address: item?.address,
      city: item?.city,
      country: item?.country,
      state: item?.state,
      logo_url: item?.logo_url,
    }))
    .filter((item) => !!item.id && !!item.name);
}

function pickSelectedProperty(list: Property[]): Property | null {
  if (list.length === 0) return null;

  const storedId = getStoredId();
  const fromStorage = list.find((property) => property.id === storedId);
  const selected = fromStorage ?? list[0];

  if (selected?.id) {
    storeId(selected.id);
  }

  return selected;
}

export function PropertyProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto principal: Carga las propiedades del usuario desde API interna.
  useEffect(() => {
    let isCancelled = false;

    async function hydrateProperties() {
      if (status === 'loading') {
        setIsLoading(true);
        return;
      }

      if (status !== 'authenticated' || !session?.user) {
        if (isCancelled) return;
        setProperties([]);
        setSelectedProperty(null);
        setShowModal(false);
        setIsLoading(false);
        return;
      }

      if (!session.user?.id) {
        if (isCancelled) return;
        setProperties([]);
        setSelectedProperty(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/phs/my', {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          if (isCancelled) return;
          setProperties([]);
          setSelectedProperty(null);
          setIsLoading(false);
          return;
        }

        const body = (await res.json()) as PropertyApiResponse;
        const fromApi = normalizeProperties(body?.data);

        if (isCancelled) return;
        setProperties(fromApi);
        setSelectedProperty(pickSelectedProperty(fromApi));
        setIsLoading(false);
      } catch {
        if (isCancelled) return;
        setProperties([]);
        setSelectedProperty(null);
        setIsLoading(false);
      }
    }

    hydrateProperties();

    return () => {
      isCancelled = true;
    };

  }, [session, status]);

  // Función para cambiar de propiedad manualmente
  const selectProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
    storeId(property.id); // Guardar para la próxima visita
    setShowModal(false);
  }, []);

  // Función para cerrar el modal de selección
  const closeModal = useCallback(() => {
    // Si el usuario intenta cerrar sin elegir, forzamos la primera de la lista
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0]);
      storeId(properties[0].id);
    }
    setShowModal(false);
  }, [selectedProperty, properties]);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        selectedProperty,
        selectProperty,
        showModal,
        closeModal,
        hasMultipleProperties: properties.length > 1,
        selectedPropertyId: selectedProperty?.id,
        isLoading,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

// Hook personalizado para usar este contexto en cualquier parte de la app
export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) {
    throw new Error('useProperty debe ser usado dentro de un PropertyProvider');
  }
  return ctx;
}