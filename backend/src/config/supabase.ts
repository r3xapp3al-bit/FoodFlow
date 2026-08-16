import dotenv from 'dotenv';
// ⬇️ Cargar variables de entorno ANTES de cualquier otra cosa
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validar que las variables existan
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL no está definida en el archivo .env');
}
if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY no está definida en el archivo .env');
}

// Cliente con clave anónima (para operaciones normales)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con clave de servicio (para bypass RLS en operaciones administrativas)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;