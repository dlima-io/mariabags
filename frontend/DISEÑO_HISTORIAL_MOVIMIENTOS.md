# Diseño del Historial de Movimientos - Frontend

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura de Componentes](#arquitectura-de-componentes)
3. [Atoms - Componentes Básicos](#atoms---componentes-básicos)
4. [Molecules - Componentes Compuestos](#molecules---componentes-compuestos)
5. [Organisms - Componentes Complejos](#organisms---componentes-complejos)
6. [Pages - Vistas Completas](#pages---vistas-completas)
7. [Estado y Gestión de Datos](#estado-y-gestión-de-datos)
8. [Animaciones](#animaciones)
9. [Responsive Design](#responsive-design)
10. [Integraciones](#integraciones)
11. [Accesibilidad](#accesibilidad)
12. [Performance](#performance)

---

## Visión General

### Objetivo
Crear una interfaz intuitiva y vibrante para visualizar el historial completo de movimientos contables de un cliente, permitiendo:
- Ver todos los movimientos ordenados cronológicamente
- Filtrar por tipo de movimiento
- Registrar nuevos movimientos rápidamente
- Visualizar el saldo acumulado en cada paso
- Exportar historial (futuro)

### Principios de Diseño
1. **Mobile-First:** Optimizado para uso táctil en smartphones
2. **Vibrante:** Colores brillantes con semántica clara (verde=pago, rojo=deuda)
3. **Rápido:** Animaciones fluidas y carga optimizada
4. **Claro:** Información jerárquica y fácil de escanear
5. **Auditable:** Mostrar quién registró cada movimiento y cuándo

---

## Arquitectura de Componentes

### Atomic Design Pattern

```
src/components/
├── atoms/
│   ├── MovementBadge.tsx
│   ├── AmountDisplay.tsx
│   ├── DateDisplay.tsx
│   └── UserTag.tsx
├── molecules/
│   ├── MovimientoItem.tsx
│   ├── SaldoCard.tsx
│   ├── MovimientoForm.tsx
│   └── FilterBar.tsx
├── organisms/
│   ├── MovimientosList.tsx
│   ├── MovimientoFormModal.tsx
│   └── ClienteHistorial.tsx
└── pages/
    └── ClienteDetalle.tsx
```

---

## Atoms - Componentes Básicos

### 1. MovementBadge.tsx

**Propósito:** Badge visual para identificar el tipo de movimiento

**Props:**
```typescript
interface MovementBadgeProps {
  tipo: 'DEBITO' | 'CREDITO' | 'AJUSTE';
  size?: 'sm' | 'md' | 'lg';
}
```

**Diseño Visual:**

```
┌─────────────────────────────────────┐
│ [COMPRA]  - Badge rojo vibrante     │
│ [PAGO]    - Badge verde vibrante    │
│ [AJUSTE]  - Badge azul vibrante     │
└─────────────────────────────────────┘
```

**Implementación Sugerida:**
```typescript
export const MovementBadge: React.FC<MovementBadgeProps> = ({ tipo, size = 'md' }) => {
  const config = {
    DEBITO: {
      text: 'COMPRA',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      icon: '🛍️'
    },
    CREDITO: {
      text: 'PAGO',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: '💵'
    },
    AJUSTE: {
      text: 'AJUSTE',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      icon: '⚙️'
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const { text, bgColor, textColor, icon } = config[tipo];

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-semibold
      ${bgColor} ${textColor} ${sizeClasses[size]}
    `}>
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
};
```

**Estados:**
- Default
- Hover (opcional, para interactividad futura)

---

### 2. AmountDisplay.tsx

**Propósito:** Mostrar montos con formato consistente y semántica visual

**Props:**
```typescript
interface AmountDisplayProps {
  amount: number;
  tipo: 'DEBITO' | 'CREDITO' | 'AJUSTE';
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
}
```

**Diseño Visual:**

```
DEBITO:   + $2,000.00  (rojo)
CREDITO:  - $1,500.00  (verde)
AJUSTE:   + $400.00    (azul si positivo, naranja si negativo)
```

**Implementación Sugerida:**
```typescript
export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  tipo,
  size = 'md',
  showSign = true
}) => {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(Math.abs(value));
  };

  const getSignAndColor = () => {
    if (tipo === 'DEBITO') {
      return { sign: '+', color: 'text-red-600' };
    } else if (tipo === 'CREDITO') {
      return { sign: '-', color: 'text-green-600' };
    } else {
      // AJUSTE
      return {
        sign: amount >= 0 ? '+' : '-',
        color: amount >= 0 ? 'text-blue-600' : 'text-orange-600'
      };
    }
  };

  const { sign, color } = getSignAndColor();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <span className={`font-semibold ${color} ${sizeClasses[size]}`}>
      {showSign && <span>{sign} </span>}
      {formatAmount(amount)}
    </span>
  );
};
```

---

### 3. DateDisplay.tsx

**Propósito:** Mostrar fechas con formato consistente

**Props:**
```typescript
interface DateDisplayProps {
  date: Date | string;
  format?: 'short' | 'long' | 'relative';
  showTime?: boolean;
}
```

**Formatos:**
- **short:** `20/01/2024`
- **long:** `20 de Enero, 2024`
- **relative:** `Hace 2 días`
- **showTime:** `20/01/2024 14:30`

**Implementación Sugerida:**
```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format: formatType = 'short',
  showTime = false
}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const getFormattedDate = () => {
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
  };

  return (
    <time
      dateTime={dateObj.toISOString()}
      className="text-gray-600 text-sm"
    >
      {getFormattedDate()}
    </time>
  );
};
```

---

### 4. UserTag.tsx

**Propósito:** Mostrar el usuario que registró el movimiento

**Props:**
```typescript
interface UserTagProps {
  username: string;
  size?: 'sm' | 'md';
}
```

**Diseño Visual:**

```
Por: admin ⚡
```

**Implementación Sugerida:**
```typescript
export const UserTag: React.FC<UserTagProps> = ({ username, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm'
  };

  return (
    <span className={`text-gray-500 ${sizeClasses[size]}`}>
      Por: <span className="font-medium text-gray-700">{username}</span>
    </span>
  );
};
```

---

## Molecules - Componentes Compuestos

### 1. MovimientoItem.tsx

**Propósito:** Card individual que representa un movimiento en el historial

**Props:**
```typescript
interface MovimientoItemProps {
  movimiento: {
    id: string;
    fecha: Date;
    tipo: 'DEBITO' | 'CREDITO' | 'AJUSTE';
    monto: number;
    observaciones: string | null;
    usuario: {
      username: string;
    };
    saldoAcumulado?: number;
  };
  onEdit?: (id: string) => void;
  showSaldoAcumulado?: boolean;
}
```

**Diseño Visual:**

```
┌────────────────────────────────────────────────┐
│ 📅 20/01/2024 14:30                            │
│                                                │
│ [COMPRA]  Cartera Premium                     │
│ + $2,000.00                    Saldo: $4,000  │
│                                                │
│ Por: admin                                     │
└────────────────────────────────────────────────┘
```

**Implementación Sugerida:**
```typescript
import { motion } from 'framer-motion';
import { MovementBadge } from '../atoms/MovementBadge';
import { AmountDisplay } from '../atoms/AmountDisplay';
import { DateDisplay } from '../atoms/DateDisplay';
import { UserTag } from '../atoms/UserTag';

export const MovimientoItem: React.FC<MovimientoItemProps> = ({
  movimiento,
  onEdit,
  showSaldoAcumulado = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white rounded-lg shadow-md p-4 border-l-4 border-pink-500"
    >
      {/* Header: Fecha */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-400">📅</span>
        <DateDisplay date={movimiento.fecha} showTime />
      </div>

      {/* Body: Badge, Descripción y Monto */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <MovementBadge tipo={movimiento.tipo} />
          {movimiento.observaciones && (
            <p className="text-gray-700 mt-2 text-sm">
              {movimiento.observaciones}
            </p>
          )}
        </div>
        <div className="text-right">
          <AmountDisplay
            amount={movimiento.monto}
            tipo={movimiento.tipo}
            size="lg"
          />
        </div>
      </div>

      {/* Footer: Saldo Acumulado y Usuario */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {showSaldoAcumulado && movimiento.saldoAcumulado !== undefined && (
          <div className="text-sm text-gray-600">
            Saldo: <span className="font-semibold text-gray-900">
              ${movimiento.saldoAcumulado.toLocaleString('es-AR')}
            </span>
          </div>
        )}
        <UserTag username={movimiento.usuario.username} />
      </div>
    </motion.div>
  );
};
```

**Estados:**
- Default
- Hover (elevación sutil)
- Pressed (tap en móvil)

**Animaciones:**
- Entrada: fade + slide up
- Salida: fade + slide left

---

### 2. SaldoCard.tsx

**Propósito:** Card destacado que muestra el saldo actual del cliente

**Props:**
```typescript
interface SaldoCardProps {
  saldo: number;
  clienteNombre: string;
  ultimaOperacion?: Date;
  onRegistrarMovimiento: () => void;
}
```

**Diseño Visual:**

```
┌────────────────────────────────────────────────┐
│                                                │
│  Cliente: María González                      │
│                                                │
│  SALDO ACTUAL                                  │
│  $4,000.00                                     │
│                                                │
│  Última operación: Hace 2 días                │
│                                                │
│  [+ Registrar Movimiento]                     │
│                                                │
└────────────────────────────────────────────────┘
```

**Implementación Sugerida:**
```typescript
import { motion } from 'framer-motion';

export const SaldoCard: React.FC<SaldoCardProps> = ({
  saldo,
  clienteNombre,
  ultimaOperacion,
  onRegistrarMovimiento
}) => {
  const getSaldoColor = () => {
    if (saldo > 0) return 'text-red-600';
    if (saldo < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getSaldoLabel = () => {
    if (saldo > 0) return 'Cliente debe';
    if (saldo < 0) return 'Cliente tiene a favor';
    return 'Cliente está al día';
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl shadow-lg p-6"
    >
      {/* Nombre del Cliente */}
      <h2 className="text-lg font-semibold mb-4">
        {clienteNombre}
      </h2>

      {/* Saldo */}
      <div className="mb-4">
        <p className="text-sm opacity-90 mb-1">{getSaldoLabel()}</p>
        <motion.p
          key={saldo}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-4xl font-bold ${saldo !== 0 ? 'text-white' : 'text-white/80'}`}
        >
          ${Math.abs(saldo).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </motion.p>
      </div>

      {/* Última Operación */}
      {ultimaOperacion && (
        <p className="text-sm opacity-75 mb-4">
          Última operación: <DateDisplay date={ultimaOperacion} format="relative" />
        </p>
      )}

      {/* Botón de Acción */}
      <button
        onClick={onRegistrarMovimiento}
        className="w-full bg-white text-pink-600 font-semibold py-3 px-4 rounded-lg
                   hover:bg-pink-50 active:scale-95 transition-all duration-200
                   flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span>
        <span>Registrar Movimiento</span>
      </button>
    </motion.div>
  );
};
```

**Animaciones:**
- Saldo cambia: pulse effect
- Hover en botón: elevación

---

### 3. MovimientoForm.tsx

**Propósito:** Formulario para registrar nuevos movimientos

**Props:**
```typescript
interface MovimientoFormProps {
  clienteId: string;
  onSuccess: (movimiento: Movimiento) => void;
  onCancel: () => void;
  tipoDefault?: 'DEBITO' | 'CREDITO' | 'AJUSTE';
}
```

**Diseño Visual:**

```
┌────────────────────────────────────────────────┐
│  Registrar Movimiento                          │
│  ────────────────────────────────────────────  │
│                                                │
│  Tipo de Movimiento:                           │
│  [●] Compra  [ ] Pago  [ ] Ajuste             │
│                                                │
│  Monto:                                        │
│  ┌──────────────────────────────────────────┐ │
│  │ $ 0.00                                   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Observaciones (opcional):                     │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [Cancelar]          [Registrar]              │
│                                                │
└────────────────────────────────────────────────┘
```

**Implementación Sugerida:**
```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export const MovimientoForm: React.FC<MovimientoFormProps> = ({
  clienteId,
  onSuccess,
  onCancel,
  tipoDefault = 'DEBITO'
}) => {
  const [tipo, setTipo] = useState<'DEBITO' | 'CREDITO' | 'AJUSTE'>(tipoDefault);
  const [monto, setMonto] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum === 0) {
      toast.error('El monto debe ser un número válido y diferente de cero');
      return;
    }

    if (tipo !== 'AJUSTE' && montoNum < 0) {
      toast.error('El monto no puede ser negativo para compras y pagos');
      return;
    }

    setLoading(true);

    try {
      const endpoint = tipo === 'DEBITO' ? '/api/movimientos/compra' :
                      tipo === 'CREDITO' ? '/api/movimientos/pago' :
                      '/api/movimientos/ajuste';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cliente_id: clienteId,
          monto: montoNum,
          observaciones: observaciones || undefined,
          ...(tipo === 'AJUSTE' && { porcentaje: undefined }) // Si es ajuste fijo
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar movimiento');
      }

      const movimiento = await response.json();
      toast.success('Movimiento registrado exitosamente');
      onSuccess(movimiento);
    } catch (error) {
      toast.error('Error al registrar movimiento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo de Movimiento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Movimiento
        </label>
        <div className="flex gap-2">
          {['DEBITO', 'CREDITO', 'AJUSTE'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t as any)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all
                ${tipo === t
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t === 'DEBITO' ? '🛍️ Compra' :
               t === 'CREDITO' ? '💵 Pago' :
               '⚙️ Ajuste'}
            </button>
          ))}
        </div>
      </div>

      {/* Monto */}
      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
          Monto
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            id="monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            step="0.01"
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-pink-500 focus:border-transparent
                       text-lg"
            required
          />
        </div>
        {tipo === 'AJUSTE' && (
          <p className="mt-1 text-xs text-gray-500">
            Usa valores negativos para descuentos
          </p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
          placeholder="Ej: Cartera modelo premium, color negro"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-pink-500 focus:border-transparent
                     resize-none"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg
                     font-medium hover:bg-gray-50 active:scale-95 transition-all
                     disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-pink-500 text-white rounded-lg font-medium
                     hover:bg-pink-600 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </div>
    </form>
  );
};
```

**Validaciones:**
- Monto debe ser número válido
- Monto no puede ser cero
- Para DEBITO/CREDITO, monto debe ser positivo
- Para AJUSTE, monto puede ser negativo

---

### 4. FilterBar.tsx

**Propósito:** Barra de filtros para el historial

**Props:**
```typescript
interface FilterBarProps {
  activeFilter: 'TODOS' | 'DEBITO' | 'CREDITO' | 'AJUSTE';
  onFilterChange: (filter: 'TODOS' | 'DEBITO' | 'CREDITO' | 'AJUSTE') => void;
  totalCount: number;
}
```

**Diseño Visual:**

```
┌────────────────────────────────────────────────┐
│ [Todos (10)] [Compras (5)] [Pagos (4)] [Ajustes (1)] │
└────────────────────────────────────────────────┘
```

**Implementación Sugerida:**
```typescript
export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  totalCount
}) => {
  const filters = [
    { key: 'TODOS', label: 'Todos', icon: '📋' },
    { key: 'DEBITO', label: 'Compras', icon: '🛍️' },
    { key: 'CREDITO', label: 'Pagos', icon: '💵' },
    { key: 'AJUSTE', label: 'Ajustes', icon: '⚙️' }
  ] as const;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium
                      whitespace-nowrap transition-all
            ${activeFilter === key
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <span>{icon}</span>
          <span>{label}</span>
          <span className="text-xs opacity-75">({totalCount})</span>
        </button>
      ))}
    </div>
  );
};
```

---

## Organisms - Componentes Complejos

### 1. MovimientosList.tsx

**Propósito:** Lista completa de movimientos con animaciones stagger

**Props:**
```typescript
interface MovimientosListProps {
  movimientos: Movimiento[];
  loading: boolean;
  onRefresh: () => void;
}
```

**Diseño Visual:**

```
┌────────────────────────────────────────────────┐
│                                                │
│  [Movimiento 1 - fade + slide up]             │
│  [Movimiento 2 - fade + slide up + delay]     │
│  [Movimiento 3 - fade + slide up + delay]     │
│  ...                                           │
│                                                │
│  [Cargar más]                                  │
│                                                │
└────────────────────────────────────────────────┘
```

**Implementación Sugerida:**
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { MovimientoItem } from '../molecules/MovimientoItem';

export const MovimientosList: React.FC<MovimientosListProps> = ({
  movimientos,
  loading,
  onRefresh
}) => {
  // Calcular saldo acumulado para cada movimiento
  const movimientosConSaldo = movimientos.map((mov, index) => {
    const anteriores = movimientos.slice(index);
    const saldoAcumulado = anteriores.reduce((acc, m) => {
      if (m.tipo === 'DEBITO') return acc + m.monto;
      if (m.tipo === 'CREDITO') return acc - m.monto;
      return acc + m.monto; // AJUSTE
    }, 0);

    return { ...mov, saldoAcumulado };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No hay movimientos registrados</p>
        <button
          onClick={onRefresh}
          className="text-pink-500 font-medium hover:underline"
        >
          Registrar primer movimiento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {movimientosConSaldo.map((movimiento, index) => (
          <motion.div
            key={movimiento.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <MovimientoItem
              movimiento={movimiento}
              showSaldoAcumulado
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

**Animaciones:**
- Lista completa: stagger (delay incremental)
- Item individual: fade + slide up
- Salida: fade + slide left

---

### 2. MovimientoFormModal.tsx

**Propósito:** Modal para registrar movimientos

**Props:**
```typescript
interface MovimientoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  onSuccess: () => void;
}
```

**Implementación Sugerida:**
```typescript
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { MovimientoForm } from '../molecules/MovimientoForm';

export const MovimientoFormModal: React.FC<MovimientoFormModalProps> = ({
  isOpen,
  onClose,
  clienteId,
  onSuccess
}) => {
  const handleSuccess = (movimiento: Movimiento) => {
    onSuccess();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Registrar Movimiento
                </Dialog.Title>

                <MovimientoForm
                  clienteId={clienteId}
                  onSuccess={handleSuccess}
                  onCancel={onClose}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
```

**Animaciones:**
- Backdrop: fade in/out
- Modal: scale + fade

---

### 3. ClienteHistorial.tsx

**Propósito:** Vista completa del historial (organism principal)

**Props:**
```typescript
interface ClienteHistorialProps {
  clienteId: string;
}
```

**Diseño Visual:**

```
┌────────────────────────────────────────────────┐
│ [← Volver]                                     │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ SaldoCard                                  │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ FilterBar                                  │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ MovimientosList                            │ │
│ │   - MovimientoItem 1                       │ │
│ │   - MovimientoItem 2                       │ │
│ │   - MovimientoItem 3                       │ │
│ │   ...                                      │ │
│ └────────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

**Implementación Sugerida:**
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaldoCard } from '../molecules/SaldoCard';
import { FilterBar } from '../molecules/FilterBar';
import { MovimientosList } from './MovimientosList';
import { MovimientoFormModal } from './MovimientoFormModal';
import { toast } from 'react-hot-toast';

export const ClienteHistorial: React.FC<ClienteHistorialProps> = ({ clienteId }) => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<ClienteConSaldo | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'TODOS' | 'DEBITO' | 'CREDITO' | 'AJUSTE'>('TODOS');
  const [modalOpen, setModalOpen] = useState(false);

  // Cargar datos del cliente y movimientos
  useEffect(() => {
    fetchData();
  }, [clienteId]);

  // Filtrar movimientos cuando cambia el filtro
  useEffect(() => {
    if (filter === 'TODOS') {
      setFilteredMovimientos(movimientos);
    } else {
      setFilteredMovimientos(movimientos.filter(m => m.tipo === filter));
    }
  }, [filter, movimientos]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener cliente con saldo
      const clienteRes = await fetch(`/api/clientes/${clienteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const clienteData = await clienteRes.json();
      setCliente(clienteData);

      // Obtener movimientos
      const movimientosRes = await fetch(`/api/movimientos/cliente/${clienteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const movimientosData = await movimientosRes.json();
      setMovimientos(movimientosData);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleRegistrarClick = () => {
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchData();
    toast.success('Movimiento registrado');
  };

  if (loading || !cliente) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Volver</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Saldo Card */}
        <SaldoCard
          saldo={cliente.saldo}
          clienteNombre={`${cliente.nombre} ${cliente.apellido}`}
          ultimaOperacion={cliente.ultima_operacion}
          onRegistrarMovimiento={handleRegistrarClick}
        />

        {/* Filter Bar */}
        <FilterBar
          activeFilter={filter}
          onFilterChange={setFilter}
          totalCount={filteredMovimientos.length}
        />

        {/* Movimientos List */}
        <MovimientosList
          movimientos={filteredMovimientos}
          loading={loading}
          onRefresh={handleRefresh}
        />
      </main>

      {/* Modal */}
      <MovimientoFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        clienteId={clienteId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
```

---

## Pages - Vistas Completas

### ClienteDetalle.tsx

**Propósito:** Página completa de detalle del cliente con historial

**Ruta:** `/clientes/:id`

**Implementación:**
```typescript
import { useParams } from 'react-router-dom';
import { ClienteHistorial } from '../components/organisms/ClienteHistorial';

export const ClienteDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Cliente no encontrado</div>;
  }

  return <ClienteHistorial clienteId={id} />;
};
```

---

## Estado y Gestión de Datos

### Estructura de Estado

```typescript
interface ClienteDetalleState {
  cliente: ClienteConSaldo | null;
  movimientos: Movimiento[];
  filteredMovimientos: Movimiento[];
  filter: 'TODOS' | 'DEBITO' | 'CREDITO' | 'AJUSTE';
  loading: boolean;
  modalOpen: boolean;
}
```

### APIs Consumidas

```typescript
// Obtener cliente con saldo
GET /api/clientes/:id
Response: ClienteConSaldo

// Obtener movimientos del cliente
GET /api/movimientos/cliente/:id
Response: Movimiento[]

// Crear movimiento
POST /api/movimientos/compra
POST /api/movimientos/pago
POST /api/movimientos/ajuste
Body: { cliente_id, monto, observaciones }
Response: Movimiento
```

### Optimización con React Query (Recomendado)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook para obtener cliente
const useCliente = (clienteId: string) => {
  return useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => fetchCliente(clienteId),
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};

// Hook para obtener movimientos
const useMovimientos = (clienteId: string) => {
  return useQuery({
    queryKey: ['movimientos', clienteId],
    queryFn: () => fetchMovimientos(clienteId),
    staleTime: 1 * 60 * 1000 // 1 minuto
  });
};

// Hook para crear movimiento
const useCreateMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMovimiento,
    onSuccess: (data, variables) => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries(['cliente', variables.cliente_id]);
      queryClient.invalidateQueries(['movimientos', variables.cliente_id]);
    }
  });
};
```

---

## Animaciones

### Biblioteca: Framer Motion

### Animaciones Implementadas

#### 1. Entrada de Lista (Stagger)
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={containerVariants} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

#### 2. Cambio de Saldo (Pulse)
```typescript
<motion.div
  key={saldo}
  initial={{ scale: 1.1 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  ${saldo}
</motion.div>
```

#### 3. Modal (Scale + Fade)
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* Modal content */}
</motion.div>
```

#### 4. Botón (Tap)
```typescript
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.02 }}
>
  Click me
</motion.button>
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First */
/* xs: default (< 640px) */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
```

### Adaptaciones

#### Mobile (< 768px)
- Lista de movimientos: full width
- Modal: full screen
- Filtros: scroll horizontal
- Botones: altura mínima 44px (touch target)

#### Tablet (768px - 1024px)
- Lista de movimientos: 2 columnas
- Modal: max-width 600px centrado
- Filtros: wrap con múltiples filas

#### Desktop (> 1024px)
- Vista de 2 columnas: Saldo fijo a la izquierda, lista scrollable a la derecha
- Modal: max-width 800px centrado
- Filtros: todos visibles en una fila

---

## Integraciones

### WhatsApp
Integrar botón para enviar mensaje al cliente:

```typescript
const handleWhatsAppClick = (telefono: string, nombre: string, saldo: number) => {
  const mensaje = encodeURIComponent(
    `Hola ${nombre}! Te contacto desde María Bags. Tu saldo actual es de $${saldo}.`
  );
  window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
};
```

### Exportar a PDF (Futuro)
```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportToPDF = (cliente: ClienteConSaldo, movimientos: Movimiento[]) => {
  const doc = new jsPDF();

  // Header
  doc.text(`Historial de Movimientos - ${cliente.nombre} ${cliente.apellido}`, 10, 10);

  // Tabla de movimientos
  autoTable(doc, {
    head: [['Fecha', 'Tipo', 'Monto', 'Saldo', 'Observaciones']],
    body: movimientos.map(m => [
      format(m.fecha, 'dd/MM/yyyy HH:mm'),
      m.tipo,
      `$${m.monto}`,
      `$${m.saldoAcumulado}`,
      m.observaciones || '-'
    ])
  });

  doc.save(`historial-${cliente.apellido}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
```

---

## Accesibilidad

### Principios

1. **Semántica HTML:** Usar tags apropiados (`<button>`, `<nav>`, etc.)
2. **ARIA Labels:** Agregar labels descriptivos
3. **Contraste de Color:** Mínimo 4.5:1 para texto normal
4. **Navegación por Teclado:** Todos los elementos interactivos accesibles con Tab
5. **Screen Readers:** Textos alternativos en imágenes y badges

### Ejemplos

```typescript
// Botón accesible
<button
  aria-label="Registrar nuevo movimiento"
  onClick={handleClick}
>
  + Registrar
</button>

// Lista de movimientos
<ul role="list" aria-label="Historial de movimientos">
  {movimientos.map(m => (
    <li key={m.id} role="listitem">
      <MovimientoItem movimiento={m} />
    </li>
  ))}
</ul>

// Badge con semántica
<span role="status" aria-label={`Tipo de movimiento: ${tipo}`}>
  <MovementBadge tipo={tipo} />
</span>
```

---

## Performance

### Optimizaciones

#### 1. Lazy Loading de Componentes
```typescript
import { lazy, Suspense } from 'react';

const ClienteHistorial = lazy(() => import('./ClienteHistorial'));

<Suspense fallback={<LoadingSpinner />}>
  <ClienteHistorial clienteId={id} />
</Suspense>
```

#### 2. Virtualización de Lista (Para muchos movimientos)
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={movimientos.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <MovimientoItem movimiento={movimientos[index]} />
    </div>
  )}
</FixedSizeList>
```

#### 3. Memoización
```typescript
import { memo } from 'react';

export const MovimientoItem = memo<MovimientoItemProps>(({ movimiento }) => {
  // Componente solo se re-renderiza si movimiento cambia
  return (/* ... */);
});
```

#### 4. Debounce en Búsquedas
```typescript
import { useDebouncedValue } from '@mantine/hooks';

const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery] = useDebouncedValue(searchQuery, 300);

useEffect(() => {
  // Buscar con query debounced
  searchMovimientos(debouncedQuery);
}, [debouncedQuery]);
```

---

## Resumen de Dependencias

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.0",
    "@headlessui/react": "^1.7.0",
    "react-hot-toast": "^2.4.0",
    "date-fns": "^2.30.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## Próximos Pasos

1. **Implementar componentes Atoms** (MovementBadge, AmountDisplay, etc.)
2. **Implementar Molecules** (MovimientoItem, SaldoCard, MovimientoForm)
3. **Implementar Organisms** (MovimientosList, ClienteHistorial)
4. **Crear página ClienteDetalle**
5. **Integrar con backend** (APIs de movimientos)
6. **Testing** (Vitest + React Testing Library)
7. **Optimización de performance**
8. **Exportar a PDF** (funcionalidad futura)

---

**Versión:** 1.0
**Fecha:** 2024-02-04
**Autor:** Sistema de Diseño María Bags
