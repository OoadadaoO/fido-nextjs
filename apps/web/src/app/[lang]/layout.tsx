import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SessionProvider } from "@/hook/SessionContext";
import { ThemeProvider } from "@/hook/ThemeProvider";
import { locale } from "@/lib/locale/config";

import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fidog",
  description: "A web application with FIDO2 authentication.",
  icons: [
    {
      url: `/favicon.ico`,
      sizes: "64x64",
    },
  ],
};

export async function generateStaticParams() {
  return locale.accepts.map((lang) => ({ lang }));
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  return (
    <html
      lang={params.lang.split("-")[0]}
      className=""
      suppressHydrationWarning
    >
      <body className={`${inter.className}`}>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
