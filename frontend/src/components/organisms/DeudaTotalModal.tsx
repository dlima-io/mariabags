import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, User, Calendar, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '@/services/clienteService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Spinner from '@/components/atoms/Spinner';
import { toast } from 'react-hot-toast';

/**
 * DeudaTotalModal - Modal que muestra el detalle de todos los clientes con deuda
 *
 * Features:
 * - Lista de clientes con deuda ordenados por monto
 * - Información de cada cliente: nombre, saldo, días sin pagar
 * - Click en nombre para ir al detalle del cliente
 * - Botón de WhatsApp con mensaje predeterminado
 * - Total de deudas en el footer
 * - Cierre con ESC o click fuera
 */

interface ClienteConDeuda {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  saldo: number;
  ultimo_pago: string | null;
  dias_sin_pagar: number | null;
}

interface DeudaTotalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeudaTotalModal = ({ isOpen, onClose }: DeudaTotalModalProps) => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<ClienteConDeuda[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Obtiene los clientes con deuda cuando se abre el modal
   */
  useEffect(() => {
    if (isOpen) {
      fetchClientes();
    }
  }, [isOpen]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const data = await clienteService.getClientesConDeudaDetalle();
      setClientes(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar clientes con deuda');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula el total de deudas
   */
  const totalDeuda = clientes.reduce((sum, cliente) => sum + cliente.saldo, 0);

  /**
   * Navega al detalle del cliente
   */
  const handleClienteClick = (clienteId: string) => {
    navigate(`/clientes/${clienteId}`);
    onClose();
  };

  /**
   * Genera el mensaje de WhatsApp para un cliente
   */
  const handleWhatsAppClick = (cliente: ClienteConDeuda) => {
    const ultimoPagoTexto = cliente.ultimo_pago
      ? formatDate(cliente.ultimo_pago)
      : 'nunca registrado';

    const mensaje = `Hola ${cliente.nombre}!

Te escribo desde María Bags para informarte que tu saldo adeudado es de *${formatCurrency(cliente.saldo)}*.

${cliente.ultimo_pago ? `Tu último pago fue el ${ultimoPagoTexto}.` : 'Aún no hemos registrado pagos de tu parte.'}

¿Cuándo podrías acercarte a realizar un pago?

¡Gracias!`;

    // Limpiar teléfono y crear URL de WhatsApp
    const telefonoLimpio = cliente.telefono.replace(/[^\d+]/g, '');
    const url = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
  };

  /**
   * Formatea los días sin pagar
   */
  const formatDiasSinPagar = (dias: number | null): string => {
    if (dias === null) return 'Nunca pagó';
    if (dias === 0) return 'Pagó hoy';
    if (dias === 1) return '1 día';
    return `${dias} días`;
  };

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
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Clientes con Deuda
                    </h2>
                    <p className="text-sm text-gray-500">
                      {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
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
                    <p className="text-gray-500 font-medium">Cargando clientes...</p>
                  </div>
                ) : clientes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <TrendingUp className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                      ¡Todos al día!
                    </h3>
                    <p className="text-gray-500">
                      No hay clientes con deuda pendiente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientes.map((cliente, index) => (
                      <motion.div
                        key={cliente.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="
                          bg-gray-50 rounded-xl p-4
                          border border-gray-200
                          hover:border-red-300 hover:bg-red-50/30
                          transition-all duration-200
                        "
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Cliente - Clickeable */}
                            <button
                              onClick={() => handleClienteClick(cliente.id)}
                              className="
                                flex items-center gap-2 mb-2 w-full text-left
                                hover:text-primary-600 transition-colors
                              "
                            >
                              <User className="w-4 h-4 text-gray-500 shrink-0" />
                              <p className="font-semibold text-gray-900 truncate hover:underline">
                                {cliente.nombre} {cliente.apellido}
                              </p>
                            </button>

                            {/* Días sin pagar */}
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                              <p className="text-sm text-gray-600">
                                {formatDiasSinPagar(cliente.dias_sin_pagar)}
                                {cliente.dias_sin_pagar !== null && cliente.dias_sin_pagar > 0 && ' sin pagar'}
                              </p>
                            </div>

                            {/* Último pago */}
                            {cliente.ultimo_pago && (
                              <p className="text-xs text-gray-500 mt-1">
                                Último pago: {formatDate(cliente.ultimo_pago)}
                              </p>
                            )}
                          </div>

                          {/* Monto y WhatsApp */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="text-lg font-bold text-red-600">
                              {formatCurrency(cliente.saldo)}
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleWhatsAppClick(cliente)}
                              className="
                                p-2 bg-green-500 hover:bg-green-600 rounded-lg
                                text-white transition-colors duration-200
                              "
                              title="Enviar mensaje por WhatsApp"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer con total */}
              {clientes.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Deuda total</p>
                      <p className="text-xs text-gray-500">
                        {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalDeuda)}
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

export default DeudaTotalModal;
