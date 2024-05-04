import { z } from "zod";

const privateEnvSchema = z.object({
  NODE_ENV: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  NODE_ENV: process.env.NODE_ENV!,
};

privateEnvSchema.parse(privateEnv);
