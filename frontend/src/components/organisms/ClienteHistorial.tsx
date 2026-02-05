import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ClienteConSaldo } from '@/types/Cliente.types';
import { Movimiento, TipoMovimiento } from '@/types/Movimiento.types';
import { clienteService } from '@/services/clienteService';
import { movimientoService } from '@/services/movimientoService';
import SaldoCard from '@/components/molecules/SaldoCard';
import FilterBar from '@/components/molecules/FilterBar';
import MovimientosList from '@/components/organisms/MovimientosList';
import MovimientoFormModal from '@/components/organisms/MovimientoFormModal';
import AjusteModal from '@/components/organisms/AjusteModal';
import Spinner from '@/components/atoms/Spinner';
import Button from '@/components/atoms/Button';

/**
 * ClienteHistorial Organism - Vista completa del historial de un cliente
 *
 * Componente principal que orquesta toda la funcionalidad del historial
 * - Carga datos del cliente y movimientos
 * - Gestiona filtros
 * - Maneja modal de registro
 * - Coordina actualizaciones
 */

type FilterType = 'TODOS' | TipoMovimiento;

interface ClienteHistorialProps {
  clienteId: string;
}

const ClienteHistorial = ({ clienteId }: ClienteHistorialProps) => {
  const navigate = useNavigate();

  // Estado
  const [cliente, setCliente] = useState<ClienteConSaldo | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>('TODOS');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [ajusteModalOpen, setAjusteModalOpen] = useState<boolean>(false);

  /**
   * Carga datos del cliente y movimientos
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar cliente CON SALDO y movimientos en paralelo
      const [clienteData, movimientosData] = await Promise.all([
        clienteService.getClienteByIdWithSaldo(clienteId),
        movimientoService.getMovimientosByCliente(clienteId),
      ]);

      setCliente(clienteData);
      setMovimientos(movimientosData);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    fetchData();
  }, [clienteId]);

  /**
   * Filtra movimientos según el filtro activo
   */
  const movimientosFiltrados = useMemo(() => {
    if (filter === 'TODOS') {
      return movimientos;
    }
    return movimientos.filter((m) => m.tipo === filter);
  }, [movimientos, filter]);

  /**
   * Calcula contadores para los filtros
   */
  const filterCounts = useMemo(() => {
    return {
      todos: movimientos.length,
      debitos: movimientos.filter((m) => m.tipo === TipoMovimiento.DEBITO).length,
      creditos: movimientos.filter((m) => m.tipo === TipoMovimiento.CREDITO).length,
      ajustes: movimientos.filter((m) => m.tipo === TipoMovimiento.AJUSTE).length,
    };
  }, [movimientos]);

  /**
   * Maneja la apertura del modal
   */
  const handleRegistrarClick = () => {
    setModalOpen(true);
  };

  /**
   * Maneja el éxito del registro
   */
  const handleModalSuccess = () => {
    fetchData();
  };

  /**
   * Maneja la apertura del modal de ajuste
   */
  const handleAjusteClick = () => {
    setAjusteModalOpen(true);
  };

  /**
   * Maneja el éxito del ajuste
   */
  const handleAjusteSuccess = () => {
    fetchData();
  };

  /**
   * Maneja el click en volver
   */
  const handleVolverClick = () => {
    navigate(-1);
  };

  // Loading inicial
  if (loading && !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600 font-medium">Cargando historial...</p>
        </div>
      </div>
    );
  }

  // Error: cliente no encontrado
  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cliente no encontrado</h2>
          <p className="text-gray-600 mb-6">
            No se pudo cargar la información del cliente.
          </p>
          <button
            onClick={handleVolverClick}
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header fijo */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVolverClick}
            className="
              flex items-center gap-2 text-gray-600 hover:text-gray-900
              font-medium transition-colors duration-200
              min-h-touch
            "
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </motion.button>
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Saldo Card */}
        <SaldoCard
          saldo={(cliente as any).saldo || 0}
          clienteNombre={`${cliente.nombre} ${cliente.apellido}`}
          ultimaOperacion={(cliente as any).ultima_operacion}
          onRegistrarMovimiento={handleRegistrarClick}
        />

        {/* Botón de Aplicar Ajuste */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            icon={Calculator}
            onClick={handleAjusteClick}
            className="w-full max-w-md"
          >
            Aplicar Ajuste
          </Button>
        </div>

        {/* Filter Bar */}
        <FilterBar
          activeFilter={filter}
          onFilterChange={setFilter}
          counts={filterCounts}
        />

        {/* Movimientos List */}
        <MovimientosList
          movimientos={movimientosFiltrados}
          saldoActual={(cliente as any).saldo || 0}
          loading={loading}
          onRefresh={fetchData}
        />
      </main>

      {/* Modal de registro */}
      <MovimientoFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        clienteId={clienteId}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de ajuste */}
      {cliente && (
        <AjusteModal
          isOpen={ajusteModalOpen}
          onClose={() => setAjusteModalOpen(false)}
          cliente={cliente}
          onSuccess={handleAjusteSuccess}
        />
      )}
    </div>
  );
};

export default ClienteHistorial;
