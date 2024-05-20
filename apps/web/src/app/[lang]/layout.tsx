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
      <ThemeProvider>
        <body
          className={`${inter.className} flex min-h-dvh flex-col antialiased`}
        >
          <script
            id="load-theme"
            dangerouslySetInnerHTML={{
              __html: themeLoader,
            }}
          />
          <Header />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}

const themeLoader = `(function () {
  if (localStorage.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (localStorage.theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}) ()`;
