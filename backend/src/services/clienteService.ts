import { ClienteModel } from '../models/ClienteModel';
import { Cliente, ClienteConSaldo, CreateClienteDTO, UpdateClienteDTO } from '../types/Cliente.types';
import { AppError } from '../middleware/errorHandler';
import { sanitizeString, sanitizeTelefono } from '../utils/sanitizers';

export class ClienteService {
  /**
   * Obtener todos los clientes
   */
  static async getAllClientes(includeInactive: boolean = false): Promise<Cliente[]> {
    return ClienteModel.findAll(includeInactive);
  }

  /**
   * Obtener todos los clientes con saldo
   */
  static async getAllClientesWithSaldo(includeInactive: boolean = false): Promise<ClienteConSaldo[]> {
    return ClienteModel.findAllWithSaldo(includeInactive);
  }

  /**
   * Obtener cliente por ID
   */
  static async getClienteById(id: string): Promise<Cliente> {
    const cliente = await ClienteModel.findById(id);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return cliente;
  }

  /**
   * Obtener cliente con saldo por ID
   */
  static async getClienteWithSaldoById(id: string): Promise<ClienteConSaldo> {
    const cliente = await ClienteModel.findByIdWithSaldo(id);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return cliente;
  }

  /**
   * Crear nuevo cliente
   */
  static async createCliente(data: CreateClienteDTO): Promise<Cliente> {
    // Sanitizar inputs
    const sanitizedData = {
      nombre: sanitizeString(data.nombre),
      apellido: sanitizeString(data.apellido),
      telefono: sanitizeTelefono(data.telefono)
    };

    // Validar que el teléfono no exista
    const existingCliente = await ClienteModel.findByTelefono(sanitizedData.telefono);
    if (existingCliente) {
      throw new AppError('Ya existe un cliente con ese teléfono', 409);
    }

    return ClienteModel.create(sanitizedData);
  }

  /**
   * Actualizar cliente
   */
  static async updateCliente(id: string, data: UpdateClienteDTO): Promise<Cliente> {
    // Verificar que el cliente existe
    const existingCliente = await ClienteModel.findById(id);
    if (!existingCliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Sanitizar inputs
    const sanitizedData: UpdateClienteDTO = {};
    if (data.nombre !== undefined) {
      sanitizedData.nombre = sanitizeString(data.nombre);
    }
    if (data.apellido !== undefined) {
      sanitizedData.apellido = sanitizeString(data.apellido);
    }
    if (data.telefono !== undefined) {
      sanitizedData.telefono = sanitizeTelefono(data.telefono);

      // Verificar que el nuevo teléfono no esté en uso por otro cliente
      const clienteConTelefono = await ClienteModel.findByTelefono(sanitizedData.telefono);
      if (clienteConTelefono && clienteConTelefono.id !== id) {
        throw new AppError('Ya existe otro cliente con ese teléfono', 409);
      }
    }
    if (data.activo !== undefined) {
      sanitizedData.activo = data.activo;
    }

    const updatedCliente = await ClienteModel.update(id, sanitizedData);
    if (!updatedCliente) {
      throw new AppError('Error al actualizar cliente', 500);
    }

    return updatedCliente;
  }

  /**
   * Desactivar cliente (soft delete)
   */
  static async deactivateCliente(id: string): Promise<Cliente> {
    const cliente = await ClienteModel.deactivate(id);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return cliente;
  }

  /**
   * Buscar clientes (con saldo)
   */
  static async searchClientes(searchTerm: string, includeInactive: boolean = false): Promise<ClienteConSaldo[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.getAllClientesWithSaldo(includeInactive);
    }
    return ClienteModel.search(sanitizeString(searchTerm), includeInactive);
  }

  /**
   * Obtener clientes con deuda
   */
  static async getClientesWithDebt(): Promise<ClienteConSaldo[]> {
    return ClienteModel.findWithDebt();
  }

  /**
   * Obtener clientes con mora
   */
  static async getClientesWithMora(dias: number = 30): Promise<ClienteConSaldo[]> {
    if (dias < 1) {
      throw new AppError('Los días de mora deben ser al menos 1', 400);
    }
    return ClienteModel.findWithMora(dias);
  }

  /**
   * Obtener clientes con deuda incluyendo información del último pago
   */
  static async getClientesWithDebtAndLastPayment(): Promise<any[]> {
    return ClienteModel.findWithDebtAndLastPayment();
  }

  /**
   * Generar link de WhatsApp para cliente
   */
  static async generateWhatsAppLink(
    id: string,
    message?: string
  ): Promise<{ url: string; telefono: string; mensaje: string }> {
    const cliente = await this.getClienteById(id);

    // Remover caracteres no numéricos del teléfono (excepto +)
    const telefonoLimpio = cliente.telefono.replace(/[^\d+]/g, '');

    // Mensaje por defecto si no se proporciona
    const mensajeDefault = `Hola ${cliente.nombre}! Te contacto desde María Bags`;
    const mensajeFinal = message || mensajeDefault;

    const url = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensajeFinal)}`;

    return {
      url,
      telefono: cliente.telefono,
      mensaje: mensajeFinal
    };
  }
}
