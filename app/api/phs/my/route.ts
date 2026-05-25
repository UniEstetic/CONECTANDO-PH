import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/auth.config';
import { getAll as getAllPhs } from '@/app/services/phs.service';
import { Phs } from '@/app/types/phs';

// Definición de campos requeridos para evitar "magic strings" y repetir tipos
const PROPERTY_FIELDS = 'id,name,address,city';
type MyProperty = Pick<Phs, 'id' | 'name' | 'address' | 'city'>;

// Determina si un error está relacionado con fallos de autenticación analizando el mensaje de la excepción.
function isUnauthorizedError(message: string): boolean {
  const normalized = message.toLowerCase();
  return ['sesion', 'expir', 'unauthorized'].some(key => normalized.includes(key));
}

export async function GET() {
  try {
    // 1. Verificación de identidad mediante la sesión
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: 'Sesión inválida o sin usuario asociado' },
        { status: 401 }
      );
    }

    // 2. Llamada al servicio con parámetros de paginación y filtrado
    const result = await getAllPhs({
      fields: PROPERTY_FIELDS,
      limit: '100',
      page: '1',
      user_id: userId,
    });

    // 3. Transformación de datos: Se desestructuran las propiedades para mayor claridad y rendimiento.
    
    const data: MyProperty[] = Array.isArray(result?.data)
      ? result.data.map(({ id, name, address, city }) => ({
          id,
          name,
          address,
          city,
        }))
      : [];

    // 4. Respuesta exitosa con desactivación de caché para datos dinámicos
    return NextResponse.json({ data }, {
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (error) {
    // 5. Gestión de excepciones y mapeo de estados HTTP
    const message = error instanceof Error ? error.message : 'Error al obtener copropiedades del usuario';

    const statusCode = isUnauthorizedError(message) ? 401 : 500;

    return NextResponse.json(
      { message },
      { status: statusCode }
    );
  }
}