export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  activo: boolean;
  fecha_creacion: Date;
}

export interface ClienteConSaldo extends Cliente {
  saldo: number;
}

export interface CreateClienteDTO {
  nombre: string;
  apellido: string;
  telefono: string;
}

export interface UpdateClienteDTO {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  activo?: boolean;
}
