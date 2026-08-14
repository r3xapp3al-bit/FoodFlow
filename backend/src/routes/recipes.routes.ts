import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listRecipesHandler,
  getRecipeHandler,
  createRecipeHandler,
  updateRecipeHandler,
  deleteRecipeHandler,
} from '../controllers/recipe.controller';

export default async function recipesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listRecipesHandler);
  app.get('/:id', getRecipeHandler);
  app.post('/', createRecipeHandler);
  app.put('/:id', updateRecipeHandler);
  app.delete('/:id', deleteRecipeHandler);
}