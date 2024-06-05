import { type NextRequest, NextResponse } from "next/server";

import { serverCred, sessionToken } from "./lib/auth/config";
import { decrypt, encrypt } from "./lib/auth/jwtCrypto";
import { getPathnameLocale, getPreferLocale } from "./lib/locale";
import { locale } from "./lib/locale/config";
import { applySetCookie } from "./lib/utils/applySetCookie";
import { base64Url } from "./lib/utils/base64Url";

const authMatch = /^.*\/auth\/.*$/;
const privateMatch = /^.*\/(account)\/.*$/;

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const res = NextResponse.next();

  // refresh session
  const oldJwt = request.cookies.get(sessionToken.cookieName)?.value;
  if (oldJwt) {
    // redirect to home page if on login & signup page
    if (authMatch.test(pathname)) {
      return Response.redirect(
        new URL(searchParams.get("redirect") || "/", request.url),
      );
    }

    // refresh jwt
    const expires = new Date(Date.now() + sessionToken.expDiff);
    const token = await decrypt(oldJwt);
    if (!token) return Response.redirect(new URL("/auth/", request.url));
    const newJwt = await encrypt(token, expires);
    const res = NextResponse.next();
    res.cookies.set({
      name: sessionToken.cookieName,
      value: newJwt,
      expires,
      ...sessionToken.cookieOptions,
    });
  } else {
    // redirect to login page if on private page
    if (privateMatch.test(pathname)) {
      return Response.redirect(new URL("/auth/", request.url));
    }
  }

  // Locale
  const pathnameLocale = getPathnameLocale(pathname);
  if (!pathnameLocale) {
    const locale = getPreferLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }
  res.cookies.set({
    name: locale.cookieName,
    value: pathnameLocale,
    ...locale.cookieOptions,
  });

  // Authentication
  res.cookies.set({
    name: serverCred.cookieName,
    value: generateCred(),
    ...serverCred.cookieOptions,
  });

  applySetCookie(request, res);

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
  missing: [
    { type: "header", key: "next-router-prefetch" },
    { type: "header", key: "purpose", value: "prefetch" },
  ],
};

function generateCred() {
  const id = ObjectId();
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const challenge = base64Url.encode(randomBytes);
  return `${id}.${challenge}`;
}

function ObjectId() {
  const timestamp = ((Date.now() / 1000) | 0).toString(16);
  const rand = crypto.getRandomValues(new Uint8Array(8));
  const hexRand = Buffer.from(rand).toString("hex");
  return timestamp + hexRand;
}
