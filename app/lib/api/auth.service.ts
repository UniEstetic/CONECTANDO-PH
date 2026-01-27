const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Provider {
  id: string;
  name: string;
  providerId: string;
  description: string;
  logoUrl: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  roles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    sessionToken: string;
    expiresIn: number;
  };
  message: string;
}

class AuthService {
  /**
   * 1. Obtener lista de proveedores disponibles
   */
  async getProviders(): Promise<Provider[]> {
    try {
      const response = await fetch(`${API_URL}/providers`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener proveedores');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getProviders:', error);
      throw error;
    }
  }

  
    // Asignar proveedor y obtener token de proveedor
  async assignProvider(
    providerId: string,
    clientId: string = 'cliente',
    clientSecret: string = 'secreto12345'
  ): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/providers/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          clientId,
          clientSecret,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al asignar proveedor');
      }

      // Guardar el token de proveedor temporalmente
      this.saveProviderToken(data.data.token);

      return data.data.token;
    } catch (error) {
      console.error('Error en assignProvider:', error);
      throw error;
    }
  }

  /**
   * 3. Login con email, password y token de proveedor
   */
  async login(email: string, password: string, providerToken?: string): Promise<AuthResponse> {
    try {
      // Si no se proporciona providerToken, intentar obtenerlo del storage
      const token = providerToken || this.getProviderToken();
      
      if (!token) {
        throw new Error('No hay token de proveedor disponible');
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          providerToken: token,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar el token de sesión
      this.saveSessionToken(data.data.sessionToken);
      
      // Limpiar el token de proveedor ya que ya no se necesita
      this.clearProviderToken();

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Validar token de sesión
   */
  async validateSession(sessionToken?: string): Promise<User> {
    try {
      const token = sessionToken || this.getSessionToken();
      
      if (!token) {
        throw new Error('No hay token de sesión');
      }

      const response = await fetch(`${API_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error('Sesión inválida');
      }

      return data.data;
    } catch (error) {
      console.error('Error en validateSession:', error);
      throw error;
    }
  }

  /**
   * Flujo completo de autenticación
   * Útil para simplificar el proceso en el frontend
   */
  async loginComplete(email: string, password: string): Promise<AuthResponse> {
    try {
      // 1. Obtener proveedores
      const providers = await this.getProviders();
      
      if (providers.length === 0) {
        throw new Error('No hay proveedores disponibles');
      }

      // 2. Usar el primer proveedor (o puedes seleccionar uno específico)
      const providerId = providers[0].providerId;
      
      // 3. Asignar proveedor y obtener token
      const providerToken = await this.assignProvider(providerId);

      // 4. Login con email y password
      return await this.login(email, password, providerToken);
    } catch (error) {
      console.error('Error en loginComplete:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearSessionToken();
    this.clearProviderToken();
  }

  // ============= MÉTODOS DE STORAGE =============

  /**
   * Guardar token de proveedor en localStorage
   */
  private saveProviderToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('providerToken', token);
    }
  }

  /**
   * Obtener token de proveedor de localStorage
   */
  private getProviderToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('providerToken');
    }
    return null;
  }

  /**
   * Eliminar token de proveedor
   */
  private clearProviderToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('providerToken');
    }
  }

  /**
   * Guardar token de sesión en localStorage
   */
  saveSessionToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionToken', token);
    }
  }

  /**
   * Obtener token de sesión de localStorage
   */
  getSessionToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionToken');
    }
    return null;
  }

  /**
   * Eliminar token de sesión
   */
  clearSessionToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken');
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getSessionToken();
  }
}

export const authService = new AuthService();