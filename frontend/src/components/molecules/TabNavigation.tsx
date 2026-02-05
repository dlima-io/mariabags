import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * TabNavigation Molecule - Navegación inferior tipo tab bar
 *
 * Diseño mobile-first
 * Animación de tab activo
 * Safe area bottom
 * Touch targets 44px
 */

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface TabNavigationProps {
  tabs: Tab[];
}

const TabNavigation = ({ tabs }: TabNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 pb-safe-bottom">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-touch min-h-touch py-2 px-3
                  transition-colors duration-200
                  ${isActive ? 'text-primary-600' : 'text-gray-500'}
                `}
              >
                {/* Icono */}
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>

                {/* Label */}
                <span className={`text-xs font-medium mt-1 ${isActive ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>

                {/* Indicador activo */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;
