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
  fecha: Date;
  observaciones: string | null;
}

export interface CreateMovimientoDTO {
  cliente_id: string;
  tipo: TipoMovimiento;
  monto: number;
  observaciones?: string;
}

export interface UpdateMovimientoDTO {
  observaciones?: string;
}
