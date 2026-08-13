import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomerService } from '../services/customer.service';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  ListCustomersQuerySchema,
  CreateAddressSchema,
  UpdateAddressSchema,
} from '../schemas/customers.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const customerService = new CustomerService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

// ── Customers ──────────────────────────────────────────
export async function listCustomersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar clientes',
      });
    }

    const query = ListCustomersQuerySchema.parse(request.query);
    const result = await customerService.listCustomers(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listCustomersHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar clientes',
    });
  }
}

export async function getCustomerHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver este cliente',
      });
    }

    const customerId = request.params.id;
    const customer = await customerService.getCustomerById(customerId);
    return reply.send({ success: true, data: customer });
  } catch (err: any) {
    console.error('Error en getCustomerHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Cliente no encontrado',
    });
  }
}

export async function createCustomerHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear clientes',
      });
    }

    const data = CreateCustomerSchema.parse(request.body);
    const customer = await customerService.createCustomer(data);
    return reply.status(201).send({ success: true, data: customer });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createCustomerHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear cliente',
    });
  }
}

export async function updateCustomerHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar este cliente',
      });
    }

    const customerId = request.params.id;
    const data = UpdateCustomerSchema.parse(request.body);
    const customer = await customerService.updateCustomer(customerId, data);
    return reply.send({ success: true, data: customer });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateCustomerHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar cliente',
    });
  }
}

export async function deleteCustomerHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar este cliente',
      });
    }

    const customerId = request.params.id;
    const result = await customerService.deleteCustomer(customerId);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteCustomerHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar cliente',
    });
  }
}

// ── Addresses ──────────────────────────────────────────
export async function listAddressesHandler(
  request: FastifyRequest<{ Params: { customerId: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar direcciones',
      });
    }

    const addresses = await customerService.listAddresses(request.params.customerId);
    return reply.send({ success: true, data: addresses });
  } catch (err: any) {
    console.error('Error en listAddressesHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar direcciones',
    });
  }
}

export async function createAddressHandler(
  request: FastifyRequest<{ Params: { customerId: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear direcciones',
      });
    }

    const data = CreateAddressSchema.parse(request.body);
    const address = await customerService.createAddress({
      ...data,
      customer_id: request.params.customerId,
    });
    return reply.status(201).send({ success: true, data: address });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createAddressHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear dirección',
    });
  }
}

export async function updateAddressHandler(
  request: FastifyRequest<{ Params: { customerId: string; addressId: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar direcciones',
      });
    }

    const data = UpdateAddressSchema.parse(request.body);
    const address = await customerService.updateAddress(
      request.params.addressId,
      data,
      request.params.customerId
    );
    return reply.send({ success: true, data: address });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateAddressHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar dirección',
    });
  }
}

export async function deleteAddressHandler(
  request: FastifyRequest<{ Params: { customerId: string; addressId: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar direcciones',
      });
    }

    const result = await customerService.deleteAddress(request.params.addressId);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteAddressHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar dirección',
    });
  }
}