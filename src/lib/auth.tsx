import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isEditor: boolean;
  /** true until both session AND roles are resolved */
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, session: null, isAdmin: false, isEditor: false, loading: true,
  signOut: async () => {},
});

async function fetchRoles(userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  // Two-phase loading: session + roles must both resolve before loading=false
  const [sessionLoading, setSessionLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);

  useEffect(() => {
    // Initial session fetch — blocks loading until roles are also fetched
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setRolesLoading(true);
        const r = await fetchRoles(s.user.id);
        setRoles(r);
        setRolesLoading(false);
      }
      setSessionLoading(false);
    });

    // Subsequent auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setRolesLoading(true);
        fetchRoles(s.user.id).then((r) => {
          setRoles(r);
          setRolesLoading(false);
        });
      } else {
        setRoles([]);
        setRolesLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user, session,
        loading: sessionLoading || rolesLoading,
        isAdmin: roles.includes("admin"),
        isEditor: roles.includes("editor") || roles.includes("admin"),
        signOut: async () => { await supabase.auth.signOut(); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
