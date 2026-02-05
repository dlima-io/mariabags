import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, FileText } from 'lucide-react';
import { Movimiento, TipoMovimiento } from '@/types/Movimiento.types';
import MovimientoItem from '@/components/molecules/MovimientoItem';
import Spinner from '@/components/atoms/Spinner';

/**
 * MovimientosList Organism - Lista completa de movimientos
 *
 * Muestra todos los movimientos con animaciones stagger
 * Calcula saldo acumulado para cada movimiento
 * Incluye estados de loading, empty y error
 *
 * Optimizado con AnimatePresence para animaciones de entrada/salida
 */

interface MovimientosListProps {
  movimientos: Movimiento[];
  saldoActual: number; // Saldo actual del cliente
  loading: boolean;
  onRefresh: () => void;
  className?: string;
}

const MovimientosList = ({
  movimientos,
  saldoActual,
  loading,
  onRefresh,
  className = '',
}: MovimientosListProps) => {
  /**
   * Calcula el saldo acumulado para cada movimiento
   * Los movimientos vienen ordenados DESC (más reciente primero)
   * Empezamos con el saldo actual y vamos "deshaciendo" cada movimiento
   */
  const calcularSaldosAcumulados = (movs: Movimiento[], saldoInicial: number) => {
    let saldoEnEsePunto = saldoInicial;

    // Recorrer desde el más reciente al más antiguo
    return movs.map((mov) => {
      // El saldo DESPUÉS de este movimiento es el saldo actual en este punto
      const saldoDespuesDeEsteMovimiento = saldoEnEsePunto;

      // Ahora "deshacemos" este movimiento para calcular el saldo anterior
      if (mov.tipo === TipoMovimiento.DEBITO) {
        // Si fue una compra, la restamos para volver al saldo anterior
        saldoEnEsePunto -= mov.monto;
      } else if (mov.tipo === TipoMovimiento.CREDITO) {
        // Si fue un pago, lo sumamos para volver al saldo anterior
        saldoEnEsePunto += mov.monto;
      } else {
        // AJUSTE: lo restamos para volver al saldo anterior
        saldoEnEsePunto -= mov.monto;
      }

      return {
        ...mov,
        saldoAcumulado: saldoDespuesDeEsteMovimiento,
      };
    });
  };

  const movimientosConSaldo = calcularSaldosAcumulados(movimientos, saldoActual);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner />
        <p className="text-gray-500 font-medium">Cargando movimientos...</p>
      </div>
    );
  }

  // Empty state
  if (movimientos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"
        >
          <FileText className="w-10 h-10 text-gray-400" />
        </motion.div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          No hay movimientos registrados
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm">
          Aún no se han registrado compras, pagos o ajustes para este cliente.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className="
            px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg
            hover:bg-primary-600 active:bg-primary-700
            transition-all duration-200
            flex items-center gap-2
            min-h-touch
          "
        >
          <span>Registrar primer movimiento</span>
        </motion.button>
      </motion.div>
    );
  }

  // Lista de movimientos
  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence mode="popLayout">
        {movimientosConSaldo.map((movimiento, index) => (
          <MovimientoItem
            key={movimiento.id}
            movimiento={movimiento}
            showSaldoAcumulado
            index={index}
          />
        ))}
      </AnimatePresence>

      {/* Botón de refrescar al final */}
      {movimientos.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: movimientos.length * 0.05 + 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          className="
            w-full py-3 px-4 bg-gray-100 text-gray-600 rounded-lg
            hover:bg-gray-200 active:bg-gray-300
            transition-all duration-200
            flex items-center justify-center gap-2
            font-medium
            min-h-touch
          "
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </motion.button>
      )}
    </div>
  );
};

export default MovimientosList;
