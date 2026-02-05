import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, User } from 'lucide-react';
import { movimientoService } from '@/services/movimientoService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Spinner from '@/components/atoms/Spinner';
import { toast } from 'react-hot-toast';

/**
 * PagosDelMesModal - Modal que muestra el detalle de todos los pagos del mes
 *
 * Features:
 * - Lista de pagos ordenados por fecha
 * - Información del cliente que realizó el pago
 * - Monto y fecha de cada pago
 * - Observaciones si existen
 * - Total de pagos del mes
 * - Cierre con ESC o click fuera
 */

interface PagoDelMes {
  id: string;
  monto: number;
  fecha: string;
  observaciones?: string;
  cliente_id: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

interface PagosDelMesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PagosDelMesModal = ({ isOpen, onClose }: PagosDelMesModalProps) => {
  const [pagos, setPagos] = useState<PagoDelMes[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Obtiene los pagos del mes cuando se abre el modal
   */
  useEffect(() => {
    if (isOpen) {
      fetchPagos();
    }
  }, [isOpen]);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const data = await movimientoService.getPagosDelMes();
      setPagos(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar pagos del mes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula el total de pagos del mes
   */
  const totalPagos = pagos.reduce((sum, pago) => sum + pago.monto, 0);

  /**
   * Maneja el cierre del modal con ESC
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="
                bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl
                w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh]
                flex flex-col
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Pagos del Mes
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="
                    w-10 h-10 rounded-full bg-gray-100
                    flex items-center justify-center
                    text-gray-600 hover:bg-gray-200 hover:text-gray-900
                    transition-colors duration-200
                  "
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Spinner />
                    <p className="text-gray-500 font-medium">Cargando pagos...</p>
                  </div>
                ) : pagos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <DollarSign className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                      No hay pagos registrados
                    </h3>
                    <p className="text-gray-500">
                      No se registraron pagos en el mes actual
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pagos.map((pago, index) => (
                      <motion.div
                        key={pago.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="
                          bg-gray-50 rounded-xl p-4
                          border border-gray-200
                          hover:border-primary-300 hover:bg-primary-50/30
                          transition-all duration-200
                        "
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Cliente */}
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-gray-500 shrink-0" />
                              <p className="font-semibold text-gray-900 truncate">
                                {pago.nombre} {pago.apellido}
                              </p>
                            </div>

                            {/* Fecha */}
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                              <p className="text-sm text-gray-600">
                                {formatDate(pago.fecha)}
                              </p>
                            </div>

                            {/* Observaciones */}
                            {pago.observaciones && (
                              <p className="text-sm text-gray-500 italic mt-2">
                                {pago.observaciones}
                              </p>
                            )}
                          </div>

                          {/* Monto */}
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(pago.monto)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer con total */}
              {pagos.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total del mes</p>
                      <p className="text-xs text-gray-500">
                        {pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalPagos)}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PagosDelMesModal;
