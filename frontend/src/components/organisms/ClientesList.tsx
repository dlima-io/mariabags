import { motion, AnimatePresence } from 'framer-motion';
import { UserX } from 'lucide-react';
import { ClienteConSaldo } from '@/types/Cliente.types';
import ClienteCard from '@/components/molecules/ClienteCard';

/**
 * ClientesList Organism - Lista de clientes con animaciones
 *
 * Grid responsive (1 col móvil, 2-3 cols desktop)
 * Animación stagger al cargar
 * Estados: loading, empty, error
 * AnimatePresence para add/remove
 */

interface ClientesListProps {
  clientes: ClienteConSaldo[];
  loading: boolean;
  error?: string | null;
  onClienteClick?: (cliente: ClienteConSaldo) => void;
  onWhatsAppClick: (cliente: ClienteConSaldo) => void;
  onDeleteClick: (cliente: ClienteConSaldo) => void;
  onEditClick?: (cliente: ClienteConSaldo) => void;
}

const ClientesList = ({
  clientes,
  loading,
  error,
  onClienteClick,
  onWhatsAppClick,
  onDeleteClick,
  onEditClick,
}: ClientesListProps) => {
  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Loading state con skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-5 animate-pulse"
          >
            {/* Avatar skeleton */}
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            {/* Badge skeleton */}
            <div className="h-6 bg-gray-200 rounded-full w-20 mb-3" />
            {/* Fecha skeleton */}
            <div className="h-3 bg-gray-200 rounded w-32" />
          </motion.div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <UserX className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Error al cargar clientes</h3>
        <p className="text-red-600">{error}</p>
      </motion.div>
    );
  }

  // Empty state
  if (clientes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-2xl p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg"
        >
          <UserX className="w-10 h-10 text-primary-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay clientes</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Comienza agregando tu primer cliente para gestionar sus cuentas corrientes.
        </p>
      </motion.div>
    );
  }

  // Lista de clientes
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {clientes.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onClick={onClienteClick}
            onWhatsAppClick={onWhatsAppClick}
            onDeleteClick={onDeleteClick}
            onEditClick={onEditClick}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientesList;
