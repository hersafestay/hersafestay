import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

// Browser Supabase client — uses @supabase/ssr so sessions are stored in cookies,
// not localStorage. This lets proxy.js (middleware) read and refresh the session.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client — only use in API routes, never in client components.
// Requires SUPABASE_SERVICE_ROLE_KEY (not NEXT_PUBLIC).
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY not set. ' +
      'This client is for server-side use only.'
    );
  }
  return createClient(supabaseUrl, serviceRoleKey);
}
