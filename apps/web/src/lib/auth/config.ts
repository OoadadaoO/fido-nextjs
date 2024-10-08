import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { base64url } from "jose";

import { privateEnv } from "../env/private";
import { publicEnv } from "../env/public";

export const serverCred: {
  cookieName: string;
  cookieOptions: Partial<ResponseCookie>;
} = {
  cookieName:
    privateEnv.NODE_ENV === "production" ? "FIDOG_CRED" : "__Dev.FIDOG_CRED",
  cookieOptions: {
    httpOnly: true,
    secure: publicEnv.NEXT_PUBLIC_BASE_URL.startsWith("https"),
    sameSite: "lax",
  },
};

export const sessionToken: {
  secret: Uint8Array;
  protectedHeader: { alg: string; enc: string };
  expDiff: number;
  extDiff: number;
  cookieName: string;
  cookieOptions: Partial<ResponseCookie>;
} = {
  secret: base64url.decode(privateEnv.AUTH_SECRET),
  protectedHeader: { alg: "dir", enc: "A128CBC-HS256" },
  expDiff: parseTimeToMilliSeconds(privateEnv.AUTH_EXPIRES),
  extDiff: parseTimeToMilliSeconds(privateEnv.AUTH_ACTIVE_EXTEND),
  cookieName:
    privateEnv.NODE_ENV === "production" ? "FIDOG_SST" : "__Dev.FIDOG_SST",
  cookieOptions: {
    httpOnly: true,
    secure: publicEnv.NEXT_PUBLIC_BASE_URL.startsWith("https"),
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
