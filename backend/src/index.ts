import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

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

// ✅ Registrar rutas de autenticación
app.register(authRoutes);

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