import { useState, FormEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { User, Phone } from 'lucide-react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import { CreateClienteDTO } from '@/types/Cliente.types';

/**
 * ClienteForm Molecule - Formulario para crear/editar clientes
 *
 * Validación en tiempo real
 * Mensajes de error específicos
 * Auto-focus en primer campo
 * Botones de submit y cancelar
 * Animaciones de entrada
 */

interface ClienteFormProps {
  onSubmit: (data: CreateClienteDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: CreateClienteDTO;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

const ClienteForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}: ClienteFormProps) => {
  // Estado del formulario
  const [formData, setFormData] = useState<CreateClienteDTO>({
    nombre: initialData?.nombre || '',
    apellido: initialData?.apellido || '',
    telefono: initialData?.telefono || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Validar campo individual
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (value.length > 100) return 'El nombre no puede exceder 100 caracteres';
        break;
      case 'apellido':
        if (!value.trim()) return 'El apellido es requerido';
        if (value.length < 2) return 'El apellido debe tener al menos 2 caracteres';
        if (value.length > 100) return 'El apellido no puede exceder 100 caracteres';
        break;
      case 'telefono':
        if (!value.trim()) return 'El teléfono es requerido';
        // Validar formato internacional (debe empezar con +)
        if (!value.startsWith('+')) return 'El teléfono debe tener formato internacional (ej: +5491112345678)';
        // Validar que contenga solo números después del +
        if (!/^\+\d{10,15}$/.test(value)) return 'El teléfono debe contener entre 10 y 15 dígitos';
        break;
    }
    return undefined;
  };

  // Validar formulario completo
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.nombre = validateField('nombre', formData.nombre);
    newErrors.apellido = validateField('apellido', formData.apellido);
    newErrors.telefono = validateField('telefono', formData.telefono);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // Manejar cambio en input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validar campo si ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Manejar blur (campo tocado)
  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof CreateClienteDTO]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Manejar submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    setTouched({
      nombre: true,
      apellido: true,
      telefono: true,
    });

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    // Enviar datos
    try {
      await onSubmit(formData);
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Campo Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
          Nombre <span className="text-red-500">*</span>
        </label>
        <Input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Ej: María"
          value={formData.nombre}
          onChange={handleChange}
          onBlur={() => handleBlur('nombre')}
          icon={User}
          error={!!errors.nombre && touched.nombre}
          helperText={touched.nombre ? errors.nombre : undefined}
          disabled={isLoading}
          autoComplete="given-name"
        />
      </div>

      {/* Campo Apellido */}
      <div>
        <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-2">
          Apellido <span className="text-red-500">*</span>
        </label>
        <Input
          id="apellido"
          name="apellido"
          type="text"
          placeholder="Ej: González"
          value={formData.apellido}
          onChange={handleChange}
          onBlur={() => handleBlur('apellido')}
          icon={User}
          error={!!errors.apellido && touched.apellido}
          helperText={touched.apellido ? errors.apellido : undefined}
          disabled={isLoading}
          autoComplete="family-name"
        />
      </div>

      {/* Campo Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <Input
          id="telefono"
          name="telefono"
          type="tel"
          placeholder="+5491112345678"
          value={formData.telefono}
          onChange={handleChange}
          onBlur={() => handleBlur('telefono')}
          icon={Phone}
          error={!!errors.telefono && touched.telefono}
          helperText={touched.telefono ? errors.telefono : 'Formato internacional (ej: +5491112345678)'}
          disabled={isLoading}
          autoComplete="tel"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          fullWidth
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          {initialData ? 'Actualizar' : 'Crear Cliente'}
        </Button>
      </div>
    </motion.form>
  );
};

export default ClienteForm;
