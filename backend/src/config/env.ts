import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8080').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  GCP_PROJECT_ID: z.string().default('ai-learning-499409'),
  FIRESTORE_COLLECTION: z.string().default('grocery-list-app'),
  CORS_ORIGIN: z.string().default('*')
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  FIRESTORE_COLLECTION: process.env.FIRESTORE_COLLECTION,
  CORS_ORIGIN: process.env.CORS_ORIGIN
});
