import { FastifyRequest, FastifyReply } from 'fastify';
import { SupplyService } from '../services/supply.service';
import {
  CreateSupplySchema,
  UpdateSupplySchema,
  ListSuppliesQuerySchema,
} from '../schemas/supplies.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const supplyService = new SupplyService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listSuppliesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar insumos',
      });
    }

    const query = ListSuppliesQuerySchema.parse(request.query);
    const result = await supplyService.listSupplies(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listSuppliesHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar insumos',
    });
  }
}

export async function getSupplyHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver este insumo',
      });
    }

    const supplyId = request.params.id;
    const supply = await supplyService.getSupplyById(supplyId);
    return reply.send({ success: true, data: supply });
  } catch (err: any) {
    console.error('Error en getSupplyHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Insumo no encontrado',
    });
  }
}

export async function createSupplyHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear insumos',
      });
    }

    const data = CreateSupplySchema.parse(request.body);
    const supply = await supplyService.createSupply({
      ...data,
      site_id: authUser.site_id,
    });
    return reply.status(201).send({ success: true, data: supply });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createSupplyHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear insumo',
    });
  }
}

export async function updateSupplyHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar este insumo',
      });
    }

    const supplyId = request.params.id;
    const data = UpdateSupplySchema.parse(request.body);
    const supply = await supplyService.updateSupply(supplyId, data);
    return reply.send({ success: true, data: supply });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateSupplyHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar insumo',
    });
  }
}

export async function deleteSupplyHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar este insumo',
      });
    }

    const supplyId = request.params.id;
    const result = await supplyService.deleteSupply(supplyId);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteSupplyHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar insumo',
    });
  }
}