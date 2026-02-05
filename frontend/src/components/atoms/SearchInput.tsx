import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

/**
 * SearchInput Atom - Input especializado para búsqueda
 *
 * Incluye icono de búsqueda
 * Botón de limpiar cuando hay texto
 * Debounce para optimizar búsquedas
 * Auto-focus opcional
 * Placeholder animado
 */

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

const SearchInput = ({
  value = '',
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = 'Buscar...',
  autoFocus = false,
  className = '',
}: SearchInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Auto-focus al montar
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sincronizar con valor externo
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Manejar cambio con debounce
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Configurar nuevo timer para callback con debounce
    if (onDebouncedChange) {
      debounceTimerRef.current = setTimeout(() => {
        onDebouncedChange(newValue);
      }, debounceMs);
    }
  };

  // Limpiar input
  const handleClear = () => {
    setInternalValue('');
    onChange('');
    if (onDebouncedChange) {
      onDebouncedChange('');
    }
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Icono de búsqueda */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full px-4 py-3 pl-12 pr-12
          rounded-lg border-2 border-gray-200
          transition-all duration-200
          text-base min-h-touch
          focus:border-primary-500 focus:ring-2 focus:ring-primary-200
          focus:outline-none
          placeholder:text-gray-400
        "
      />

      {/* Botón de limpiar */}
      <AnimatePresence>
        {internalValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            type="button"
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              p-2 rounded-full
              bg-gray-100 hover:bg-gray-200
              text-gray-600 hover:text-gray-800
              transition-colors duration-200
              min-w-touch min-h-touch
              flex items-center justify-center
            "
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;
