import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  GOOGLE_PLACES_API_KEY: z.string().default(""),
  GOOGLE_PLACES_REVIEW_TTL_HOURS: z.coerce.number().positive().default(24),
  GOOGLE_PLACES_COUNTRY_TTL_HOURS: z.coerce.number().positive().default(24)
});

export const env = envSchema.parse(process.env);
