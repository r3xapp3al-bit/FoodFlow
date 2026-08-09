import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import sitesRoutes from './routes/sites.routes';

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

// ── Registrar módulos ────────────────────────────────
app.register(authRoutes);
app.register(usersRoutes);
app.register(sitesRoutes);

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