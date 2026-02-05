export enum RolUsuario {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface Usuario {
  id: string;
  username: string;
  password_hash: string;
  rol: RolUsuario;
}

export interface CreateUsuarioDTO {
  username: string;
  password: string;
  rol: RolUsuario;
}

export interface UpdateUsuarioDTO {
  username?: string;
  password?: string;
  rol?: RolUsuario;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: {
    id: string;
    username: string;
    rol: RolUsuario;
  };
}
