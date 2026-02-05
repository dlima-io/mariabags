import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SearchInput from '@/components/atoms/SearchInput';
import Button from '@/components/atoms/Button';

/**
 * SearchBar Molecule - Barra de búsqueda con acciones
 *
 * Input de búsqueda con debounce
 * Contador de resultados
 * Botón para agregar nuevo cliente
 * Sticky opcional al hacer scroll
 */

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  resultCount?: number;
  isLoading?: boolean;
  sticky?: boolean;
}

const SearchBar = ({
  searchTerm,
  onSearchChange,
  onAddClick,
  resultCount,
  isLoading = false,
  sticky = false,
}: SearchBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-white rounded-xl shadow-md p-4
        ${sticky ? 'sticky top-4 z-10' : ''}
      `}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input de búsqueda */}
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            onDebouncedChange={onSearchChange}
            placeholder="Buscar por nombre, apellido o teléfono..."
            debounceMs={300}
          />
        </div>

        {/* Botón de agregar (desktop) */}
        <div className="hidden sm:block">
          <Button
            variant="primary"
            icon={Plus}
            iconPosition="left"
            onClick={onAddClick}
            className="whitespace-nowrap"
          >
            Agregar Cliente
          </Button>
        </div>
      </div>

      {/* Contador de resultados */}
      {!isLoading && resultCount !== undefined && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="mt-3 pt-3 border-t border-gray-100"
        >
          <p className="text-sm text-gray-600">
            {resultCount === 0 ? (
              <span>No se encontraron clientes</span>
            ) : resultCount === 1 ? (
              <span>
                <strong className="text-primary-600">1</strong> cliente encontrado
              </span>
            ) : (
              <span>
                <strong className="text-primary-600">{resultCount}</strong> clientes encontrados
              </span>
            )}
          </p>
        </motion.div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-3 border-t border-gray-100"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"
            />
            <span>Buscando...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;
