import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Film, Users, MessageSquare, HelpCircle, Eye, Clock,
  Inbox, CheckCircle2, ArrowLeft, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [
        epsAll, epsPublished, sugNew, sugAll, msgsNew, msgsAll, qsAll,
        recentMsgs, recentSugs, recentEps,
      ] = await Promise.all([
        supabase.from("episodes").select("id", { count: "exact", head: true }),
        supabase.from("episodes").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("guest_suggestions").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("guest_suggestions").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("questions").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id, name, subject, created_at, handled").order("created_at", { ascending: false }).limit(5),
        supabase.from("guest_suggestions").select("id, candidate_name, created_at, status").order("created_at", { ascending: false }).limit(5),
        supabase.from("episodes").select("id, title, slug, published, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      return {
        epsAll: epsAll.count ?? 0,
        epsPublished: epsPublished.count ?? 0,
        epsDraft: (epsAll.count ?? 0) - (epsPublished.count ?? 0),
        sugNew: sugNew.count ?? 0,
        sugAll: sugAll.count ?? 0,
        msgsNew: msgsNew.count ?? 0,
        msgsAll: msgsAll.count ?? 0,
        qsAll: qsAll.count ?? 0,
        recentMsgs: recentMsgs.data ?? [],
        recentSugs: recentSugs.data ?? [],
        recentEps: recentEps.data ?? [],
      };
    },
  });

  const stats = [
    { label: "حلقات منشورة", value: data?.epsPublished ?? "—", sub: `${data?.epsDraft ?? 0} مسودّة`, icon: Film, href: "/admin/episodes" },
    { label: "رسائل جديدة", value: data?.msgsNew ?? "—", sub: `${data?.msgsAll ?? 0} إجمالاً`, icon: Inbox, href: "/admin/messages", urgent: (data?.msgsNew ?? 0) > 0 },
    { label: "اقتراحات جديدة", value: data?.sugNew ?? "—", sub: `${data?.sugAll ?? 0} إجمالاً`, icon: Users, href: "/admin/suggestions", urgent: (data?.sugNew ?? 0) > 0 },
    { label: "أسئلة في البنك", value: data?.qsAll ?? "—", sub: "للاستخدام بالحلقات", icon: HelpCircle, href: "/admin/questions" },
  ];

  if (isError) {
    return <div className="rounded-2xl border border-destructive/30 bg-card p-10 text-center"><h1 className="font-display text-2xl text-foreground">تعذّر تحميل لوحة الإدارة</h1><p className="mt-2 text-sm text-muted-foreground">لم نتمكن من قراءة أحدث البيانات.</p><button onClick={() => refetch()} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">إعادة المحاولة</button></div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">نظرة عامة</h1>
          <p className="text-sm text-muted-foreground">ملخّص شامل لحالة الموقع وأحدث النشاطات.</p>
        </div>
        <Link
          to="/admin/episodes"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow"
        >
          <Sparkles size={14} /> إضافة حلقة جديدة
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((c) => (
          <Link
            to={c.href as "/admin"}
            key={c.label}
            className={`p-5 rounded-2xl bg-card border transition hover:-translate-y-0.5 ${c.urgent ? "border-primary/60 shadow-glow" : "border-border/60 hover:border-primary/40"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <c.icon size={20} className={c.urgent ? "text-primary" : "text-muted-foreground"} />
              {c.urgent && <span className="text-[10px] font-bold text-primary tracking-widest">جديد</span>}
            </div>
            <div className="font-display text-3xl text-foreground">{isLoading ? "…" : c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
            <div className="text-[11px] text-muted-foreground/70 mt-2 pt-2 border-t border-border/40">{c.sub}</div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-5">
        <ActivityCard
          title="أحدث الرسائل"
          icon={MessageSquare}
          href="/admin/messages"
          empty="لا توجد رسائل بعد"
          items={(data?.recentMsgs ?? []).map((m: any) => ({
            id: m.id,
            primary: m.subject || "(بدون عنوان)",
            secondary: m.name,
            time: m.created_at,
            badge: m.handled ? null : "جديد",
          }))}
        />
        <ActivityCard
          title="أحدث الاقتراحات"
          icon={Users}
          href="/admin/suggestions"
          empty="لا توجد اقتراحات بعد"
          items={(data?.recentSugs ?? []).map((s: any) => ({
            id: s.id,
            primary: s.candidate_name,
            secondary: s.status === "new" ? "بانتظار المراجعة" : s.status,
            time: s.created_at,
            badge: s.status === "new" ? "جديد" : null,
          }))}
        />
        <ActivityCard
          title="أحدث الحلقات"
          icon={Film}
          href="/admin/episodes"
          empty="لا توجد حلقات بعد"
          items={(data?.recentEps ?? []).map((e: any) => ({
            id: e.id,
            primary: e.title,
            secondary: e.published ? "منشورة" : "مسودّة",
            time: e.created_at,
            badge: e.published ? null : "مسودة",
          }))}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-10 p-6 rounded-2xl bg-card border border-border/60">
        <h2 className="font-display text-xl text-foreground mb-4">إجراءات سريعة</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction to="/admin/episodes" icon={Film} label="إدارة الحلقات" />
          <QuickAction to="/admin/settings" icon={Sparkles} label="تعديل نصوص الموقع" />
          <QuickAction to="/admin/messages" icon={MessageSquare} label="الردّ على الرسائل" />
          <QuickAction to="/" icon={Eye} label="معاينة الموقع" />
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ title, icon: Icon, href, items, empty }: {
  title: string; icon: any; href: string;
  items: { id: string; primary: string; secondary?: string; time?: string; badge?: string | null }[];
  empty: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-primary" />
          <h3 className="font-display text-lg text-foreground">{title}</h3>
        </div>
        <Link to={href as "/admin"} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
          الكل <ArrowLeft size={12} />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((it) => (
            <li key={it.id} className="text-sm border-b border-border/40 last:border-b-0 pb-2.5 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <span className="text-foreground font-semibold line-clamp-1 flex-1">{it.primary}</span>
                {it.badge && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">{it.badge}</span>}
              </div>
              {it.secondary && <div className="text-xs text-muted-foreground mt-0.5">{it.secondary}</div>}
              {it.time && (
                <div className="text-[11px] text-muted-foreground/70 mt-1 inline-flex items-center gap-1">
                  <Clock size={10} /> {new Date(it.time).toLocaleDateString("ar")}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to as "/admin"}
      className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/60 hover:bg-primary/5 transition"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </Link>
  );
}
