import { apiClient } from './apiClient';
import { User } from './definitions';

// 🔹 Buscar usuario por ID
export async function getUserById(id: string): Promise<User> {
  const res = await apiClient(`/api/users/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener usuario por ID');
  }
  return res.json() as Promise<User>;
}

// 🔹 Eliminar usuario
export async function deleteUser(id: string) {
  const res = await apiClient(`/api/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar usuario');
  }
  return res.json();
}

// 🔹 Listar usuarios
export async function getUsers(): Promise<User[]> {
  const res = await apiClient('/api/users');
  if (!res.ok) {
    throw new Error('Error al obtener usuarios');
  }
  return res.json() as Promise<User[]>;
}

// 🔹 Crear usuario
export async function createUser(payload: Omit<User, 'id'>): Promise<User> {
  const res = await apiClient('/api/users/register', {
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
  const res = await apiClient(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar usuario');
  }
  return res.json() as Promise<User>;
}

// 🔹 Obtener perfil del usuario autenticado
export async function getUserProfile(): Promise<User> {
  const res = await apiClient('/api/users/getProfile');
  if (!res.ok) {
    throw new Error('Token inválido o expirado');
  }
  return res.json() as Promise<User>;
}

// 🔹 Buscar usuario por email
export async function getUserByEmail(email: string): Promise<User> {
  const res = await apiClient(`/api/users/email/${email}`);
  if (!res.ok) {
    throw new Error('Error al obtener usuario por email');
  }
  return res.json() as Promise<User>;
}
