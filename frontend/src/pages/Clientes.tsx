import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClienteConSaldo, CreateClienteDTO, UpdateClienteDTO } from '@/types/Cliente.types';
import useClientes from '@/hooks/useClientes';
import useWhatsApp from '@/hooks/useWhatsApp';
import SearchBar from '@/components/molecules/SearchBar';
import ClientesList from '@/components/organisms/ClientesList';
import ClienteFormModal from '@/components/organisms/ClienteFormModal';
import Button from '@/components/atoms/Button';
import Logo from '@/components/atoms/Logo';

/**
 * Clientes Page - Pantalla principal de gestión de clientes
 *
 * Incluye:
 * - Header con logo y navegación
 * - Barra de búsqueda
 * - Lista de clientes
 * - Modal para agregar cliente
 * - FAB para agregar en móvil
 * - Confirmación de eliminación
 * - Toast notifications (manual)
 */

const Clientes = () => {
  const navigate = useNavigate();
  const {
    clientes,
    loading,
    error,
    createCliente,
    updateCliente,
    deleteCliente,
    searchClientes,
  } = useClientes();

  const { generateWhatsAppLink } = useWhatsApp();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ClienteConSaldo | null>(null);
  const [editingCliente, setEditingCliente] = useState<ClienteConSaldo | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Mostrar toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Manejar búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    searchClientes(term);
  };

  // Manejar creación de cliente
  const handleCreateCliente = async (data: CreateClienteDTO) => {
    try {
      setIsSubmitting(true);
      await createCliente(data);
      setIsModalOpen(false);
      showToast(`Cliente ${data.nombre} ${data.apellido} creado exitosamente`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Error al crear cliente', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar edición de cliente
  const handleEditCliente = async (data: CreateClienteDTO) => {
    if (!editingCliente) return;

    try {
      setIsSubmitting(true);
      const updateData: UpdateClienteDTO = {
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
      };
      await updateCliente(editingCliente.id, updateData);
      setEditingCliente(null);
      showToast(`Cliente ${data.nombre} ${data.apellido} actualizado exitosamente`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar cliente', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar click en editar
  const handleEditClick = (cliente: ClienteConSaldo) => {
    setEditingCliente(cliente);
  };

  // Manejar click en WhatsApp
  const handleWhatsAppClick = async (cliente: ClienteConSaldo) => {
    try {
      const mensaje = `Hola ${cliente.nombre}, te contacto desde María Bags.`;
      await generateWhatsAppLink(cliente.id, mensaje);
    } catch (error) {
      showToast('Error al abrir WhatsApp', 'error');
    }
  };

  // Manejar eliminación (mostrar confirmación)
  const handleDeleteClick = (cliente: ClienteConSaldo) => {
    setDeleteConfirm(cliente);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCliente(deleteConfirm.id);
      showToast(`Cliente ${deleteConfirm.nombre} ${deleteConfirm.apellido} desactivado`, 'success');
      setDeleteConfirm(null);
    } catch (error: any) {
      showToast(error.message || 'Error al desactivar cliente', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 safe-top safe-bottom">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-md sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate('/')}
              className="min-w-touch"
              aria-label="Volver al inicio"
            />
            <Logo size="sm" showSubtitle={false} animated={false} />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Clientes</h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Search Bar */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            onAddClick={() => setIsModalOpen(true)}
            resultCount={clientes.length}
            isLoading={loading}
            sticky={false}
          />

          {/* Clientes List */}
          <ClientesList
            clientes={clientes}
            loading={loading}
            error={error}
            onWhatsAppClick={handleWhatsAppClick}
            onDeleteClick={handleDeleteClick}
            onEditClick={handleEditClick}
          />
        </motion.div>
      </main>

      {/* FAB - Botón flotante para móvil */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300 }}
        onClick={() => setIsModalOpen(true)}
        className="
          sm:hidden fixed bottom-6 right-6 z-40
          w-14 h-14 rounded-full
          bg-gradient-to-r from-primary-500 to-primary-600
          text-white shadow-lg
          flex items-center justify-center
          hover:shadow-xl
          transition-shadow duration-200
        "
        aria-label="Agregar cliente"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Modal de Formulario - Crear */}
      <ClienteFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCliente}
        isLoading={isSubmitting}
        title="Agregar Cliente"
      />

      {/* Modal de Formulario - Editar */}
      <ClienteFormModal
        isOpen={!!editingCliente}
        onClose={() => setEditingCliente(null)}
        onSubmit={handleEditCliente}
        isLoading={isSubmitting}
        cliente={editingCliente || undefined}
      />

      {/* Modal de Confirmación de Eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Desactivar Cliente
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas desactivar a{' '}
                <strong className="text-gray-800">
                  {deleteConfirm.nombre} {deleteConfirm.apellido}
                </strong>
                ? Este cliente no se eliminará, solo se marcará como inactivo.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmDelete}
                  fullWidth
                  className="bg-red-500 hover:bg-red-600"
                >
                  Desactivar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
              fixed bottom-6 left-1/2 -translate-x-1/2 z-50
              px-6 py-4 rounded-xl shadow-2xl
              max-w-md w-full mx-4
              ${toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
              }
            `}
          >
            <p className="font-semibold text-center">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clientes;
