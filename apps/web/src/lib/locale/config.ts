import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { privateEnv } from "../env/private";

export const locale: {
  accepts: string[];
  default: string;
  cookieName: string;
  cookieOptions: Partial<ResponseCookie>;
} = {
  accepts: ["en-US"],
  default: "en-US",
  cookieName:
    privateEnv.NODE_ENV === "production" ? "____Secure.locale" : "__Dev.locale",
  cookieOptions: {
    secure: privateEnv.NODE_ENV === "production",
  },
};
