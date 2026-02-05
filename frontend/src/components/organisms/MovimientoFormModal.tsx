import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import MovimientoForm from '@/components/molecules/MovimientoForm';
import { TipoMovimiento } from '@/types/Movimiento.types';

/**
 * MovimientoFormModal Organism - Modal para registrar movimientos
 *
 * Modal con backdrop blur y animaciones fluidas
 * Incluye formulario completo de movimientos
 * Cierra con ESC o click fuera
 * Bloquea scroll del body cuando está abierto
 */

interface MovimientoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  onSuccess: () => void;
  tipoDefault?: TipoMovimiento;
}

const MovimientoFormModal = ({
  isOpen,
  onClose,
  clienteId,
  onSuccess,
  tipoDefault,
}: MovimientoFormModalProps) => {
  /**
   * Maneja el éxito del formulario
   */
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  /**
   * Cierra el modal al presionar ESC
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Bloquea el scroll del body cuando el modal está abierto
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              relative w-full max-w-lg bg-white rounded-2xl shadow-2xl
              overflow-hidden
              max-h-[90vh] overflow-y-auto
            "
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-gray-800"
                >
                  Registrar Movimiento
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="
                    p-2 rounded-lg text-gray-500 hover:text-gray-700
                    hover:bg-gray-100 active:bg-gray-200
                    transition-colors duration-200
                  "
                  aria-label="Cerrar modal"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <MovimientoForm
                clienteId={clienteId}
                onSuccess={handleSuccess}
                onCancel={onClose}
                tipoDefault={tipoDefault}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MovimientoFormModal;
