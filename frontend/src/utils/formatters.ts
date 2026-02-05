/**
 * Formatea un número como moneda en pesos argentinos
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea una fecha en formato legible
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

/**
 * Formatea una fecha con hora
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Formatea un número de teléfono
 */
export const formatPhone = (phone: string): string => {
  // Remover caracteres no numéricos excepto +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Si es un número argentino (con código de país +54)
  if (cleaned.startsWith('+54')) {
    const withoutCountryCode = cleaned.substring(3);
    if (withoutCountryCode.length === 10) {
      return `+54 ${withoutCountryCode.substring(0, 3)} ${withoutCountryCode.substring(3, 7)}-${withoutCountryCode.substring(7)}`;
    }
  }

  return cleaned;
};

/**
 * Obtiene las iniciales de un nombre completo
 */
export const getInitials = (nombre: string, apellido: string): string => {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
};

/**
 * Formatea el nombre completo
 */
export const formatFullName = (nombre: string, apellido: string): string => {
  return `${nombre} ${apellido}`;
};
