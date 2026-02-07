import { apiClientSession } from '../utils/apiClient';
import { Agenda } from '../definitions/agenda';

// 🔹 Buscar usuario por ID
export async function getById(id: string): Promise<Agenda> {
  const res = await apiClientSession(`/users/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener usuario por ID');
  }
  return res.json() as Promise<Agenda>;
}

// 🔹 Eliminar usuario
export async function remove(id: string) {
  const res = await apiClientSession(`/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar usuario');
  }
  return res.json();
}

// 🔹 Listar usuarios
export async function getAll(): Promise<Agenda[]> {
  const res = await apiClientSession('/users');
  if (!res.ok) {
    throw new Error('Error al obtener usuarios');
  }
  return res.json() as Promise<Agenda[]>;
}

// 🔹 Crear usuario
export async function create(payload: Omit<Agenda, 'id'>): Promise<Agenda> {
  const res = await apiClientSession('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear usuario');
  }
  return res.json() as Promise<Agenda>;
}

// 🔹 Actualizar usuario
export async function update(
  id: string,
  payload: Partial<Agenda>
): Promise<Agenda> {
  const res = await apiClientSession(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar usuario');
  }
  return res.json() as Promise<Agenda>;
}