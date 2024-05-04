"use client";

import { createContext, useContext } from "react";

import { usePathname, useRouter } from "next/navigation";

export type LocaleContextType = {
  locale: string;
  setLocale: (newLocale: string) => void;
};

export const LocaleContext = createContext<LocaleContextType>({
  locale: "",
  setLocale: () => {},
});

type Props = {
  children: React.ReactNode;
};

export function LocaleProvider({ children }: Props) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const router = useRouter();

  const setLocale = (newLocale: string) => {
    router.push(pathname.replace(locale, newLocale));
    router.refresh();
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  // if (!context) {
  //   throw new Error("useLocale must be used within a LocaleProvider");
  // }
  return context;
}
