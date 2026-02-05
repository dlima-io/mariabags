/**
 * EJEMPLO DE USO - Módulo de Historial de Movimientos
 *
 * Este archivo muestra ejemplos de cómo usar los componentes creados
 * NO incluir este archivo en el proyecto, es solo referencia
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// EJEMPLO 1: Usar el servicio de movimientos directamente
// ============================================================================

import { movimientoService } from '@/services/movimientoService';
import { toast } from 'react-hot-toast';

async function ejemplo1_UsarServicio() {
  const clienteId = 'uuid-del-cliente';

  try {
    // Obtener movimientos
    const movimientos = await movimientoService.getMovimientosByCliente(clienteId);
    console.log('Movimientos:', movimientos);

    // Registrar una compra
    const nuevaCompra = await movimientoService.createCompra({
      cliente_id: clienteId,
      monto: 2000,
      observaciones: 'Cartera premium negra',
    });
    console.log('Compra registrada:', nuevaCompra);

    // Registrar un pago
    const nuevoPago = await movimientoService.createPago({
      cliente_id: clienteId,
      monto: 1500,
      observaciones: 'Pago en efectivo',
    });
    console.log('Pago registrado:', nuevoPago);

    // Registrar un ajuste
    const nuevoAjuste = await movimientoService.createAjuste({
      cliente_id: clienteId,
      monto: 400,
      observaciones: 'Recargo por mora 10%',
    });
    console.log('Ajuste registrado:', nuevoAjuste);

    toast.success('Operaciones completadas');
  } catch (error) {
    toast.error('Error en las operaciones');
    console.error(error);
  }
}

// ============================================================================
// EJEMPLO 2: Usar el hook useMovimientos
// ============================================================================

import { useMovimientos } from '@/hooks/useMovimientos';
import { TipoMovimiento } from '@/types/Movimiento.types';

function Ejemplo2_UsarHook() {
  const clienteId = 'uuid-del-cliente';
  const { movimientos, loading, error, refresh, createMovimiento } = useMovimientos(clienteId);

  const handleRegistrarCompra = async () => {
    const resultado = await createMovimiento({
      cliente_id: clienteId,
      tipo: TipoMovimiento.DEBITO,
      monto: 3000,
      observaciones: 'Compra de cartera',
    });

    if (resultado) {
      console.log('Movimiento creado:', resultado);
      // La lista se actualiza automáticamente
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleRegistrarCompra}>Registrar Compra</button>
      <button onClick={refresh}>Refrescar</button>
      <div>Total de movimientos: {movimientos.length}</div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Usar componentes Atoms directamente
// ============================================================================

import MovementBadge from '@/components/atoms/MovementBadge';
import AmountDisplay from '@/components/atoms/AmountDisplay';
import DateDisplay from '@/components/atoms/DateDisplay';
import UserTag from '@/components/atoms/UserTag';

function Ejemplo3_UsarAtoms() {
  return (
    <div className="space-y-4">
      {/* Badge de movimiento */}
      <MovementBadge tipo={TipoMovimiento.DEBITO} size="md" />
      <MovementBadge tipo={TipoMovimiento.CREDITO} size="lg" />
      <MovementBadge tipo={TipoMovimiento.AJUSTE} size="sm" />

      {/* Mostrar monto */}
      <AmountDisplay
        amount={2000}
        tipo={TipoMovimiento.DEBITO}
        size="lg"
        showSign
        animate
      />

      {/* Mostrar fecha */}
      <DateDisplay date={new Date()} format="short" showTime />
      <DateDisplay date={new Date()} format="long" />
      <DateDisplay date={new Date()} format="relative" />

      {/* Mostrar usuario */}
      <UserTag username="admin" size="sm" />
    </div>
  );
}

// ============================================================================
// EJEMPLO 4: Usar SaldoCard
// ============================================================================

import SaldoCard from '@/components/molecules/SaldoCard';

function Ejemplo4_UsarSaldoCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <SaldoCard
      saldo={4000} // Positivo = debe, Negativo = a favor, 0 = al día
      clienteNombre="María González"
      ultimaOperacion={new Date()}
      onRegistrarMovimiento={() => setModalOpen(true)}
    />
  );
}

// ============================================================================
// EJEMPLO 5: Usar MovimientoForm
// ============================================================================

import MovimientoForm from '@/components/molecules/MovimientoForm';

function Ejemplo5_UsarFormulario() {
  const clienteId = 'uuid-del-cliente';
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    console.log('Movimiento registrado exitosamente');
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div>
      {showForm && (
        <MovimientoForm
          clienteId={clienteId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

// ============================================================================
// EJEMPLO 6: Usar FilterBar
// ============================================================================

import FilterBar from '@/components/molecules/FilterBar';

type FilterType = 'TODOS' | TipoMovimiento;

function Ejemplo6_UsarFiltros() {
  const [filter, setFilter] = useState<FilterType>('TODOS');

  return (
    <FilterBar
      activeFilter={filter}
      onFilterChange={setFilter}
      counts={{
        todos: 10,
        debitos: 5,
        creditos: 4,
        ajustes: 1,
      }}
    />
  );
}

// ============================================================================
// EJEMPLO 7: Usar MovimientosList
// ============================================================================

import MovimientosList from '@/components/organisms/MovimientosList';
import { Movimiento } from '@/types/Movimiento.types';

function Ejemplo7_UsarLista() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // Recargar datos...
    setLoading(false);
  };

  return (
    <MovimientosList
      movimientos={movimientos}
      loading={loading}
      onRefresh={handleRefresh}
    />
  );
}

// ============================================================================
// EJEMPLO 8: Usar MovimientoFormModal
// ============================================================================

import MovimientoFormModal from '@/components/organisms/MovimientoFormModal';

function Ejemplo8_UsarModal() {
  const [isOpen, setIsOpen] = useState(false);
  const clienteId = 'uuid-del-cliente';

  const handleSuccess = () => {
    console.log('Movimiento registrado, recargando datos...');
    // Recargar datos aquí
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </button>

      <MovimientoFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        clienteId={clienteId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 9: Usar ClienteHistorial (Componente completo)
// ============================================================================

import ClienteHistorial from '@/components/organisms/ClienteHistorial';

function Ejemplo9_HistorialCompleto() {
  const clienteId = 'uuid-del-cliente';

  return <ClienteHistorial clienteId={clienteId} />;
}

// ============================================================================
// EJEMPLO 10: Navegar al historial desde otro componente
// ============================================================================

function Ejemplo10_Navegacion() {
  const navigate = useNavigate();
  const clienteId = 'uuid-del-cliente';

  const irAlHistorial = () => {
    navigate(`/clientes/${clienteId}`);
  };

  return (
    <button onClick={irAlHistorial}>
      Ver Historial
    </button>
  );
}

// ============================================================================
// EJEMPLO 11: Calcular saldo manualmente
// ============================================================================

function ejemplo11_CalcularSaldo(movimientos: Movimiento[]): number {
  return movimientos.reduce((saldo, mov) => {
    if (mov.tipo === TipoMovimiento.DEBITO) {
      return saldo + mov.monto; // Compra aumenta deuda
    } else if (mov.tipo === TipoMovimiento.CREDITO) {
      return saldo - mov.monto; // Pago reduce deuda
    } else {
      return saldo + mov.monto; // Ajuste (puede ser + o -)
    }
  }, 0);
}

// ============================================================================
// EJEMPLO 12: Formatear monto como moneda
// ============================================================================

function ejemplo12_FormatearMonto(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
}

// Ejemplos:
// ejemplo12_FormatearMonto(2000)    → "$2.000,00"
// ejemplo12_FormatearMonto(1500.5)  → "$1.500,50"
// ejemplo12_FormatearMonto(-400)    → "-$400,00"

// ============================================================================
// EJEMPLO 13: Filtrar movimientos por tipo
// ============================================================================

function ejemplo13_FiltrarMovimientos(
  movimientos: Movimiento[],
  filtro: FilterType
): Movimiento[] {
  if (filtro === 'TODOS') {
    return movimientos;
  }
  return movimientos.filter((m) => m.tipo === filtro);
}

// ============================================================================
// EJEMPLO 14: Validar monto antes de registrar
// ============================================================================

function ejemplo14_ValidarMonto(
  monto: number,
  tipo: TipoMovimiento
): { valido: boolean; error?: string } {
  if (isNaN(monto)) {
    return { valido: false, error: 'El monto debe ser un número válido' };
  }

  if (monto === 0) {
    return { valido: false, error: 'El monto no puede ser cero' };
  }

  if (monto > 99999999.99) {
    return { valido: false, error: 'El monto es demasiado grande' };
  }

  if (tipo !== TipoMovimiento.AJUSTE && monto < 0) {
    return { valido: false, error: 'El monto no puede ser negativo para compras y pagos' };
  }

  return { valido: true };
}

// ============================================================================
// EJEMPLO 15: Usar toast notifications
// ============================================================================

function ejemplo15_Notificaciones() {
  const registrarMovimiento = async () => {
    try {
      // Operación...
      toast.success('Movimiento registrado exitosamente');
    } catch (error) {
      toast.error('Error al registrar movimiento');
    }
  };

  const operacionLarga = async () => {
    const toastId = toast.loading('Procesando...');

    try {
      // Operación larga...
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Completado!', { id: toastId });
    } catch (error) {
      toast.error('Error', { id: toastId });
    }
  };

  return (
    <div>
      <button onClick={registrarMovimiento}>Con toast</button>
      <button onClick={operacionLarga}>Con loading</button>
    </div>
  );
}

// ============================================================================
// EJEMPLO 16: Integración completa en una página custom
// ============================================================================

import { useEffect } from 'react';

function Ejemplo16_PaginaCustom() {
  const clienteId = 'uuid-del-cliente';
  const { movimientos, loading, refresh } = useMovimientos(clienteId);
  const [filter, setFilter] = useState<FilterType>('TODOS');
  const [modalOpen, setModalOpen] = useState(false);

  // Filtrar movimientos
  const movimientosFiltrados = filter === 'TODOS'
    ? movimientos
    : movimientos.filter(m => m.tipo === filter);

  // Calcular contadores
  const counts = {
    todos: movimientos.length,
    debitos: movimientos.filter(m => m.tipo === TipoMovimiento.DEBITO).length,
    creditos: movimientos.filter(m => m.tipo === TipoMovimiento.CREDITO).length,
    ajustes: movimientos.filter(m => m.tipo === TipoMovimiento.AJUSTE).length,
  };

  // Calcular saldo
  const saldo = ejemplo11_CalcularSaldo(movimientos);

  return (
    <div className="space-y-6">
      {/* Saldo */}
      <SaldoCard
        saldo={saldo}
        clienteNombre="Cliente Ejemplo"
        onRegistrarMovimiento={() => setModalOpen(true)}
      />

      {/* Filtros */}
      <FilterBar
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />

      {/* Lista */}
      <MovimientosList
        movimientos={movimientosFiltrados}
        loading={loading}
        onRefresh={refresh}
      />

      {/* Modal */}
      <MovimientoFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        clienteId={clienteId}
        onSuccess={() => {
          refresh();
          setModalOpen(false);
        }}
      />
    </div>
  );
}

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/**
 * IMPORTANTE: Este archivo es solo de ejemplo y NO debe incluirse en el build.
 *
 * Para usar los componentes en tu aplicación:
 *
 * 1. Importa solo lo que necesitas
 * 2. Asegúrate de tener los tipos correctos
 * 3. Maneja errores apropiadamente
 * 4. Usa TypeScript para type safety
 * 5. Revisa la documentación en GUIA_USO_HISTORIAL.md
 *
 * Estructura recomendada:
 * - Páginas usan Organisms
 * - Organisms usan Molecules
 * - Molecules usan Atoms
 * - Todos usan Services y Hooks
 *
 * Flujo de datos:
 * Services → Hooks → Components → UI
 *
 * Estados:
 * - Loading: Mostrar spinner
 * - Error: Mostrar mensaje
 * - Success: Mostrar datos
 * - Empty: Mostrar empty state
 */

export {
  ejemplo1_UsarServicio,
  Ejemplo2_UsarHook,
  Ejemplo3_UsarAtoms,
  Ejemplo4_UsarSaldoCard,
  Ejemplo5_UsarFormulario,
  Ejemplo6_UsarFiltros,
  Ejemplo7_UsarLista,
  Ejemplo8_UsarModal,
  Ejemplo9_HistorialCompleto,
  Ejemplo10_Navegacion,
  ejemplo11_CalcularSaldo,
  ejemplo12_FormatearMonto,
  ejemplo13_FiltrarMovimientos,
  ejemplo14_ValidarMonto,
  ejemplo15_Notificaciones,
  Ejemplo16_PaginaCustom,
};
