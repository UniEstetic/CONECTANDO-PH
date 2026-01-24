import { apiClient } from './apiClient';

// LISTAR ROLES
export async function getRoles() {
	const res = await apiClient('/api/roles');
	return res.json();
}

// CREAR ROL
export async function createRole(payload: any) {
	const res = await apiClient('/api/roles', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
	return res.json();
}

// ACTUALIZAR ROL
export async function updateRole(id: string, payload: any) {
	const res = await apiClient(`/api/roles/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
	return res.json();
}

// ELIMINAR ROL
export async function deleteRole(id: string) {
	const res = await apiClient(`/api/roles/${id}`, {
		method: 'DELETE',
	});
	return res.json();
}
