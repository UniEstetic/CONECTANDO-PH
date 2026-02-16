import styles from '@/app/ui/styles/usuarios.module.css';
import Image from 'next/image';
import Link from 'next/link';
import UsuariosHeader from '@/app/components/UsuariosHeader';

const USUARIOS_DATA = [
  { id: 1, nombre: 'Carlos Rodríguez', rol: 'Propietario', ubicacion: 'Torre 1 - 402', email: 'carlos@email.com', activo: true },
  { id: 2, nombre: 'Ana María López', rol: 'Residente', ubicacion: 'Torre 2 - 101', email: 'ana.lopez@email.com', activo: true },
  { id: 3, nombre: 'Felipe Gómez', rol: 'Administrador', ubicacion: 'Oficina Adm', email: 'admin@copropiedad.com', activo: true },
  { id: 4, nombre: 'Marta Lucía Beltrán', rol: 'Inquilino', ubicacion: 'Torre 1 - 205', email: 'marta.b@email.com', activo: false },
];

export default function ListadoUsuariosPage() {
  return (
    <div className={styles.blockResidentes}>
      <main className={styles.containerResidentes}>
        <UsuariosHeader />

        <div className={styles.headerSection}>
          <div className={styles.titleGroup}>
            <Link href="/admin" className={styles.btnBack}>←</Link>
            <h1 className={styles.title}>Volver</h1>
          </div>
          <Link href="/admin/usuarios/crear" className={styles.btnBack}>+ Nuevo Usuario</Link>
        </div>

        {/* Buscador y Filtros */}
        <section className={styles.searchSection}>
          <input 
            type="text" 
            placeholder="Buscar por nombre, apto o email..." 
            className={styles.searchInput}
          />
          <select className={styles.filterSelect}>
            <option value="todos">Todos los roles</option>
            <option value="propietario">Propietarios</option>
            <option value="residente">Residentes</option>
          </select>
        </section>

        {/* Tabla de Usuarios */}
        <section className={styles.tableContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Ubicación</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {USUARIOS_DATA.map((user) => (
                <tr key={user.id}>
                  <td className={styles.userCell}>
                    <div className={styles.avatar}>
                      {user.nombre.charAt(0)}
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.nombre}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </td>
                  <td>{user.ubicacion}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[user.rol.toLowerCase()]}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <span className={user.activo ? styles.statusActive : styles.statusInactive}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button className={styles.btnIcon} title="Editar">✏️</button>
                    <button className={styles.btnIcon} title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}