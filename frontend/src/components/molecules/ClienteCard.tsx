import { motion } from 'framer-motion';
import { MessageCircle, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClienteConSaldo } from '@/types/Cliente.types';
import Badge from '@/components/atoms/Badge';

/**
 * ClienteCard Molecule - Card para mostrar información de un cliente
 *
 * Muestra avatar con iniciales, nombre, teléfono y estado
 * Botón flotante de WhatsApp
 * Botón de eliminar/desactivar
 * Animaciones de hover y tap
 * Click en card para ver detalles
 */

interface ClienteCardProps {
  cliente: ClienteConSaldo;
  onWhatsAppClick: (cliente: ClienteConSaldo) => void;
  onDeleteClick: (cliente: ClienteConSaldo) => void;
  onEditClick?: (cliente: ClienteConSaldo) => void;
  onClick?: (cliente: ClienteConSaldo) => void;
}

const ClienteCard = ({
  cliente,
  onWhatsAppClick,
  onDeleteClick,
  onEditClick,
  onClick,
}: ClienteCardProps) => {
  const navigate = useNavigate();

  // Generar iniciales del nombre
  const getInitials = (nombre: string, apellido: string): string => {
    const firstInitial = nombre.charAt(0).toUpperCase();
    const lastInitial = apellido.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  // Formatear teléfono para mostrar
  const formatPhone = (phone: string): string => {
    // Si el teléfono tiene +54, formatear como argentino
    if (phone.startsWith('+54')) {
      const number = phone.slice(3);
      if (number.length === 10) {
        return `+54 ${number.slice(0, 3)} ${number.slice(3, 7)}-${number.slice(7)}`;
      }
    }
    return phone;
  };

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  // Determinar variante del badge según el saldo
  const getSaldoBadgeVariant = (saldo: number): 'danger' | 'success' | 'neutral' => {
    if (saldo > 0) return 'danger'; // Debe dinero (rojo)
    if (saldo < 0) return 'success'; // A favor (verde)
    return 'neutral'; // Saldado (gris)
  };

  // Texto del badge de saldo
  const getSaldoText = (saldo: number): string => {
    if (saldo > 0) return `Debe ${formatCurrency(saldo)}`;
    if (saldo < 0) return `A favor ${formatCurrency(saldo)}`;
    return 'Saldado';
  };

  // Manejar click en WhatsApp
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWhatsAppClick(cliente);
  };

  // Manejar click en eliminar
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(cliente);
  };

  // Manejar click en editar
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(cliente);
    }
  };

  // Manejar click en card
  const handleCardClick = () => {
    if (onClick) {
      onClick(cliente);
    } else {
      // Si no hay onClick personalizado, navegar al detalle
      navigate(`/clientes/${cliente.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(236, 72, 153, 0.15)' }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className={`
        bg-white rounded-xl shadow-md p-5 relative
        cursor-pointer
        border-2 border-transparent
        hover:border-primary-200
        transition-all duration-200
        ${!cliente.activo ? 'opacity-60' : ''}
      `}
    >
      {/* Header con avatar y nombre */}
      <div className="flex items-start gap-4 mb-3">
        {/* Avatar con iniciales */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="
            w-12 h-12 rounded-full
            bg-gradient-to-br from-primary-400 to-primary-600
            flex items-center justify-center
            text-white font-bold text-lg
            shadow-md
            flex-shrink-0
          "
        >
          {getInitials(cliente.nombre, cliente.apellido)}
        </motion.div>

        {/* Información del cliente */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg truncate">
            {cliente.nombre} {cliente.apellido}
          </h3>
          <p className="text-gray-500 text-sm truncate">
            {formatPhone(cliente.telefono)}
          </p>
        </div>

        {/* Botones de acción (solo si está activo) */}
        {cliente.activo && (
          <div className="flex gap-1">
            {/* Botón de editar */}
            {onEditClick && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEditClick}
                className="
                  p-2 rounded-lg
                  text-blue-500 hover:text-blue-700
                  hover:bg-blue-50
                  transition-colors duration-200
                  min-w-touch min-h-touch
                  flex items-center justify-center
                "
                aria-label="Editar cliente"
              >
                <Edit className="w-5 h-5" />
              </motion.button>
            )}
            {/* Botón de eliminar */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDeleteClick}
              className="
                p-2 rounded-lg
                text-red-500 hover:text-red-700
                hover:bg-red-50
                transition-colors duration-200
                min-w-touch min-h-touch
                flex items-center justify-center
              "
              aria-label="Desactivar cliente"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Badges de estado y saldo */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge
          variant={cliente.activo ? 'success' : 'danger'}
          size="sm"
        >
          {cliente.activo ? 'Activo' : 'Inactivo'}
        </Badge>
        {cliente.activo && (
          <Badge
            variant={getSaldoBadgeVariant(cliente.saldo)}
            size="sm"
          >
            {getSaldoText(cliente.saldo)}
          </Badge>
        )}
      </div>

      {/* Botón flotante de WhatsApp */}
      {cliente.activo && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWhatsAppClick}
          className="
            absolute bottom-4 right-4
            w-11 h-11 rounded-full
            bg-[#25D366] hover:bg-[#20BA5A]
            text-white
            shadow-lg hover:shadow-xl
            flex items-center justify-center
            transition-all duration-200
          "
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </motion.button>
      )}

      {/* Fecha de creación (sutil en la parte inferior) */}
      <div className="text-xs text-gray-400 mt-2">
        Cliente desde {new Date(cliente.fecha_creacion).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </div>
    </motion.div>
  );
};

export default ClienteCard;
