import { type NextRequest, NextResponse } from "next/server";

import { Types } from "mongoose";

import { serverCred, sessionToken } from "./lib/auth/config";
import { decrypt, encrypt } from "./lib/auth/jwtCrypto";
import { getPathnameLocale, getPreferLocale } from "./lib/locale";
import { locale } from "./lib/locale/config";
import { applySetCookie } from "./lib/utils/applySetCookie";
import { base64Url } from "./lib/utils/base64Url";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();

  // refresh session
  const oldJwt = request.cookies.get(sessionToken.cookieName)?.value;
  if (oldJwt) {
    const expires = new Date(Date.now() + sessionToken.expDiff);
    const token = await decrypt(oldJwt);
    if (!token) return Response.redirect(new URL("/", request.url));
    const newJwt = await encrypt(token, expires);
    const res = NextResponse.next();
    res.cookies.set({
      name: sessionToken.cookieName,
      value: newJwt,
      expires,
      ...sessionToken.cookieOptions,
    });
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
  if (pathname.match(/\/auth\//)) {
    res.cookies.set({
      name: serverCred.cookieName,
      value: generateAuth(),
    });
  }

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

function generateAuth() {
  const id = new Types.ObjectId().toHexString();
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const challenge = base64Url.encode(randomBytes);
  return `${id}.${challenge}`;
}
