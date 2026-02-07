import { apiClientSession } from '../utils/apiClient';

// LISTAR
export async function getAll() {
  const res = await apiClientSession('/phs');
  return res.json();
}

// CREAR
export async function create(payload: any) {
  const res = await apiClientSession('/phs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ACTUALIZAR
export async function update(id: string, payload: any) {
  const res = await apiClientSession(`/phs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ELIMINAR
export async function remove(id: string) {
  const res = await apiClientSession(`/phs/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
