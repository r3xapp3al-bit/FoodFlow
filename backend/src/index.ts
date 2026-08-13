import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import sitesRoutes from './routes/sites.routes';
import categoriesRoutes from './routes/categories.routes';
import productsRoutes from './routes/products.routes';
import suppliesRoutes from './routes/supplies.routes';
import inventoryRoutes from './routes/inventory.routes';
import customersRoutes from './routes/customers.routes';
import ordersRoutes from './routes/orders.routes';

dotenv.config();

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

// ── Health check ──────────────────────────────────────
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// ── Test DB connection ─────────────────────────────────
app.get('/test-db', async () => {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .limit(1);
    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// ── 🔬 ENDPOINT DE PRUEBA (GET, sin body) ──
app.get('/test-insert', async (_request, reply) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: 'Categoría de prueba GET',
        description: 'Creada desde endpoint de prueba (GET)',
        site_id: 'b8e6d5c4-3a2b-1c0d-9e8f-7a6b5c4d3e2f',
        is_active: true,
        sort_order: 0,
      })
      .select();

    if (error) throw error;
    return reply.send({ success: true, data });
  } catch (err: any) {
    console.error('❌ Error en /test-insert:', err);
    return reply.status(500).send({ success: false, error: err.message });
  }
});

// ── Registrar módulos ────────────────────────────────
app.register(authRoutes);
app.register(usersRoutes);
app.register(sitesRoutes);
app.register(categoriesRoutes, { prefix: '/categories' });
app.register(productsRoutes, { prefix: '/products' });
app.register(suppliesRoutes, { prefix: '/supplies' });
app.register(inventoryRoutes); // Rutas: /inventory, /batches, /movements
app.register(customersRoutes, { prefix: '/customers' });
app.register(ordersRoutes, { prefix: '/orders' });

// ── Iniciar servidor ──────────────────────────────────
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();