import { apiClient } from './apiClient';

// LISTAR
export async function getPhs() {
  const res = await apiClient('/api/phs');
  return res.json();
}

// CREAR
export async function createPh(payload: any) {
  const res = await apiClient('/api/phs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ACTUALIZAR
export async function updatePh(id: string, payload: any) {
  const res = await apiClient(`/api/phs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ELIMINAR
export async function deletePh(id: string) {
  const res = await apiClient(`/api/phs/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
