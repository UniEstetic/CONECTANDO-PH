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

export function PropertyProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto principal: Extrae las propiedades de la sesión del usuario
  useEffect(() => {
    // Si no está autenticado, dejamos de cargar y salimos
    if (status !== 'authenticated' || !session?.user) {
      if (status !== 'loading') setIsLoading(false);
      return;
    }

    const user = session.user as any;
    let list: Property[] = [];

    // Verificamos si el usuario trae una lista de copropiedades o solo una
    if (Array.isArray(user.ownerships) && user.ownerships.length > 0) {
      list = user.ownerships;
    } else if (user.ownership) {
      list = [user.ownership];
    }

    setProperties(list);

    if (list.length === 0) {
      setIsLoading(false);
      return;
    }

    // Lógica para decidir cuál propiedad mostrar al entrar
    const storedId = getStoredId();
    const stored = list.find(p => p.id === storedId);

    if (stored) {
      // 1. Si el ID guardado en el navegador existe en su lista actual
      setSelectedProperty(stored);
    } else if (list.length === 1) {
      // 2. Si solo tiene una propiedad, la seleccionamos por defecto
      setSelectedProperty(list[0]);
      storeId(list[0].id);
    } else {
      // 3. Si tiene varias pero ninguna guardada, seleccionamos la primera
      setSelectedProperty(list[0]);
      storeId(list[0].id);
    }

    setIsLoading(false);
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