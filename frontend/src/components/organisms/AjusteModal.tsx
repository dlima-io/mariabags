import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { ClienteConSaldo } from '@/types/Cliente.types';
import { useAjuste } from '@/hooks/useAjuste';
import Button from '@/components/atoms/Button';
import ToggleGroup from '@/components/atoms/ToggleGroup';
import NumberInput from '@/components/atoms/NumberInput';
import PreviewCard from '@/components/molecules/PreviewCard';
import { formatCurrency } from '@/utils/formatters';

/**
 * AjusteModal Organism - Modal para aplicar ajustes a la cuenta del cliente
 *
 * Permite dos tipos de ajustes:
 * 1. Monto Fijo: Ajuste por un valor específico (ej: +$1000 o -$500)
 * 2. Porcentaje: Ajuste basado en el saldo actual (ej: +10% o -5%)
 *
 * Features:
 * - Preview en tiempo real del impacto del ajuste
 * - Validaciones de entrada
 * - Observaciones opcionales
 * - Cierre con ESC o click fuera
 * - Animaciones suaves
 * - Touch-optimized
 */

type TipoAjuste = 'MONTO' | 'PORCENTAJE';

interface AjusteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: ClienteConSaldo;
  onSuccess: (data: { tipoAjuste: 'MONTO' | 'PORCENTAJE'; valor: number }) => void;
}

const AjusteModal = ({ isOpen, onClose, cliente, onSuccess }: AjusteModalProps) => {
  // Estado del formulario
  const [tipoAjuste, setTipoAjuste] = useState<TipoAjuste>('MONTO');
  const [valorInput, setValorInput] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');

  // Hook de ajuste
  const { loading, aplicarAjusteFijo, aplicarAjustePorcentual } = useAjuste();

  /**
   * Resetea el formulario cuando se abre el modal
   */
  useEffect(() => {
    if (isOpen) {
      setTipoAjuste('MONTO');
      setValorInput('');
      setObservaciones('');
    }
  }, [isOpen]);

  /**
   * Calcula el monto del ajuste según el tipo
   */
  const montoAjuste = useMemo(() => {
    const valor = parseFloat(valorInput);

    if (isNaN(valor) || valorInput === '' || valorInput === '-') {
      return 0;
    }

    if (tipoAjuste === 'MONTO') {
      return valor;
    } else {
      // Porcentaje
      return (cliente.saldo * valor) / 100;
    }
  }, [tipoAjuste, valorInput, cliente.saldo]);

  /**
   * Valida el formulario
   */
  const esFormularioValido = useMemo(() => {
    const valor = parseFloat(valorInput);

    if (isNaN(valor) || valorInput === '' || valorInput === '-') {
      return false;
    }

    // El valor no puede ser 0
    if (valor === 0) {
      return false;
    }

    // Si es porcentaje, validar que el saldo no sea 0
    if (tipoAjuste === 'PORCENTAJE' && cliente.saldo === 0) {
      return false;
    }

    return true;
  }, [tipoAjuste, valorInput, cliente.saldo]);

  /**
   * Mensaje de error de validación
   */
  const mensajeError = useMemo(() => {
    const valor = parseFloat(valorInput);

    if (valorInput !== '' && valorInput !== '-' && !isNaN(valor) && valor === 0) {
      return 'El valor no puede ser 0';
    }

    if (tipoAjuste === 'PORCENTAJE' && cliente.saldo === 0) {
      return 'No se puede aplicar ajuste porcentual sobre saldo 0';
    }

    return null;
  }, [tipoAjuste, valorInput, cliente.saldo]);

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async () => {
    if (!esFormularioValido || loading) {
      return;
    }

    const valor = parseFloat(valorInput);
    const obs = observaciones.trim() || undefined;

    let resultado;

    if (tipoAjuste === 'MONTO') {
      resultado = await aplicarAjusteFijo(cliente.id, valor, obs);
    } else {
      resultado = await aplicarAjustePorcentual(cliente.id, valor, obs);
    }

    if (resultado) {
      onSuccess({ tipoAjuste, valor: parseFloat(valorInput) });
      onClose();
    }
  };

  /**
   * Cierra el modal al presionar ESC
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Bloquea el scroll del body cuando el modal está abierto
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /**
   * Focus management - enfoca el input al abrir
   */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = document.getElementById('ajuste-valor-input');
        input?.focus();
      }, 100);
    }
  }, [isOpen, tipoAjuste]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              relative w-full max-w-lg bg-white rounded-2xl shadow-2xl
              overflow-hidden
              max-h-[90vh] overflow-y-auto
            "
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ajuste-modal-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 id="ajuste-modal-title" className="text-xl font-bold text-gray-800">
                    Aplicar Ajuste
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: {cliente.nombre} {cliente.apellido} | Saldo actual:{' '}
                    <span className="font-bold">{formatCurrency(cliente.saldo)}</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="
                    p-2 rounded-lg text-gray-500 hover:text-gray-700
                    hover:bg-gray-100 active:bg-gray-200
                    transition-colors duration-200
                  "
                  aria-label="Cerrar modal"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Selector de Tipo de Ajuste */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de ajuste
                </label>
                <ToggleGroup
                  options={[
                    {
                      value: 'MONTO',
                      label: 'Monto Fijo',
                      icon: <DollarSign className="w-4 h-4" />,
                    },
                    {
                      value: 'PORCENTAJE',
                      label: 'Porcentaje',
                      icon: <Percent className="w-4 h-4" />,
                    },
                  ]}
                  value={tipoAjuste}
                  onChange={(value) => {
                    setTipoAjuste(value as TipoAjuste);
                    setValorInput(''); // Reset al cambiar tipo
                  }}
                  className="w-full"
                />
              </div>

              {/* Input de Valor */}
              <div>
                <label
                  htmlFor="ajuste-valor-input"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {tipoAjuste === 'MONTO' ? 'Monto del ajuste' : 'Porcentaje del ajuste'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <NumberInput
                  id="ajuste-valor-input"
                  name="valor"
                  value={valorInput}
                  onChange={setValorInput}
                  placeholder={
                    tipoAjuste === 'MONTO'
                      ? 'Ej: 1000 o -500'
                      : 'Ej: 10 o -5'
                  }
                  prefix={tipoAjuste === 'MONTO' ? '$' : undefined}
                  suffix={tipoAjuste === 'PORCENTAJE' ? '%' : undefined}
                  allowNegative={true}
                  allowDecimal={true}
                  error={!!mensajeError}
                  helperText={
                    mensajeError ||
                    (tipoAjuste === 'MONTO'
                      ? 'Valor positivo aumenta deuda, negativo la disminuye'
                      : 'Porcentaje positivo aumenta deuda, negativo la disminuye')
                  }
                  disabled={loading}
                />
              </div>

              {/* Campo Observaciones */}
              <div>
                <label
                  htmlFor="ajuste-observaciones"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Observaciones (opcional)
                </label>
                <textarea
                  id="ajuste-observaciones"
                  name="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Motivo del ajuste (opcional)"
                  rows={3}
                  disabled={loading}
                  className="
                    w-full px-4 py-3 rounded-lg border-2 border-gray-200
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                    focus:outline-none
                    transition-all duration-200
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    placeholder:text-gray-400
                    resize-none
                  "
                />
                <p className="mt-1 text-xs text-gray-500">
                  Si no especificas observaciones, se generará automáticamente según el ajuste
                </p>
              </div>

              {/* Preview del Impacto */}
              {valorInput && !isNaN(parseFloat(valorInput)) && parseFloat(valorInput) !== 0 && (
                <PreviewCard saldoActual={cliente.saldo} ajuste={montoAjuste} />
              )}

              {/* Warning si saldo es 0 y tipo es porcentaje */}
              {tipoAjuste === 'PORCENTAJE' && cliente.saldo === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Ajuste porcentual no disponible
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      No se puede aplicar un ajuste porcentual cuando el saldo actual es $0.
                      Utiliza un ajuste de monto fijo.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!esFormularioValido || loading}
                  isLoading={loading}
                  className="flex-1"
                >
                  {loading ? 'Aplicando...' : 'Aplicar Ajuste'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AjusteModal;
