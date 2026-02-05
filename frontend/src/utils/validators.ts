/**
 * Valida formato de teléfono
 */
export const isValidPhone = (phone: string): boolean => {
  // Acepta números con o sin código de país (+54), mínimo 10 dígitos
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleaned);
};

/**
 * Valida formato de email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un nombre tenga al menos 2 caracteres
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

/**
 * Valida que un monto sea positivo
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0;
};

/**
 * Valida longitud de contraseña
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Valida username (alfanumérico y guiones bajos, 4-50 caracteres)
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{4,50}$/;
  return usernameRegex.test(username);
};
