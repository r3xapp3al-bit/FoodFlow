import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
// ? Usamos SERVICE_KEY (clave secreta) para permisos completos en el backend
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseKey) {
  throw new Error('? SUPABASE_SERVICE_KEY no está definida en .env');
}

console.log('? Usando clave SERVICE_KEY (empieza con):', supabaseKey.substring(0, 15) + '...');

export const supabase = createClient(supabaseUrl, supabaseKey);
