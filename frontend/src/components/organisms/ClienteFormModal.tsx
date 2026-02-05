import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ClienteForm from '@/components/molecules/ClienteForm';
import { Cliente, CreateClienteDTO } from '@/types/Cliente.types';

/**
 * ClienteFormModal Organism - Modal para agregar/editar clientes
 *
 * Overlay con backdrop blur
 * Card centrado con formulario
 * Botón de cerrar (X)
 * Animaciones de entrada/salida
 * Click fuera para cerrar
 * ESC para cerrar
 * Soporta modo edición si se pasa cliente
 */

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClienteDTO) => Promise<void>;
  isLoading?: boolean;
  initialData?: CreateClienteDTO;
  title?: string;
  cliente?: Cliente; // Si existe, es modo edición
}

const ClienteFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  title,
  cliente,
}: ClienteFormModalProps) => {
  // Determinar título según modo
  const modalTitle = title || (cliente ? 'Editar Cliente' : 'Agregar Cliente');

  // Determinar datos iniciales
  const formInitialData = cliente
    ? { nombre: cliente.nombre, apellido: cliente.apellido, telefono: cliente.telefono }
    : initialData;
  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar click en overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="
                    p-2 rounded-lg
                    bg-white/20 hover:bg-white/30
                    text-white
                    transition-colors duration-200
                    min-w-touch min-h-touch
                    flex items-center justify-center
                  "
                  aria-label="Cerrar modal"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Body con scroll */}
              <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <ClienteForm
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  isLoading={isLoading}
                  initialData={formInitialData}
                />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ClienteFormModal;
