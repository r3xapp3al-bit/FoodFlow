import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listCustomersHandler,
  getCustomerHandler,
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  listAddressesHandler,
  createAddressHandler,
  updateAddressHandler,
  deleteAddressHandler,
} from '../controllers/customer.controller';

export default async function customersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  // ── Customers ──
  app.get('/', listCustomersHandler);
  app.get('/:id', getCustomerHandler);
  app.post('/', createCustomerHandler);
  app.put('/:id', updateCustomerHandler);
  app.delete('/:id', deleteCustomerHandler);

  // ── Addresses (anidadas) ──
  app.get('/:customerId/addresses', listAddressesHandler);
  app.post('/:customerId/addresses', createAddressHandler);
  app.put('/:customerId/addresses/:addressId', updateAddressHandler);
  app.delete('/:customerId/addresses/:addressId', deleteAddressHandler);
}