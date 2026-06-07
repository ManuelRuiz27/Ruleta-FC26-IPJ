// src/lib/supabaseClient.ts
// Este archivo prepara la conexión a Supabase.
// NOTA: Siguiendo los requerimientos de la "Primera Entrega", 
// no se conectará activamente hasta que se configuren las variables en un archivo .env.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Solo inicializar si tenemos las variables para no crashear la app
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('Supabase no está inicializado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env local.');
}
