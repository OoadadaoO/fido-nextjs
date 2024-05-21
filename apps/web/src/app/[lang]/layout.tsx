import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/hook/ThemeProvider";
import { locale } from "@/lib/locale/config";

import { Header } from "./_components-layout/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fido App",
  description: "A simple app authenticating users with Fido2",
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
      <body
        className={`${inter.className} flex min-h-dvh flex-col antialiased`}
      >
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
