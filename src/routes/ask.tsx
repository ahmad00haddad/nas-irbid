import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ask")({
  component: AskPage,
  head: () => ({
    meta: [
      { title: "اسأل الضيف · ناس إربد" },
      { name: "description", content: "اختر شخصية من ضيوف ناس إربد واسألها سؤالك الخاص." },
      { property: "og:title", content: "اسأل الضيف · ناس إربد" },
      { property: "og:description", content: "أرسل سؤالك لأحد ضيوف البرنامج لنطرحه في حلقة لاحقة." },
    ],
  }),
});

function AskPage() {
  const [submitting, setSubmitting] = useState(false);
  const [episodeId, setEpisodeId] = useState<string>("");

  const { data: episodes = [] } = useQuery({
    queryKey: ["ask-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, title, character_name, episode_number")
        .eq("published", true)
        .order("episode_number", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const selected = episodes.find((e: any) => e.id === episodeId);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.target as HTMLFormElement);

    const { error } = await supabase.from("questions").insert({
      episode_id: episodeId || null,
      target_character: selected?.character_name ?? String(fd.get("custom_target") ?? "") ?? null,
      question_text: String(fd.get("question") ?? ""),
      submitter_name: String(fd.get("name") ?? "") || null,
      submitter_email: String(fd.get("email") ?? "") || null,
    });

    setSubmitting(false);
    if (error) {
      toast.error("تعذّر الإرسال", { description: error.message });
      return;
    }
    toast.success("وصلنا سؤالك — شكراً إلك!", {
      description: "رح نختار أفضل الأسئلة ونطرحها في الحلقات الجاية.",
    });
    (e.target as HTMLFormElement).reset();
    setEpisodeId("");
  };

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-6">
            <HelpCircle size={28} className="text-primary-foreground" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl mb-5 text-foreground">
            اسأل <span className="text-gradient-gold">الضيف</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            في بالك سؤال لأحد ضيوف «ناس إربد»؟ اختر الشخصية من حلقات سابقة،
            واكتب سؤالك — وممكن نطرحه عليه في حلقة لاحقة أو نرد عليك مباشرة.
          </p>
        </header>

        <form onSubmit={onSubmit} className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-deep space-y-6">
          <label className="block">
            <span className="block text-sm font-semibold text-foreground mb-2">اختر الحلقة / الضيف *</span>
            <select
              required
              value={episodeId}
              onChange={(e) => setEpisodeId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            >
              <option value="">— اختر من القائمة —</option>
              {episodes.map((ep: any) => (
                <option key={ep.id} value={ep.id}>
                  {ep.character_name ? `${ep.character_name} — ${ep.title}` : ep.title}
                </option>
              ))}
            </select>
            {episodes.length === 0 && (
              <span className="block text-xs text-muted-foreground mt-2">
                لا توجد حلقات منشورة بعد. تابعنا قريباً.
              </span>
            )}
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-foreground mb-2">سؤالك *</span>
            <textarea
              name="question"
              required
              minLength={3}
              rows={5}
              placeholder="اكتب سؤالك للضيف باللهجة الإربداوية أو الفصحى — كيفما تحب."
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-5">
            <label className="block">
              <span className="block text-sm font-semibold text-foreground mb-2">اسمك (اختياري)</span>
              <input
                name="name"
                placeholder="حتى نذكرك إذا انطرح السؤال"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-foreground mb-2">إيميلك (اختياري)</span>
              <input
                name="email" type="email"
                placeholder="لنرد عليك إذا احتجنا"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !episodeId}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition disabled:opacity-60"
          >
            <Send size={18} />
            {submitting ? "جاري الإرسال…" : "ابعت سؤالك"}
          </button>
        </form>
      </div>
    </div>
  );
}
