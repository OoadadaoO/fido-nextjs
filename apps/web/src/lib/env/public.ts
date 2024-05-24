import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NEXT_PUBLIC_RP_ID: z.string(),
});

type PublicEnv = z.infer<typeof publicEnvSchema>;

export const publicEnv: PublicEnv = {
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
  NEXT_PUBLIC_RP_ID: process.env.NEXT_PUBLIC_RP_ID!,
};

publicEnvSchema.parse(publicEnv);
