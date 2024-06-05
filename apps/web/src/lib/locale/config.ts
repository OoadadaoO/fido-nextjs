import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { privateEnv } from "../env/private";
import { publicEnv } from "../env/public";

export const locale: {
  accepts: string[];
  default: string;
  cookieName: string;
  cookieOptions: Partial<ResponseCookie>;
} = {
  accepts: ["en-US"],
  default: "en-US",
  cookieName:
    privateEnv.NODE_ENV === "production"
      ? "FIDOG_LOCALE"
      : "__Dev.FIDOG_LOCALE",
  cookieOptions: {
    secure: publicEnv.NEXT_PUBLIC_BASE_URL.startsWith("https"),
  },
};
