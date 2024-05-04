import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/hook/ThemeProvider";

import { ThemeButton } from "./_components-layout/ThemeButtom";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fido App",
  description: "A simple app authenticating users with Fido2",
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  return (
    <html lang={params.lang.split("-")[0]} className="">
      <ThemeProvider>
        <body className={inter.className}>
          <ThemeButton />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
