import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let roleRequestId = 0;

    const syncAdminRole = async (userId: string | null) => {
      const requestId = ++roleRequestId;

      if (!userId) {
        if (isMounted) {
          setIsAdmin(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (!isMounted || requestId !== roleRequestId) {
          return;
        }

        if (error) {
          throw error;
        }

        setIsAdmin(data?.some((role) => role.role === "admin") ?? false);
      } catch {
        if (isMounted && requestId === roleRequestId) {
          setIsAdmin(false);
        }
      }
    };

    const syncSession = (nextSession: Session | null) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      void syncAdminRole(nextSession?.user?.id ?? null);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncSession(nextSession);
    });

    void supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        syncSession(initialSession);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      roleRequestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
