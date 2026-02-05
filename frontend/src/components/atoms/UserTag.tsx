import { User } from 'lucide-react';

/**
 * UserTag Atom - Muestra el usuario que registró el movimiento
 *
 * Visualiza de forma sutil quién realizó la acción para auditoría
 * Incluye icono de usuario de Lucide React
 */

interface UserTagProps {
  username: string;
  size?: 'sm' | 'md';
  className?: string;
}

const UserTag = ({
  username,
  size = 'sm',
  className = '',
}: UserTagProps) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-gray-500 ${sizeClasses[size]} ${className}`}>
      <User className={iconSizes[size]} />
      <span>Por:</span>
      <span className="font-medium text-gray-700">{username}</span>
    </span>
  );
};

export default UserTag;
