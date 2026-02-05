import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * DateDisplay Atom - Muestra fechas con formato consistente
 *
 * Soporta múltiples formatos:
 * - short: 20/01/2024
 * - long: 20 de Enero, 2024
 * - relative: Hace 2 días
 * - Opción para mostrar hora: 20/01/2024 14:30
 */

interface DateDisplayProps {
  date: Date | string;
  format?: 'short' | 'long' | 'relative';
  showTime?: boolean;
  className?: string;
}

const DateDisplay = ({
  date,
  format: formatType = 'short',
  showTime = false,
  className = '',
}: DateDisplayProps) => {
  // Convertir a Date si es string
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Verificar que la fecha sea válida
  if (isNaN(dateObj.getTime())) {
    return <span className={`text-gray-400 text-sm ${className}`}>Fecha inválida</span>;
  }

  /**
   * Obtiene el formato de fecha según el tipo
   */
  const getFormattedDate = (): string => {
    try {
      switch (formatType) {
        case 'short':
          return format(dateObj, showTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');
        case 'long':
          return format(dateObj, "d 'de' MMMM, yyyy", { locale: es });
        case 'relative':
          return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
        default:
          return format(dateObj, 'dd/MM/yyyy');
      }
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <time
      dateTime={dateObj.toISOString()}
      className={`text-gray-600 text-sm ${className}`}
    >
      {getFormattedDate()}
    </time>
  );
};

export default DateDisplay;
