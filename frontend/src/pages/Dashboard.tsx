import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, CreditCard, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Logo from '@/components/atoms/Logo';
import useDashboard from '@/hooks/useDashboard';
import PagosDelMesModal from '@/components/organisms/PagosDelMesModal';
import DeudaTotalModal from '@/components/organisms/DeudaTotalModal';

/**
 * Dashboard Page - Pantalla principal después del login
 *
 * Muestra información básica y opciones de navegación
 * Diseño vibrante mobile-first
 * Incluye botón de logout
 */

const Dashboard = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { stats, loading } = useDashboard();
  const [isPagosModalOpen, setIsPagosModalOpen] = useState(false);
  const [isDeudaModalOpen, setIsDeudaModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 safe-top safe-bottom">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" showSubtitle={false} animated={false} />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{usuario?.username}</p>
              <p className="text-xs text-gray-500">{usuario?.rol}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Settings}
              onClick={() => navigate('/configuracion')}
              className="text-gray-600 hover:bg-gray-100"
            >
              <span className="hidden sm:inline">Config</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50"
            >
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Bienvenida */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Hola, {usuario?.username}
            </h1>
            <p className="text-gray-600">
              Bienvenido al sistema de gestión de cuentas corrientes de MARIA Clothing & Bags
            </p>
          </motion.div>

          {/* Cards de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Total Clientes */}
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/clientes')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">Total Clientes</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                  ) : (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-bold text-gray-800"
                    >
                      {stats.totalClientes}
                    </motion.p>
                  )}
                </div>
              </div>
              {!loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-gray-400 mt-3"
                >
                  {stats.clientesConDeuda} con deuda
                </motion.p>
              )}
            </motion.div>

            {/* Card 2: Pagos del Mes */}
            <motion.div
              variants={itemVariants}
              onClick={() => setIsPagosModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">Pagos del mes</p>
                  {loading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1" />
                  ) : (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-2xl font-bold text-gray-800"
                    >
                      {formatCurrency(stats.pagosDelMes)}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Card 3: Deuda Total */}
            <motion.div
              variants={itemVariants}
              onClick={() => setIsDeudaModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">Deuda total</p>
                  {loading ? (
                    <div className="h-8 w-28 bg-gray-200 animate-pulse rounded mt-1" />
                  ) : (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-gray-800"
                    >
                      {formatCurrency(stats.deudaTotal)}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Botón Ver Clientes */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              icon={Users}
              onClick={() => navigate('/clientes')}
              className="min-w-[200px]"
            >
              Ver todos los clientes
            </Button>
          </motion.div>
        </motion.div>
      </main>

      {/* Modal de Pagos del Mes */}
      <PagosDelMesModal
        isOpen={isPagosModalOpen}
        onClose={() => setIsPagosModalOpen(false)}
      />

      {/* Modal de Deuda Total */}
      <DeudaTotalModal
        isOpen={isDeudaModalOpen}
        onClose={() => setIsDeudaModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
