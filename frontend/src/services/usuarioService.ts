import api from './api';

/**
 * Usuario Service - Servicios para gestión de usuarios
 */

export interface Usuario {
  id: string;
  username: string;
  rol: 'ADMIN' | 'STAFF';
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioDTO {
  username: string;
  password: string;
  rol: 'ADMIN' | 'STAFF';
}

export interface UpdateUsuarioDTO {
  username?: string;
  password?: string;
  rol?: 'ADMIN' | 'STAFF';
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export const usuarioService = {
  /**
   * Obtiene todos los usuarios (solo ADMIN)
   */
  getAllUsuarios: async (): Promise<Usuario[]> => {
    try {
      const response = await api.get<Usuario[]>('/usuarios');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener usuarios');
    }
  },

  /**
   * Obtiene un usuario por ID
   */
  getUsuarioById: async (id: string): Promise<Usuario> => {
    try {
      const response = await api.get<Usuario>(`/usuarios/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener usuario');
    }
  },

  /**
   * Crea un nuevo usuario (solo ADMIN)
   */
  createUsuario: async (data: CreateUsuarioDTO): Promise<Usuario> => {
    try {
      const response = await api.post<Usuario>('/usuarios', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al crear usuario');
    }
  },

  /**
   * Actualiza un usuario (solo ADMIN)
   */
  updateUsuario: async (id: string, data: UpdateUsuarioDTO): Promise<Usuario> => {
    try {
      const response = await api.put<Usuario>(`/usuarios/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al actualizar usuario');
    }
  },

  /**
   * Elimina un usuario (solo ADMIN)
   */
  deleteUsuario: async (id: string): Promise<void> => {
    try {
      await api.delete(`/usuarios/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al eliminar usuario');
    }
  },

  /**
   * Cambia la contraseña del usuario autenticado
   */
  changePassword: async (data: ChangePasswordDTO): Promise<void> => {
    try {
      await api.post('/usuarios/cambiar-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al cambiar contraseña');
    }
  },

  /**
   * Cambia el rol de un usuario (solo ADMIN)
   */
  changeRol: async (id: string, rol: 'ADMIN' | 'STAFF'): Promise<Usuario> => {
    try {
      const response = await api.patch<Usuario>(`/usuarios/${id}/rol`, { rol });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al cambiar rol');
    }
  },
};

export default usuarioService;
