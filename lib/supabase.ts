// ./lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase' // <-- ¡Importante! Importa tus tipos

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Pasa los tipos genéricos al cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)