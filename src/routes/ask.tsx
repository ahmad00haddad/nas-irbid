import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, HelpCircle, CheckCircle2, Loader2, User } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useSpamGuard, HONEYPOT_INPUT_PROPS } from "@/lib/spam-guard";

const askSchema = z.object({
  question: z.string().trim().min(3, "السؤال قصير جداً").max(1000, "السؤال طويل جداً (الحد 1000 حرف)"),
  name: z.string().trim().max(100, "الاسم طويل جداً").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const Route = createFileRoute("/ask")({
  component: AskPage,
  head: () => ({
    meta: [
      { title: "اسأل الضيف · ناس إربد" },
      { name: "description", content: "اختر شخصية من ضيوف ناس إربد واسألها سؤالك الخاص." },
      { property: "og:title", content: "اسأل الضيف · ناس إربد" },
      { property: "og:description", content: "أرسل سؤالك لأحد ضيوف البرنامج لنطرحه في حلقة لاحقة." },
      { property: "og:url", content: "https://nas-irbid.lovable.app/ask" },
    ],
    links: [{ rel: "canonical", href: "https://nas-irbid.lovable.app/ask" }],
  }),
});

function AskPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [episodeId, setEpisodeId] = useState<string>("");
  const spam = useSpamGuard();

  const { data: episodes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["ask-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, title, character_name, episode_number, cover_image_url, youtube_id, profession")
        .eq("published", true)
        .order("episode_number", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const selected = episodes.find((e: any) => e.id === episodeId);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (spam.isSpam(form)) { setSubmitted(true); return; }
    const fd = new FormData(form);
    const parsed = askSchema.safeParse({
      question: String(fd.get("question") ?? ""),
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
    });
    if (!parsed.success) {
      toast.error("تعذّر الإرسال", { description: parsed.error.issues[0]?.message });
      return;
    }
    const lastSubmit = localStorage.getItem("lastAskSubmit");
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      toast.error("يرجى الانتظار", { description: "عفواً، لا يمكنك إرسال سؤال آخر بهذه السرعة. جرب بعد دقيقة." });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("questions").insert({
      episode_id: episodeId || null,
      target_character: selected?.character_name ?? selected?.title ?? null,
      question_text: parsed.data.question,
      submitter_name: parsed.data.name || null,
      submitter_email: null,
    });

    setSubmitting(false);
    if (error) {
      toast.error("تعذّر الإرسال", { description: error.message });
      return;
    }

    localStorage.setItem("lastAskSubmit", Date.now().toString());
    setSubmitted(true);
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
            في بالك سؤال لأحد ضيوف «ناس إربد»؟ اختر الشخصية من الأسفل،
            واكتب سؤالك — وممكن نطرحه عليه في حلقة لاحقة.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card border border-primary/30 rounded-3xl p-12 text-center shadow-deep"
            >
              <div className="inline-flex w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
              <h2 className="font-display text-4xl text-foreground mb-4">وصلنا سؤالك!</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                شكراً لمشاركتك. رح نختار أفضل الأسئلة ونطرحها في الحلقات الجاية.
                {selected && (
                  <span className="block mt-2 font-semibold text-foreground">
                    سؤالك موجّه لـ: {selected.character_name ?? selected.title}
                  </span>
                )}
              </p>
              <button
                onClick={() => { setSubmitted(false); setEpisodeId(""); }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-primary/40 text-foreground font-bold hover:bg-primary/10 transition"
              >
                ابعت سؤال ثاني
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Guest Selection — Cards instead of <select> */}
              <div>
                <span className="block text-sm font-semibold text-foreground mb-4">
                  اختر الضيف اللي بدك تسأله *
                </span>

                {isLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-28 rounded-2xl bg-card animate-pulse border border-border" />
                    ))}
                  </div>
                )}

                {isError && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-3">تعذّر تحميل الضيوف</p>
                    <button type="button" onClick={() => refetch()} className="text-sm font-bold text-primary hover:underline">
                      حاول مجدداً
                    </button>
                  </div>
                )}

                {!isLoading && !isError && episodes.length === 0 && (
                  <div className="text-center py-12 rounded-2xl bg-card border border-dashed border-border">
                    <p className="text-muted-foreground">لا توجد حلقات منشورة بعد. تابعنا قريباً.</p>
                  </div>
                )}

                {episodes.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {episodes.map((ep: any) => {
                      const img = ep.cover_image_url ?? (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/mqdefault.jpg` : null);
                      const isSelected = episodeId === ep.id;
                      return (
                        <button
                          key={ep.id}
                          type="button"
                          onClick={() => setEpisodeId(ep.id)}
                          className={`relative overflow-hidden rounded-2xl border-2 text-right transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                            isSelected
                              ? "border-primary shadow-glow scale-[1.03]"
                              : "border-border/60 hover:border-primary/50 bg-card"
                          }`}
                        >
                          {img && (
                            <img
                              src={img}
                              alt={ep.character_name ?? ep.title}
                              className="w-full h-20 object-cover"
                            />
                          )}
                          {!img && (
                            <div className="w-full h-20 bg-secondary flex items-center justify-center">
                              <User size={28} className="text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="p-2.5">
                            <p className="text-xs font-bold text-foreground leading-tight line-clamp-1">
                              {ep.character_name ?? ep.title}
                            </p>
                            {ep.profession && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{ep.profession}</p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle2 size={12} className="text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Question */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-deep space-y-5">
                <label className="block">
                  <span className="block text-sm font-semibold text-foreground mb-2">سؤالك *</span>
                  <textarea
                    name="question"
                    required
                    minLength={3}
                    rows={5}
                    placeholder={selected ? `اكتب سؤالك لـ ${selected.character_name ?? selected.title}…` : "اكتب سؤالك للضيف باللهجة الإربداوية أو الفصحى — كيفما تحب."}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none text-base"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold text-foreground mb-2">اسمك (اختياري)</span>
                  <input
                    name="name"
                    placeholder="حتى نذكرك إذا انطرح السؤال"
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base"
                  />
                </label>

                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                  <label>Website<input {...HONEYPOT_INPUT_PROPS} /></label>
                </div>
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={submitting || !episodeId}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition disabled:opacity-50 text-base"
                  >
                    {submitting ? (
                      <><Loader2 size={18} className="animate-spin" /> جاري الإرسال…</>
                    ) : (
                      <><Send size={18} /> ابعت سؤالك</>
                    )}
                  </button>
                  {!episodeId && episodes.length > 0 && (
                    <p className="text-xs text-muted-foreground">اختر ضيفاً من الأعلى لتفعيل الإرسال.</p>
                  )}
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
