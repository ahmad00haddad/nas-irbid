import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Film, Users, Heart, MessageSquare, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [eps, sugg, mems, msgs, qs] = await Promise.all([
        supabase.from("episodes").select("id", { count: "exact", head: true }),
        supabase.from("guest_suggestions").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("memories").select("id", { count: "exact", head: true }).eq("approved", false),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
        supabase.from("questions").select("id", { count: "exact", head: true }),
      ]);
      return {
        episodes: eps.count ?? 0,
        newSuggestions: sugg.count ?? 0,
        pendingMemories: mems.count ?? 0,
        newMessages: msgs.count ?? 0,
        questions: qs.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "حلقات إجمالاً", value: data?.episodes ?? "—", icon: Film },
    { label: "اقتراحات جديدة", value: data?.newSuggestions ?? "—", icon: Users, urgent: (data?.newSuggestions ?? 0) > 0 },
    { label: "ذكريات بانتظار الموافقة", value: data?.pendingMemories ?? "—", icon: Heart, urgent: (data?.pendingMemories ?? 0) > 0 },
    { label: "رسائل جديدة", value: data?.newMessages ?? "—", icon: MessageSquare, urgent: (data?.newMessages ?? 0) > 0 },
    { label: "أسئلة في البنك", value: data?.questions ?? "—", icon: HelpCircle },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground mb-2">نظرة عامة</h1>
      <p className="text-sm text-muted-foreground mb-8">ملخص حالة محتوى الموقع.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`p-6 rounded-2xl bg-card border ${c.urgent ? "border-primary/60 shadow-glow" : "border-border/60"}`}>
            <div className="flex items-start justify-between mb-4">
              <c.icon size={20} className={c.urgent ? "text-primary" : "text-muted-foreground"} />
              {c.urgent && <span className="text-[10px] font-bold text-primary tracking-widest">جديد</span>}
            </div>
            <div className="font-display text-4xl text-foreground">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-card border border-border/60">
        <h2 className="font-display text-xl text-foreground mb-2">مرحباً بك في لوحة الإدارة</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          من هنا يمكنك إدارة كل تفاصيل موقع ناس إربد: إضافة حلقات جديدة (مع تضمين فيديو يوتيوب)،
          مراجعة اقتراحات الجمهور، الموافقة على ذكريات المتابعين، والرد على الرسائل.
        </p>
      </div>
    </div>
  );
}
