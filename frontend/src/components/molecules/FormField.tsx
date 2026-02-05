import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { forwardRef, ChangeEvent } from 'react';
import Input from '@/components/atoms/Input';

/**
 * FormField Molecule - Campo de formulario completo
 *
 * Combina label, input y mensaje de error
 * Animaciones suaves para feedback visual
 */

interface FormFieldProps {
  label: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  id?: string;
  name?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, icon, error, id, ...inputProps }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {/* Label */}
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {label}
        </label>

        {/* Input */}
        <Input
          ref={ref}
          id={fieldId}
          icon={icon}
          error={!!error}
          helperText={error}
          {...inputProps}
        />
      </motion.div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
