import { body, param } from 'express-validator';
import { TipoMovimiento } from '../types/Movimiento.types';
import { RolUsuario } from '../types/Usuario.types';

export const clienteValidators = {
  create: [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .escape(),
    body('apellido').trim().notEmpty().withMessage('El apellido es requerido')
      .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
      .escape(),
    body('telefono').trim().notEmpty().withMessage('El teléfono es requerido')
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Formato de teléfono inválido')
  ],
  update: [
    param('id').isUUID().withMessage('ID inválido'),
    body('nombre').optional().trim()
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .escape(),
    body('apellido').optional().trim()
      .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
      .escape(),
    body('telefono').optional().trim()
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Formato de teléfono inválido'),
    body('activo').optional().isBoolean().withMessage('El campo activo debe ser booleano')
  ]
};

export const movimientoValidators = {
  create: [
    body('cliente_id').isUUID().withMessage('ID de cliente inválido'),
    body('tipo').isIn(Object.values(TipoMovimiento)).withMessage('Tipo de movimiento inválido'),
    body('monto').isFloat({ gt: 0, max: 99999999.99 }).withMessage('El monto debe ser mayor a 0 y menor a 99,999,999.99'),
    body('observaciones').optional().trim()
      .isLength({ max: 500 }).withMessage('Las observaciones no pueden superar 500 caracteres')
      .escape()
  ],
  updateObservaciones: [
    param('id').isUUID().withMessage('ID de movimiento inválido'),
    body('observaciones').trim()
      .isLength({ max: 500 }).withMessage('Las observaciones no pueden superar 500 caracteres')
      .escape()
  ],
  ajustePorcentual: [
    body('cliente_id').isUUID().withMessage('ID de cliente inválido'),
    body('porcentaje').isFloat({ gt: -100, lt: 1000 }).withMessage('El porcentaje debe estar entre -100 y 1000')
  ]
};

export const usuarioValidators = {
  create: [
    body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido')
      .isLength({ min: 4, max: 50 }).withMessage('El username debe tener entre 4 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('El username solo puede contener letras, números y guiones bajos')
      .escape(),
    body('password').notEmpty().withMessage('La contraseña es requerida')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('rol').isIn(Object.values(RolUsuario)).withMessage('Rol inválido')
  ],
  login: [
    body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido')
      .escape(),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  changePassword: [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword').notEmpty().withMessage('La nueva contraseña es requerida')
      .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
  ],
  refreshToken: [
    body('refreshToken').trim().notEmpty().withMessage('Refresh token requerido')
      .isJWT().withMessage('Formato de refresh token inválido')
  ]
};
