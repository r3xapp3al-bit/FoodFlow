import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listCategoriesHandler,
  getCategoryHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/category.controller';

export default async function categoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listCategoriesHandler);
  app.get('/:id', getCategoryHandler);
  app.post('/', createCategoryHandler);
  app.put('/:id', updateCategoryHandler);
  app.delete('/:id', deleteCategoryHandler);
}
