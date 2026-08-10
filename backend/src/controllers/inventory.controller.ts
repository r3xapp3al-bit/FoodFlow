import { FastifyRequest, FastifyReply } from 'fastify';
import { InventoryService } from '../services/inventory.service';
import {
  UpdateInventorySchema,
  ListInventoryQuerySchema,
  CreateBatchSchema,
  UpdateBatchSchema,
  ListBatchesQuerySchema,
  CreateMovementSchema,
  ListMovementsQuerySchema,
} from '../schemas/inventory.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const inventoryService = new InventoryService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

// ── Inventory ────────────────────────────────
export async function listInventoryHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver el inventario',
      });
    }

    const query = ListInventoryQuerySchema.parse(request.query);
    const result = await inventoryService.listInventory(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listInventoryHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar inventario',
    });
  }
}

export async function updateInventoryHandler(
  request: FastifyRequest<{ Params: { insumoId: string; branchId: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar inventario',
      });
    }

    const { insumoId, branchId } = request.params;
    const data = UpdateInventorySchema.parse(request.body);
    const inventory = await inventoryService.updateInventory(insumoId, branchId, data);
    return reply.send({ success: true, data: inventory });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateInventoryHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar inventario',
    });
  }
}

// ── Batches ──────────────────────────────────
export async function listBatchesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar lotes',
      });
    }

    const query = ListBatchesQuerySchema.parse(request.query);
    const result = await inventoryService.listBatches(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listBatchesHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar lotes',
    });
  }
}

export async function getBatchHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver este lote',
      });
    }

    const batch = await inventoryService.getBatchById(request.params.id);
    return reply.send({ success: true, data: batch });
  } catch (err: any) {
    console.error('Error en getBatchHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Lote no encontrado',
    });
  }
}

export async function createBatchHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear lotes',
      });
    }

    const data = CreateBatchSchema.parse(request.body);
    const batch = await inventoryService.createBatch(data);
    return reply.status(201).send({ success: true, data: batch });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createBatchHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear lote',
    });
  }
}

export async function updateBatchHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar este lote',
      });
    }

    const data = UpdateBatchSchema.parse(request.body);
    const batch = await inventoryService.updateBatch(request.params.id, data);
    return reply.send({ success: true, data: batch });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateBatchHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar lote',
    });
  }
}

export async function deleteBatchHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar este lote',
      });
    }

    const result = await inventoryService.deleteBatch(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteBatchHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar lote',
    });
  }
}

// ── Movements ─────────────────────────────────
export async function listMovementsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar movimientos',
      });
    }

    const query = ListMovementsQuerySchema.parse(request.query);
    const result = await inventoryService.listMovements(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listMovementsHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar movimientos',
    });
  }
}

export async function createMovementHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para registrar movimientos',
      });
    }

    const data = CreateMovementSchema.parse(request.body);
    const movement = await inventoryService.createMovement({
      ...data,
      user_id: authUser.id,
    });
    return reply.status(201).send({ success: true, data: movement });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createMovementHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al registrar movimiento',
    });
  }
}