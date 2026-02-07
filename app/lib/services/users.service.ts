import { apiClientSession } from '../utils/apiClient';
import { User } from '../definitions/users';

// 🔹 Buscar usuario por ID
export async function getUserById(id: string): Promise<User> {
  const res = await apiClientSession(`/users/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener usuario por ID');
  }
  return res.json() as Promise<User>;
}

// 🔹 Eliminar usuario
export async function deleteUser(id: string) {
  const res = await apiClientSession(`/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar usuario');
  }
  return res.json();
}

// 🔹 Listar usuarios
export async function getUsers(): Promise<User[]> {
  const res = await apiClientSession('/users');
  if (!res.ok) {
    throw new Error('Error al obtener usuarios');
  }
  return res.json() as Promise<User[]>;
}

// 🔹 Crear usuario
export async function createUser(payload: Omit<User, 'id'>): Promise<User> {
  const res = await apiClientSession('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear usuario');
  }
  return res.json() as Promise<User>;
}

// 🔹 Actualizar usuario
export async function updateUser(
  id: string,
  payload: Partial<User>
): Promise<User> {
  const res = await apiClientSession(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar usuario');
  }
  return res.json() as Promise<User>;
}

// 🔹 Buscar usuario por email
export async function getUserByEmail(email: string): Promise<User> {
  const res = await apiClientSession(`/users/email/${email}`);
  if (!res.ok) {
    throw new Error('Error al obtener usuario por email');
  }
  return res.json() as Promise<User>;
}
