import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Lock,
  Shield,
  Trash2,
  Edit,
  UserPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { usuarioService, Usuario } from '@/services/usuarioService';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import UsuarioFormModal from '@/components/organisms/UsuarioFormModal';

/**
 * Configuracion Page - Gestión de perfil y usuarios
 */

const Configuracion = () => {
  const navigate = useNavigate();
  const { usuario: currentUser, updateUsuario } = useAuth();
  const [loading, setLoading] = useState(false);

  // Perfil
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  const isAdmin = currentUser?.rol === 'ADMIN';

  useEffect(() => {
    if (currentUser) {
      setNewUsername(currentUser.username);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsuarios();
    }
  }, [isAdmin]);

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const data = await usuarioService.getAllUsuarios();
      setUsuarios(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar usuarios');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('El nombre de usuario no puede estar vacío');
      return;
    }

    if (newUsername === currentUser?.username) {
      toast.error('El nombre de usuario es el mismo');
      return;
    }

    setLoading(true);
    try {
      await usuarioService.updateUsuario(currentUser!.id, {
        username: newUsername.trim(),
      });
      toast.success('Nombre de usuario actualizado');
      updateUsuario({ ...currentUser!, username: newUsername.trim() });
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar nombre de usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await usuarioService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Contraseña actualizada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsuario = async (usuario: Usuario) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${usuario.username}"?`)) {
      return;
    }

    try {
      await usuarioService.deleteUsuario(usuario.id);
      toast.success('Usuario eliminado exitosamente');
      fetchUsuarios();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar usuario');
    }
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsUsuarioModalOpen(true);
  };

  const handleNuevoUsuario = () => {
    setSelectedUsuario(null);
    setIsUsuarioModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 min-h-touch"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </motion.button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-600" />
            Configuración
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu perfil {isAdmin && 'y usuarios del sistema'}
          </p>
        </motion.div>

        {/* Sección: Mi Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-6 space-y-6"
        >
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-primary-600" />
            Mi Perfil
          </h2>

          {/* Cambiar Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="usuario"
              />
              <Button
                variant="primary"
                onClick={handleUpdateUsername}
                disabled={loading || newUsername === currentUser?.username}
              >
                Actualizar
              </Button>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary-600" />
              Cambiar Contraseña
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Sección: Gestión de Usuarios (Solo ADMIN) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary-600" />
                Gestión de Usuarios
              </h2>
              <Button
                variant="primary"
                icon={UserPlus}
                onClick={handleNuevoUsuario}
              >
                Nuevo Usuario
              </Button>
            </div>

            {loadingUsuarios ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : usuarios.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay usuarios registrados
              </p>
            ) : (
              <div className="space-y-3">
                {usuarios.map((usuario) => (
                  <motion.div
                    key={usuario.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {usuario.username}
                        {usuario.id === currentUser?.id && (
                          <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            Tú
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rol: <span className="font-medium">{usuario.rol}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditUsuario(usuario)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                      {usuario.id !== currentUser?.id && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteUsuario(usuario)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Modal de Usuario */}
      <UsuarioFormModal
        isOpen={isUsuarioModalOpen}
        onClose={() => {
          setIsUsuarioModalOpen(false);
          setSelectedUsuario(null);
        }}
        usuario={selectedUsuario}
        onSuccess={fetchUsuarios}
      />
    </div>
  );
};

export default Configuracion;
