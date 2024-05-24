import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { base64url } from "jose";

import { privateEnv } from "../env/private";

export const auth: {
  cookieName: string;
  cookieOptions: Partial<ResponseCookie>;
} = {
  cookieName:
    privateEnv.NODE_ENV === "production" ? "____Secure.auth" : "__Dev.auth",
  cookieOptions: {},
};

export const session: {
  secret: Uint8Array;
  protectedHeader: { alg: string; enc: string };
  expDiff: number;
  jwtCookieName: string;
  jwtCookieOptions: Partial<ResponseCookie>;
} = {
  secret: base64url.decode(privateEnv.AUTH_SECRET),
  protectedHeader: { alg: "dir", enc: "A128CBC-HS256" },
  expDiff: parseTimeToMilliSeconds(privateEnv.AUTH_EXPIRES),
  jwtCookieName:
    privateEnv.NODE_ENV === "production" ? "____Secure.jwt" : "__Dev.jwt",
  jwtCookieOptions: {
    httpOnly: true,
    secure: privateEnv.NODE_ENV === "production",
    sameSite: "lax",
  },
};

function parseTimeToMilliSeconds(timeString: string) {
  const units: { [unit: string]: number } = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
  };

  const regex = /^(\d+)([smhdw])$/;
  const match = regex.exec(timeString.toLowerCase());

  if (!match) {
    throw new Error("Invalid time string format");
  }

  const amount = parseInt(match[1]);
  const unit = match[2];

  return amount * (units[unit] || 60) * 1000;
}
