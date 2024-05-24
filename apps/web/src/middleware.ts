import { type NextRequest, NextResponse } from "next/server";

import { generateAuth } from "./lib/auth";
import { auth } from "./lib/auth/config";
import { getPathnameLocale, getPreferLocale } from "./lib/locale";
import { locale } from "./lib/locale/config";
import { applySetCookie } from "./lib/utils/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Locale
  const pathnameLocale = getPathnameLocale(pathname);
  if (!pathnameLocale) {
    const locale = getPreferLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const res = NextResponse.next();
  res.cookies.set({
    name: locale.cookieName,
    value: pathnameLocale,
    ...locale.cookieOptions,
  });

  if (pathname.match(/\/auth\//)) {
    res.cookies.set({
      name: auth.cookieName,
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
