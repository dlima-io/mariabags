import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '@/types/Cliente.types';
import api from '@/services/api';

/**
 * useDashboard Hook - Obtiene estadísticas del dashboard
 *
 * Maneja el estado de estadísticas, loading y errores
 * Proporciona datos agregados del sistema:
 * - Total de clientes activos
 * - Deuda total del sistema
 * - Pagos del mes actual
 * - Clientes con deuda
 */

interface UseDashboardReturn {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    deudaTotal: 0,
    pagosDelMes: 0,
    clientesConDeuda: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene estadísticas del dashboard
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamadas paralelas para mejorar performance
      const [clientesResponse, estadisticasResponse] = await Promise.all([
        api.get('/clientes/with-saldo'),
        api.get('/movimientos/estadisticas'),
      ]);

      const clientes = clientesResponse.data;
      const estadisticas = estadisticasResponse.data;

      // Calcular total de clientes activos
      const totalClientes = clientes.filter((c: any) => c.activo).length;

      // Calcular deuda total (suma de saldos positivos)
      const deudaTotal = clientes
        .filter((c: any) => c.activo && c.saldo > 0)
        .reduce((sum: number, c: any) => sum + c.saldo, 0);

      // Calcular clientes con deuda
      const clientesConDeuda = clientes.filter(
        (c: any) => c.activo && c.saldo > 0
      ).length;

      // Pagos del mes actual desde estadísticas
      const pagosDelMes = estadisticas.pagosDelMes || 0;

      setStats({
        totalClientes,
        deudaTotal,
        pagosDelMes,
        clientesConDeuda,
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch al montar
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export default useDashboard;
