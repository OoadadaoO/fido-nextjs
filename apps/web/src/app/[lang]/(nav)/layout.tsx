import { auth } from "@/lib/auth";

import { Header } from "./_components-layout/Header";

export default async function NavLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  params;
  const session = await auth();
  return (
    <div className={`flex min-h-dvh flex-col antialiased`}>
      <Header session={session} />
      {children}
    </div>
  );
}
