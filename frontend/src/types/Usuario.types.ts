export enum RolUsuario {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface Usuario {
  id: string;
  username: string;
  rol: RolUsuario;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
}
