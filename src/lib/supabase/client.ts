import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith("http")) {
    // Return a dummy client or throw a more descriptive error if needed
    // During build or initial setup, environment variables might be missing or invalid
    return {} as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
