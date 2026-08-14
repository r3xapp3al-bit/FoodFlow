import { FastifyRequest, FastifyReply } from 'fastify';
import { RecipeService } from '../services/recipe.service';
import {
  CreateRecipeSchema,
  UpdateRecipeSchema,
  ListRecipesQuerySchema,
} from '../schemas/recipes.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const recipeService = new RecipeService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listRecipesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar recetas',
      });
    }

    const query = ListRecipesQuerySchema.parse(request.query);
    const result = await recipeService.listRecipes(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listRecipesHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar recetas',
    });
  }
}

export async function getRecipeHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver esta receta',
      });
    }

    const recipe = await recipeService.getRecipeById(request.params.id);
    return reply.send({ success: true, data: recipe });
  } catch (err: any) {
    console.error('Error en getRecipeHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Receta no encontrada',
    });
  }
}

export async function createRecipeHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear recetas',
      });
    }

    const data = CreateRecipeSchema.parse(request.body);
    const recipe = await recipeService.createRecipe(data);
    return reply.status(201).send({ success: true, data: recipe });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createRecipeHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear receta',
    });
  }
}

export async function updateRecipeHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar esta receta',
      });
    }

    const data = UpdateRecipeSchema.parse(request.body);
    const recipe = await recipeService.updateRecipe(request.params.id, data);
    return reply.send({ success: true, data: recipe });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateRecipeHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar receta',
    });
  }
}

export async function deleteRecipeHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar esta receta',
      });
    }

    const result = await recipeService.deleteRecipe(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteRecipeHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar receta',
    });
  }
}