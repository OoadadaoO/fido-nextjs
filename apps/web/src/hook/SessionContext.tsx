"use client";

import { createContext, useContext, useEffect, useState } from "react";

import axios from "axios";

import type { Session } from "@/lib/auth/types";
import type { GetSessionResponse } from "@/lib/types/api/session";
import { parseSession } from "@/lib/utils/parseSession";

export type SessionContextType = {
  ready: boolean;
  session: Session | null;
  setSession: (session: Session | null) => void;
};

export const SessionContext = createContext<SessionContextType>({
  ready: false,
  session: null,
  setSession: () => {},
});

type Props = {
  children: React.ReactNode;
};

export function SessionProvider({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { data },
      } = await axios.get<GetSessionResponse>("/api/auth/session");
      const s = data ? parseSession(data) : null;
      console.log("Session", s);
      setSession(s);
      setReady(true);
    };

    getSession();
  }, []);

  return (
    <SessionContext.Provider value={{ ready, session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  // if (!context) {
  //   throw new Error("useSession must be used within a SessionProvider");
  // }
  return context;
}
