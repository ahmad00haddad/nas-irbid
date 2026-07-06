import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Film, Users, MessageSquare, HelpCircle, LogOut, Settings, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  // Client-only render so the admin shell never appears in server HTML — no SSR flash.
  ssr: false,
  // Auth gate runs before children mount; unauthenticated users go straight to /auth.
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AdminLayout,
  head: () => ({ meta: [{ title: "لوحة الإدارة · ناس إربد" }, { name: "robots", content: "noindex" }] }),
});

// Nav items visible to all editors (admin + editor role)
const editorNav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { to: "/admin/episodes", label: "الحلقات", icon: Film },
  { to: "/admin/suggestions", label: "الاقتراحات", icon: Users },
  { to: "/admin/questions", label: "بنك الأسئلة", icon: HelpCircle },
  { to: "/admin/messages", label: "الرسائل", icon: MessageSquare },
];

// Nav items visible only to admins
const adminOnlyNav: { to: string; label: string; icon: typeof LayoutDashboard }[] = [
  { to: "/admin/settings", label: "إعدادات الموقع", icon: Settings },
];

function AdminLayout() {
  const { user, loading, isEditor, isAdmin, signOut } = useAuth();

  if (loading) return <div className="container mx-auto px-6 py-20 text-center text-muted-foreground">جاري التحميل…</div>;
  if (!user) return null;

  if (!isEditor) {
    return (
      <div className="container mx-auto px-6 py-20 max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-destructive/10 items-center justify-center mb-4">
          <ShieldAlert size={24} className="text-destructive" />
        </div>
        <h2 className="font-display text-2xl text-foreground mb-3">لا تملك صلاحية الوصول</h2>
        <p className="text-sm text-muted-foreground mb-6">
          يجب تعيين دور <span className="font-semibold text-foreground">admin</span> أو <span className="font-semibold text-foreground">editor</span> لحسابك من قِبل المسؤول.
          <br/><span className="text-foreground">{user.email}</span>
        </p>
        <button onClick={signOut} className="px-5 py-2 rounded-full border border-border text-sm">تسجيل الخروج</button>
      </div>
    );
  }

  const navItems = isAdmin ? [...editorNav, ...adminOnlyNav] : editorNav;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-card border border-border/60 rounded-2xl p-4 sticky top-24">
            <div className="px-3 py-3 border-b border-border/60 mb-3">
              <div className="text-xs text-muted-foreground">مسجّل دخول كـ</div>
              <div className="text-sm font-semibold text-foreground truncate">{user.email}</div>
              <div className={`text-[10px] font-bold tracking-widest mt-1 ${isAdmin ? "text-primary" : "text-muted-foreground"}`}>
                {isAdmin ? "مسؤول" : "محرر"}
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((it) => (
                <Link
                  key={it.to} to={it.to as "/admin"}
                  activeOptions={{ exact: (it as any).exact }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-background/60 transition"
                  activeProps={{ className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-primary bg-primary/10" }}
                >
                  <it.icon size={16} />
                  {it.label}
                </Link>
              ))}
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive transition mt-2 border-t border-border/60 pt-4"
              >
                <LogOut size={16} /> تسجيل الخروج
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
