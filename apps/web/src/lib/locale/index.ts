import { type NextRequest } from "next/server";

import Negotiator from "negotiator";

import { match } from "@formatjs/intl-localematcher";

import { locale } from "./config";

/**
 * for middleware.ts
 */
export function getPreferLocale(request: NextRequest) {
  // get locale from cookie
  const cookieLocale = request.cookies.get(locale.cookieName)?.value;
  if (cookieLocale && locale.accepts.includes(cookieLocale)) {
    return cookieLocale;
  }
  // get locale from accept-language header
  const headers = {
    "accept-language": request.headers.get("accept-language") || undefined,
  };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locale.accepts, locale.default);
}

/**
 * for middleware.ts
 */
export function pathnameHasLocale(pathname: string) {
  return locale.accepts.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
}

/**
 * for middleware.ts
 */
export function getPathnameLocale(pathname: string) {
  return (
    locale.accepts.find(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    ) || undefined
  );
}
