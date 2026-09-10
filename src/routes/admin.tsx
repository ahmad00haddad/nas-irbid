import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Film, Users, MessageSquare, HelpCircle, LogOut, Settings, ShieldAlert, BarChart3, Search, Compass } from "lucide-react";
import { AdminTour, startAdminTour } from "@/components/admin/AdminTour";
import { AdminCommandPalette, openAdminPalette } from "@/components/admin/AdminCommandPalette";
import { AdminHint } from "@/components/admin/AdminHint";

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

type NavItem = { to: string; label: string; icon: any; exact?: boolean; badge?: "msgs" | "sugs" };

// Nav items visible to all editors (admin + editor role)
const editorNav: NavItem[] = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { to: "/admin/episodes", label: "الحلقات", icon: Film },
  { to: "/admin/suggestions", label: "الاقتراحات", icon: Users, badge: "sugs" },
  { to: "/admin/questions", label: "بنك الأسئلة", icon: HelpCircle },
  { to: "/admin/messages", label: "الرسائل", icon: MessageSquare, badge: "msgs" },
];

// Nav items visible only to admins
const adminOnlyNav: NavItem[] = [
  { to: "/admin/analytics", label: "إحصائيات الموقع", icon: BarChart3 },
  { to: "/admin/settings", label: "إعدادات الموقع", icon: Settings },
];

// Live "needs attention" counters shown as pulsing badges next to nav links.
function useAdminCounts() {
  return useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [msgs, sugs] = await Promise.all([
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
        supabase.from("guest_suggestions").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return { msgs: msgs.count ?? 0, sugs: sugs.count ?? 0 };
    },
    staleTime: 30_000,
  });
}

function AdminLayout() {
  const { user, loading, isEditor, isAdmin, signOut } = useAuth();
  const { data: counts } = useAdminCounts();

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
      <AdminTour />
      <AdminCommandPalette isAdmin={isAdmin} />

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-card border border-border/60 rounded-2xl p-4 sticky top-24">
            <div className="px-3 py-3 border-b border-border/60 mb-3">
              <div className="text-xs text-muted-foreground">مسجّل دخول كـ</div>
              <div className="text-sm font-semibold text-foreground truncate">{user.email}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-bold tracking-widest ${isAdmin ? "text-primary" : "text-muted-foreground"}`}>
                  {isAdmin ? "مسؤول" : "محرر"}
                </span>
                <AdminHint label="ما معنى الدور؟">
                  {isAdmin
                    ? "المسؤول يرى كل شيء: الحلقات والرسائل والإحصائيات وإعدادات الموقع، ويمكنه الحذف النهائي."
                    : "المحرّر يضيف الحلقات ويراجع الاقتراحات والرسائل، لكن الإعدادات والإحصائيات للمسؤول فقط."}
                </AdminHint>
              </div>
            </div>

            <button
              data-tour="palette"
              onClick={openAdminPalette}
              className="w-full flex items-center gap-2 px-3 py-2 mb-3 rounded-lg border border-border/60 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition"
            >
              <Search size={14} />
              <span>بحث سريع</span>
              <kbd className="ms-auto text-[10px] font-sans border border-border/70 rounded px-1.5 py-0.5">Ctrl K</kbd>
            </button>

            <nav data-tour="nav" className="flex flex-col gap-1">
              {navItems.map((it) => {
                const badgeCount = it.badge ? (counts?.[it.badge] ?? 0) : 0;
                return (
                  <Link
                    key={it.to} to={it.to as "/admin"}
                    activeOptions={{ exact: (it as any).exact }}
                    className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-background/60 transition"
                    activeProps={{ className: "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-primary bg-primary/10" }}
                  >
                    <it.icon size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                    {it.label}
                    {badgeCount > 0 && (
                      <span className="relative ms-auto inline-flex">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-ping" />
                        <span className="relative inline-flex min-w-5 justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-5 text-primary-foreground">
                          {badgeCount.toLocaleString("ar-JO")}
                        </span>
                      </span>
                    )}
                  </Link>
                );
              })}

              <button
                onClick={startAdminTour}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-primary transition mt-2 border-t border-border/60 pt-4"
              >
                <Compass size={16} /> جولة تعريفية
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive transition"
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
