import React, { createContext, useContext, useEffect, useState } from "react";
import {
  MobileSession,
  getMobileSession,
  subscribeMobileSession,
} from "./sessionStore";

type SessionContextType = {
  session: MobileSession | null;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MobileSession | null>(getMobileSession());

  useEffect(() => {
    return subscribeMobileSession((updatedSession) => {
      setSession(updatedSession);
    });
  }, []);

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
