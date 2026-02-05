import { useParams, Navigate } from 'react-router-dom';
import ClienteHistorial from '@/components/organisms/ClienteHistorial';

/**
 * ClienteDetalle Page - Página de detalle del cliente con historial
 *
 * Ruta: /clientes/:id
 * Muestra el historial completo de movimientos de un cliente
 * Redirige a /clientes si no se proporciona un ID válido
 */

const ClienteDetalle = () => {
  const { id } = useParams<{ id: string }>();

  // Si no hay ID, redirigir a la lista de clientes
  if (!id) {
    return <Navigate to="/clientes" replace />;
  }

  return <ClienteHistorial clienteId={id} />;
};

export default ClienteDetalle;
