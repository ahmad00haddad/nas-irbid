import { createFileRoute, useNavigate, Outlet, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Film, Users, Heart, MessageSquare, HelpCircle, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "لوحة الإدارة · ناس إربد" }] }),
});

const adminNav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { to: "/admin/episodes", label: "الحلقات", icon: Film },
  { to: "/admin/suggestions", label: "الاقتراحات", icon: Users },
  { to: "/admin/memories", label: "الذكريات", icon: Heart },
  { to: "/admin/questions", label: "بنك الأسئلة", icon: HelpCircle },
  { to: "/admin/messages", label: "الرسائل", icon: MessageSquare },
];

function AdminLayout() {
  const { user, loading, isEditor, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) return <div className="container mx-auto px-6 py-20 text-center text-muted-foreground">جاري التحميل…</div>;
  if (!user) return null;

  if (!isEditor) {
    return (
      <div className="container mx-auto px-6 py-20 max-w-md text-center">
        <h2 className="font-display text-2xl text-foreground mb-3">لا تملك صلاحية الوصول</h2>
        <p className="text-sm text-muted-foreground mb-6">
          يجب تعيين دور admin أو editor لحسابك من قِبل المسؤول. حسابك الحالي:
          <br/><span className="text-foreground">{user.email}</span>
        </p>
        <button onClick={signOut} className="px-5 py-2 rounded-full border border-border text-sm">تسجيل الخروج</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-card border border-border/60 rounded-2xl p-4 sticky top-24">
            <div className="px-3 py-3 border-b border-border/60 mb-3">
              <div className="text-xs text-muted-foreground">مسجّل دخول كـ</div>
              <div className="text-sm font-semibold text-foreground truncate">{user.email}</div>
            </div>
            <nav className="flex flex-col gap-1">
              {adminNav.map((it) => (
                <Link
                  key={it.to} to={it.to as "/admin"}
                  activeOptions={{ exact: it.exact }}
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
