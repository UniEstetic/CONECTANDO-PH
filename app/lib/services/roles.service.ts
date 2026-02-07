import { apiClientSession } from '../utils/apiClient';

// LISTAR ROLES
export async function getAll() {
	const res = await apiClientSession('/roles');
	return res.json();
}

// CREAR ROL
export async function create(payload: any) {
	const res = await apiClientSession('/roles', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
	return res.json();
}

// ACTUALIZAR ROL
export async function update(id: string, payload: any) {
	const res = await apiClientSession(`/roles/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
	return res.json();
}

// ELIMINAR ROL
export async function remove(id: string) {
	const res = await apiClientSession(`/roles/${id}`, {
		method: 'DELETE',
	});
	return res.json();
}
