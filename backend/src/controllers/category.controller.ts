import { FastifyRequest, FastifyReply } from 'fastify';
import { CategoryService } from '../services/category.service';
import { CreateCategorySchema, UpdateCategorySchema, ListCategoriesQuerySchema } from '../schemas/categories.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const categoryService = new CategoryService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listCategoriesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar categorías',
      });
    }

    const query = ListCategoriesQuerySchema.parse(request.query);
    const result = await categoryService.listCategories(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listCategoriesHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar categorías',
    });
  }
}

export async function getCategoryHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver esta categoría',
      });
    }

    const categoryId = request.params.id;
    const category = await categoryService.getCategoryById(categoryId);
    return reply.send({ success: true, data: category });
  } catch (err: any) {
    console.error('Error en getCategoryHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Categoría no encontrada',
    });
  }
}

export async function createCategoryHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    // 🔍 Log para depuración
    console.log('🔐 authUser en createCategory:', JSON.stringify(authUser, null, 2));

    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear categorías',
      });
    }

    // Validar que el usuario tenga site_id
    if (!authUser.site_id) {
      return reply.status(400).send({
        success: false,
        error: 'El usuario no tiene un site_id asociado. Contacta al administrador.',
      });
    }

    const data = CreateCategorySchema.parse(request.body);
    const category = await categoryService.createCategory({
      ...data,
      site_id: authUser.site_id,
    });
    return reply.status(201).send({ success: true, data: category });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createCategoryHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear categoría',
    });
  }
}

export async function updateCategoryHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar esta categoría',
      });
    }

    const categoryId = request.params.id;
    const data = UpdateCategorySchema.parse(request.body);
    const category = await categoryService.updateCategory(categoryId, data);
    return reply.send({ success: true, data: category });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateCategoryHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar categoría',
    });
  }
}

export async function deleteCategoryHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar esta categoría',
      });
    }

    const categoryId = request.params.id;
    const result = await categoryService.deleteCategory(categoryId);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteCategoryHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar categoría',
    });
  }
}