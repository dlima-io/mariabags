export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface ClienteConSaldo extends Cliente {
  saldo: number;
  ultima_operacion?: string;
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

export interface DashboardStats {
  totalClientes: number;
  deudaTotal: number;
  pagosDelMes: number;
  clientesConDeuda: number;
}
