"use client";
import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser, getUserById, getUserByEmail, updateUser } from '../lib/users.service';



export default function TestConexionPage() {


  // Estado para actualizar usuario
  const [updateId, setUpdateId] = useState('');
  const [updateData, setUpdateData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    document_type: '',
    document_number: '',
    phone_number: '',
    type_person: '',
    gender: '',
  });
  const [updateError, setUpdateError] = useState('');

  // Eliminado feedback UI para evitar problemas de hidratación

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    if (!updateId) {
      setUpdateError('Ingresa un ID');
      return;
    }
    try {
      await updateUser(updateId, updateData);
      alert('Usuario actualizado exitosamente');
      setUpdateId('');
      setUpdateData({
        first_name: '', last_name: '', email: '', document_type: '', document_number: '', phone_number: '', type_person: '', gender: ''
      });
    } catch (e: any) {
      setUpdateError(e?.message || 'No se pudo actualizar el usuario');
      alert(e?.message || 'No se pudo actualizar el usuario');
    }
  };
  // Estado para búsqueda por email
  const [searchEmail, setSearchEmail] = useState('');
  const [userByEmail, setUserByEmail] = useState<any | null>(null);
  const [searchEmailError, setSearchEmailError] = useState('');

  const handleSearchByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserByEmail(null);
    setSearchEmailError('');
    if (!searchEmail) {
      setSearchEmailError('Ingresa un email');
      return;
    }
    try {
      const res = await getUserByEmail(searchEmail);
      setUserByEmail(res.data || res); // por si la respuesta viene anidada
    } catch (e: any) {
      setSearchEmailError(e?.message || 'No se encontró el usuario');
    }
  };
  // Estado para búsqueda por ID
  const [searchId, setSearchId] = useState('');
  const [userById, setUserById] = useState<any | null>(null);
  const [searchError, setSearchError] = useState('');

  const handleSearchById = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserById(null);
    setSearchError('');
    if (!searchId) {
      setSearchError('Ingresa un ID');
      return;
    }
    try {
      const res = await getUserById(searchId);
      setUserById(res.data || res); // por si la respuesta viene anidada
    } catch (e: any) {
      setSearchError(e?.message || 'No se encontró el usuario');
    }
  };
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ensure users are only fetched on client
  useEffect(() => {
    // Do not fetch on SSR, only on client
    // Optionally, you can auto-fetch users here if desired
    // handleListUsers();
  }, []);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    document_type: '',
    document_number: '',
    phone_number: '',
    type_person: '', // Obligatorio
    gender: '',      // Opcional
  });
  // Para evitar el warning de hidratación
  // Eliminado isClient para evitar problemas de hidratación

  const handleListUsers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Only run on client
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (e) {
      setError('Error al obtener usuarios');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string | number) => {
   
    // Confirmación solo en cliente
    setConfirmDelete({ id });
  };

  // Estado para confirmación de borrado
  const [confirmDelete, setConfirmDelete] = useState<{ id: string | number } | null>(null);
  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await deleteUser(String(confirmDelete.id));
      let msg = '';
      if (typeof res === 'string') msg = res;
      else if (res?.message) msg = res.message;
      else if (res?.data?.message) msg = res.data.message;
      else if (res?.data?.status) msg = res.data.status;
      else if (res?.status) msg = res.status;
      else msg = JSON.stringify(res);
      alert('Usuario eliminado exitosamente');
      // Refrescar lista tras eliminar
      const updated = await getUsers();
      setUsers(updated.data || []);
    } catch (e: any) {
      setError(e?.message || 'Error al eliminar usuario');
      alert(e?.message || 'Error al eliminar usuario');
    }
    setLoading(false);
    setConfirmDelete(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await createUser(form);
      let msg = '';
      if (typeof res === 'string') msg = res;
      else if (res?.message) msg = res.message;
      else if (res?.data?.message) msg = res.data.message;
      else if (res?.data?.status) msg = res.data.status;
      else if (res?.status) msg = res.status;
      else msg = JSON.stringify(res);
      alert('Usuario creado exitosamente');
      // Ya se muestra alert más arriba
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        document_type: '',
        document_number: '',
        phone_number: '',
        type_person: '',
        gender: '',
      });
      await handleListUsers();
    } catch (e: any) {
      if (e?.response) {
        const errMsg = e.response.data?.message || e.response.data?.error || e.message || 'Error al crear usuario';
        setError(errMsg);
        alert(errMsg);
      } else {
        setError(e?.message || 'Error al crear usuario');
        alert(e?.message || 'Error al crear usuario');
      }
    }
    setLoading(false);
  };


  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', background: '#f7f7fa', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, marginBottom: 32, color: '#1a237e', letterSpacing: 1 }}>Gestión de Usuarios (Test)</h1>

      {/* Tabla de usuarios */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ flex: '2 1 400px', minWidth: 340 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, color: '#222', margin: 0 }}>Usuarios Registrados</h2>
            <button onClick={handleListUsers} disabled={loading} style={{ padding: '8px 18px', background: loading ? '#aaa' : '#388e3c', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #0001', transition: 'background 0.2s' }}>Listar Usuarios</button>
          </div>
          {users.length > 0 && (
            <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 2px 8px #0001', background: '#fff' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 500, background: '#fff', borderRadius: 8, overflow: 'hidden', marginBottom: 0 }}>
                <thead style={{ background: '#1976d2' }}>
                  <tr>
                    <th style={{ color: '#fff', padding: 12, fontWeight: 700 }}>ID</th>
                    <th style={{ color: '#fff', padding: 12, fontWeight: 700 }}>Nombre</th>
                    <th style={{ color: '#fff', padding: 12, fontWeight: 700 }}>Apellido</th>
                    <th style={{ color: '#fff', padding: 12, fontWeight: 700 }}>Email</th>
                    <th style={{ color: '#fff', padding: 12, fontWeight: 700 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any, idx: number) => (
                    <tr key={user.id} style={{ background: idx % 2 === 0 ? '#f4f8ff' : '#fff' }}>
                      <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{user.id}</td>
                      <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{user.first_name}</td>
                      <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{user.last_name}</td>
                      <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{user.email}</td>
                      <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>
                        <button onClick={() => handleDeleteUser(user.id)} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }} disabled={loading}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* CRUD en filas de dos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        <div style={{ display: 'flex', gap: 40, width: '100%', flexWrap: 'wrap' }}>
          {/* Actualizar usuario por ID */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 10, boxShadow: '0 2px 12px #0002', marginBottom: 32, minWidth: 320, maxWidth: 420, flex: 1 }}>
            <h2 style={{ fontSize: 20, marginBottom: 14, color: '#222' }}>Actualizar usuario por ID</h2>
            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
              <input type="text" placeholder="ID de usuario" value={updateId} onChange={e => setUpdateId(e.target.value)} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <input placeholder="Nombre" value={updateData.first_name} onChange={e => setUpdateData(d => ({ ...d, first_name: e.target.value }))} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <input placeholder="Apellido" value={updateData.last_name} onChange={e => setUpdateData(d => ({ ...d, last_name: e.target.value }))} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <input placeholder="Email" value={updateData.email} onChange={e => setUpdateData(d => ({ ...d, email: e.target.value }))} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <input placeholder="Tipo de documento" value={updateData.document_type} onChange={e => setUpdateData(d => ({ ...d, document_type: e.target.value }))} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <input placeholder="Número de documento" value={updateData.document_number} onChange={e => setUpdateData(d => ({ ...d, document_number: e.target.value }))} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <input placeholder="Teléfono" value={updateData.phone_number} onChange={e => setUpdateData(d => ({ ...d, phone_number: e.target.value }))} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <input placeholder="Tipo de persona" value={updateData.type_person} onChange={e => setUpdateData(d => ({ ...d, type_person: e.target.value }))} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <input placeholder="Género" value={updateData.gender} onChange={e => setUpdateData(d => ({ ...d, gender: e.target.value }))} style={{ padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <button type="submit" style={{ padding: '10px 18px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>Actualizar</button>
            </form>
            {updateError && <div style={{ color: 'red', marginTop: 8 }}>{updateError}</div>}
          </div>
          {/* Buscar usuario por Email */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 10, boxShadow: '0 2px 12px #0002', marginBottom: 32, minWidth: 320, maxWidth: 420, flex: 1 }}>
            <h2 style={{ fontSize: 20, marginBottom: 14, color: '#222' }}>Buscar usuario por Email</h2>
            <form onSubmit={handleSearchByEmail} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input type="email" placeholder="Email de usuario" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <button type="submit" style={{ padding: '10px 18px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Buscar</button>
            </form>
            {userByEmail && (
              <div style={{ background: '#e3f2fd', borderRadius: 6, padding: 12, marginTop: 8, fontSize: 15 }}>
                <div><b>ID:</b> {userByEmail.id}</div>
                <div><b>Nombre:</b> {userByEmail.first_name} {userByEmail.last_name}</div>
                <div><b>Email:</b> {userByEmail.email}</div>
              </div>
            )}
            {searchEmailError && <div style={{ color: 'red', marginTop: 8 }}>{searchEmailError}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, width: '100%', flexWrap: 'wrap' }}>
          {/* Buscar usuario por ID */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 10, boxShadow: '0 2px 12px #0002', marginBottom: 32, minWidth: 320, maxWidth: 420, flex: 1 }}>
            <h2 style={{ fontSize: 20, marginBottom: 14, color: '#222' }}>Buscar usuario por ID</h2>
            <form onSubmit={handleSearchById} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input type="text" placeholder="ID de usuario" value={searchId} onChange={e => setSearchId(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} />
              <button type="submit" style={{ padding: '10px 18px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Buscar</button>
            </form>
            {userById && (
              <div style={{ background: '#e3f2fd', borderRadius: 6, padding: 12, marginTop: 8, fontSize: 15 }}>
                <div><b>ID:</b> {userById.id}</div>
                <div><b>Nombre:</b> {userById.first_name} {userById.last_name}</div>
                <div><b>Email:</b> {userById.email}</div>
                <div><b>Tipo de documento:</b> {userById.document_type}</div>
              </div>
            )}
            {searchError && <div style={{ color: 'red', marginTop: 8 }}>{searchError}</div>}
          </div>
          {/* Formulario de creación */}
          <form onSubmit={handleCreateUser} style={{ background: '#fff', padding: 28, borderRadius: 10, boxShadow: '0 2px 16px #0002', marginBottom: 32, maxWidth: 420, minWidth: 320, flex: 1 }}>
            <h2 style={{ fontSize: 22, marginBottom: 18, color: '#222' }}>Crear Usuario</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <input style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} placeholder="Nombre" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
              <input style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} placeholder="Apellido" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
              <input style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <input style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} placeholder="Tipo de documento" value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} required />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
              <input style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} placeholder="Número de documento" value={form.document_number} onChange={e => setForm(f => ({ ...f, document_number: e.target.value }))} required />
              <input style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} placeholder="Teléfono" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} required />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
              <input style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} placeholder="Tipo de persona (ej: NATURAL)" value={form.type_person} onChange={e => setForm(f => ({ ...f, type_person: e.target.value }))} required />
              <input style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }} placeholder="Género (ej: M o F)" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} />
            </div>
            <button type="submit" style={{ marginTop: 22, padding: '12px 28px', background: loading ? '#aaa' : '#1976d2', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #0001', transition: 'background 0.2s', width: '100%' }} disabled={loading}>Crear Usuario</button>
          </form>
        </div>
      </div>

      {/* Mensajes de feedback eliminados, ahora se usa alert() */}

      {/* Modal de confirmación para eliminar usuario */}
      {confirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0003', minWidth: 320 }}>
            <div style={{ fontSize: 18, marginBottom: 18 }}>¿Seguro que deseas eliminar este usuario?</div>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 18px', borderRadius: 6, background: '#bbb', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmDeleteUser} style={{ padding: '8px 18px', borderRadius: 6, background: '#e53935', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
