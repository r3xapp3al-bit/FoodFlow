import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductService } from '../services/product.service';
import { CreateProductSchema, UpdateProductSchema, ListProductsQuerySchema } from '../schemas/products.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const productService = new ProductService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listProductsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar productos',
      });
    }

    const query = ListProductsQuerySchema.parse(request.query);
    const result = await productService.listProducts(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listProductsHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar productos',
    });
  }
}

export async function getProductHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver este producto',
      });
    }

    const productId = request.params.id;
    const product = await productService.getProductById(productId);
    return reply.send({ success: true, data: product });
  } catch (err: any) {
    console.error('Error en getProductHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Producto no encontrado',
    });
  }
}

export async function createProductHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear productos',
      });
    }

    const data = CreateProductSchema.parse(request.body);
    
    // Limpiar datos: convertir null a undefined para que coincida con ProductCreate
    const cleanData: any = { ...data };
    if (cleanData.image_url === null) {
      cleanData.image_url = undefined;
    }

    const product = await productService.createProduct({
      ...cleanData,
      site_id: authUser.site_id,
    });
    return reply.status(201).send({ success: true, data: product });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createProductHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear producto',
    });
  }
}

export async function updateProductHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar este producto',
      });
    }

    const productId = request.params.id;
    const data = UpdateProductSchema.parse(request.body);
    
    // Limpiar datos: convertir null a undefined
    const cleanData: any = { ...data };
    if (cleanData.image_url === null) {
      cleanData.image_url = undefined;
    }

    const product = await productService.updateProduct(productId, cleanData);
    return reply.send({ success: true, data: product });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateProductHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar producto',
    });
  }
}

export async function deleteProductHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar este producto',
      });
    }

    const productId = request.params.id;
    const result = await productService.deleteProduct(productId);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteProductHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar producto',
    });
  }
}