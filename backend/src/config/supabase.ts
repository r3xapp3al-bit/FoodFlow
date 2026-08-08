import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
// ✅ Ahora usamos ANON_KEY (porque ya tiene permisos gracias a las políticas)
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseKey) {
  throw new Error('❌ SUPABASE_ANON_KEY no está definida en .env');
}

console.log('✅ Usando clave ANON_KEY (empieza con):', supabaseKey.substring(0, 15) + '...');

export const supabase = createClient(supabaseUrl, supabaseKey);