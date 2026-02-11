import { TipoMovimiento } from '@/types/Movimiento.types';
import { formatCurrency } from './formatters';

const formatSaldo = (saldo: number): string => {
  if (saldo > 0) return `Tu deuda actual es de *${formatCurrency(saldo)}*`;
  if (saldo < 0) return `Tenés un saldo a favor de *${formatCurrency(Math.abs(saldo))}*`;
  return '*Tu cuenta quedó saldada* ✅';
};

export const buildMovimientoMessage = (
  tipo: TipoMovimiento,
  monto: number,
  observaciones: string | undefined,
  nuevoSaldo: number,
  nombre: string
): string => {
  const saldoText = formatSaldo(nuevoSaldo);

  switch (tipo) {
    case TipoMovimiento.DEBITO: {
      if (observaciones) {
        const itemsList = observaciones
          .split(' | ')
          .map(item => `  - ${item}`)
          .join('\n');
        return `Hola ${nombre}!\nHoy pasaste por el local y te llevaste:\n${itemsList}`;
      }
      return `Hola ${nombre}!\nHoy pasaste por el local e hiciste una compra de *${formatCurrency(monto)}*.\n${saldoText}.`;
    }
    case TipoMovimiento.CREDITO:
      return `Hola ${nombre}!\nRegistramos tu pago de *${formatCurrency(monto)}*.\n${saldoText}.\nGracias!`;
    case TipoMovimiento.AJUSTE:
      return `Hola ${nombre}!\nSe realizó un ajuste de *${formatCurrency(Math.abs(monto))}* en tu cuenta.\n${saldoText}.`;
  }
};

export const buildAjusteMessage = (
  tipoAjuste: 'MONTO' | 'PORCENTAJE',
  valor: number,
  nuevoSaldo: number,
  nombre: string
): string => {
  const saldoText = formatSaldo(nuevoSaldo);
  if (tipoAjuste === 'MONTO') {
    return `Hola ${nombre}!\nSe realizó un ajuste de *${formatCurrency(Math.abs(valor))}* en tu cuenta.\n${saldoText}.`;
  } else {
    return `Hola ${nombre}!\nSe realizó un ajuste del *${Math.abs(valor)}%* sobre tu saldo.\n${saldoText}.`;
  }
};
