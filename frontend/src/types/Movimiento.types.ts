export enum TipoMovimiento {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
  AJUSTE = 'AJUSTE'
}

export interface Movimiento {
  id: string;
  cliente_id: string;
  usuario_id: string;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  observaciones: string | null;
  usuario?: {
    username: string;
  };
}

export interface CreateMovimientoDTO {
  cliente_id: string;
  tipo: TipoMovimiento;
  monto: number;
  observaciones?: string;
}
