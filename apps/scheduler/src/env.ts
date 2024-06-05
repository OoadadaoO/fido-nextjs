import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env" });

const envSchema = z.object({
  MONGO_URL: z.string(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = {
  MONGO_URL: process.env.MONGO_URL!,
};

envSchema.parse(env);
