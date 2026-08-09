import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from '../controllers/product.controller';

export default async function productsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listProductsHandler);
  app.get('/:id', getProductHandler);
  app.post('/', createProductHandler);
  app.put('/:id', updateProductHandler);
  app.delete('/:id', deleteProductHandler);
}
