import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

// Lazy loading para páginas grandes
const Clientes = lazy(() => import('@/pages/Clientes'));
const ClienteDetalle = lazy(() => import('@/pages/ClienteDetalle'));
const Configuracion = lazy(() => import('@/pages/Configuracion'));

/**
 * App Component - Router principal de la aplicación
 *
 * Configura las rutas y la protección de autenticación
 * Ruta /login para inicio de sesión
 * Ruta / protegida (requiere autenticación)
 * Ruta /clientes para gestión de clientes
 */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Cargando...</p>
              </div>
            </div>
          }
        >
          <Routes>
            {/* Ruta de Login */}
            <Route path="/login" element={<Login />} />

            {/* Ruta protegida - Dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Ruta protegida - Clientes */}
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <Clientes />
                </ProtectedRoute>
              }
            />

            {/* Ruta protegida - Detalle de Cliente */}
            <Route
              path="/clientes/:id"
              element={
                <ProtectedRoute>
                  <ClienteDetalle />
                </ProtectedRoute>
              }
            />

            {/* Ruta protegida - Configuración */}
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute>
                  <Configuracion />
                </ProtectedRoute>
              }
            />

            {/* Ruta catch-all - Redirige a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
