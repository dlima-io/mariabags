export const APP_NAME = import.meta.env.VITE_APP_NAME || 'María Bags';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const WHATSAPP_DEFAULT_MESSAGE =
  import.meta.env.VITE_WHATSAPP_DEFAULT_MESSAGE ||
  'Hola! Te contacto desde María Bags';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

export const TIPO_MOVIMIENTO = {
  DEBITO: 'DEBITO',
  CREDITO: 'CREDITO',
  AJUSTE: 'AJUSTE',
} as const;

export const TIPO_MOVIMIENTO_LABELS = {
  DEBITO: 'Compra',
  CREDITO: 'Pago',
  AJUSTE: 'Ajuste',
} as const;

export const ROL_USUARIO = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const;

export const ROL_USUARIO_LABELS = {
  ADMIN: 'Administrador',
  STAFF: 'Staff',
} as const;

export const DIAS_MORA_ADVERTENCIA = 30;

export const STORAGE_KEYS = {
  TOKEN: 'mariabags_token',
  USER: 'mariabags_user',
} as const;
