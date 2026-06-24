import { createClient } from "@supabase/supabase-js";

// Cliente público (usado no navegador) - só consegue LER horários (slots)
export function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Cliente administrativo (usado SOMENTE dentro das rotas /api no servidor)
// Usa a service role key, que tem permissão total no banco.
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
