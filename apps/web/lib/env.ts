// This file ensures essential environment variables are set.
// It can be imported in the root layout or critical server components to fail fast.

const requiredEnvs = [
  'DATABASE_URL',
  'JWT_SECRET',
  'MONGODB_URI',
  'MONGODB_DB_NAME',
];

export function validateEnv() {
  if (typeof window !== 'undefined') return; // Only validate on server

  const missingEnvs = requiredEnvs.filter(
    (key) => !process.env[key]
  );

  if (missingEnvs.length > 0) {
    throw new Error(
      `❌ Invalid/Missing environment variables: ${missingEnvs.join(', ')}. Please refer to .env.local.`
    );
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  MONGODB_URI: process.env.MONGODB_URI as string,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME as string,
};
