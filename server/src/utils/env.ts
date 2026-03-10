import z from "zod";
import dotenv from "dotenv";

dotenv.config();


const envSchema = z.object({
  PORT: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  DB_PATH: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default env;
