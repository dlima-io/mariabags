import { useCallback } from 'react';
import clienteService from '@/services/clienteService';

/**
 * useWhatsApp Hook - Gestión de links de WhatsApp
 *
 * Genera y abre links de WhatsApp con mensajes personalizados
 * Formatea números de teléfono correctamente
 */

interface UseWhatsAppReturn {
  generateWhatsAppLink: (clienteId: string, message?: string) => Promise<void>;
  openWhatsApp: (phoneNumber: string, message?: string) => void;
}

export const useWhatsApp = (): UseWhatsAppReturn => {
  /**
   * Genera link de WhatsApp desde el backend y lo abre
   */
  const generateWhatsAppLink = useCallback(async (clienteId: string, message?: string) => {
    try {
      const url = await clienteService.getWhatsAppLink(clienteId, message);
      window.location.href = url;
    } catch (error: any) {
      console.error('Error al generar link de WhatsApp:', error);
      throw error;
    }
  }, []);

  /**
   * Abre WhatsApp directamente con número y mensaje
   * Útil para casos donde no se necesita consultar al backend
   */
  const openWhatsApp = useCallback((phoneNumber: string, message?: string) => {
    // Limpiar el número de teléfono (eliminar espacios, guiones, etc)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

    // Construir URL de WhatsApp
    const baseUrl = 'https://wa.me/';
    const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
    const url = `${baseUrl}${cleanPhone}${encodedMessage}`;

    // Usar location.href en lugar de window.open para compatibilidad con iOS Safari
    // (window.open es bloqueado después de async/await en iPhone)
    window.location.href = url;
  }, []);

  return {
    generateWhatsAppLink,
    openWhatsApp,
  };
};

export default useWhatsApp;
