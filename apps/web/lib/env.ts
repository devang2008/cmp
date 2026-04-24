// This file ensures essential environment variables are set.
// It can be imported in the root layout or critical server components to fail fast.

const requiredEnvs = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

export function validateEnv() {
  if (typeof window !== 'undefined') return; // Only validate on server

  const missingEnvs = requiredEnvs.filter(
    (key) => !process.env[key]
  );

  if (missingEnvs.length > 0) {
    throw new Error(
      `❌ Invalid/Missing environment variables: ${missingEnvs.join(', ')}. Please refer to .env.example.`
    );
  }
}

// Export a parsed/validated object if needed
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, // Optional on the client, required for some server tasks
};
