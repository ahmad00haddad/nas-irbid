import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, HelpCircle, CheckCircle2, Loader2, User } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useSpamGuard, HONEYPOT_INPUT_PROPS } from "@/lib/spam-guard";
import { trackSiteEvent } from "@/components/site/AnalyticsTracker";

const askSchema = z.object({
  question: z.string().trim().min(3, "السؤال قصير جداً").max(1000, "السؤال طويل جداً (الحد 1000 حرف)"),
  name: z.string().trim().max(100, "الاسم طويل جداً").optional().or(z.literal("")),
  phone: z.string().trim().max(30).regex(/^[0-9\+\-\s\(\)]*$/, "الرجاء إدخال أرقام فقط").optional().or(z.literal("")),
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
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    
    setErrors({});
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
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
    trackSiteEvent("form_submitted", "/ask", { form: "ask", target: selected?.character_name ?? "General" });
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
              <fieldset disabled={submitting} className="space-y-8 disabled:opacity-70 transition-opacity">
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
                  <div className="space-y-5">
                    <div className="relative">
                      <select
                        value={episodeId ?? ""}
                        onChange={(e) => setEpisodeId(e.target.value)}
                        className="w-full appearance-none px-4 py-3.5 rounded-xl bg-input border border-border/80 focus:border-primary focus:ring-primary/20 text-foreground font-semibold focus:outline-none focus:ring-2 transition text-base cursor-pointer shadow-sm"
                      >
                        <option value="" disabled>-- اضغط هنا لاختيار الضيف --</option>
                        {episodes.map((ep: any) => (
                          <option key={ep.id} value={ep.id}>
                            {ep.character_name ?? ep.title} {ep.profession ? `(${ep.profession})` : ""}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-primary">
                        <svg className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>

                    {selected && (
                      <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-primary/20 shadow-glow bg-secondary animate-in fade-in zoom-in-95 duration-300">
                        {(selected.cover_image_url || selected.youtube_id) ? (
                          <img
                            src={selected.cover_image_url ?? `https://img.youtube.com/vi/${selected.youtube_id}/mqdefault.jpg`}
                            alt={selected.character_name ?? selected.title}
                            className="w-full h-full object-cover object-[center_20%]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={48} className="text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                          <div className="text-white">
                            <p className="font-display text-xl font-bold leading-tight">{selected.character_name ?? selected.title}</p>
                            {selected.profession && <p className="text-xs opacity-90 mt-1 text-primary-100">{selected.profession}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Question */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-deep space-y-5">
                <TextArea
                  label="سؤالك *"
                  name="question"
                  required
                  minLength={3}
                  maxLength={1000}
                  rows={5}
                  placeholder={selected ? `اكتب سؤالك لـ ${selected.character_name ?? selected.title}…` : "اكتب سؤالك للضيف باللهجة الإربداوية أو الفصحى — كيفما تحب."}
                  error={errors.question}
                />

                <label className="block">
                  <span className="block text-sm font-semibold text-foreground mb-2">اسمك (اختياري)</span>
                  <input
                    name="name"
                    placeholder="حتى نذكرك إذا انطرح السؤال"
                    className={`w-full px-4 py-3 rounded-lg bg-input border ${errors.name ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"} text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition text-base`}
                  />
                  {errors.name && <p className="mt-1.5 text-xs font-bold text-destructive">{errors.name}</p>}
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
              </fieldset>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TextArea({ label, error, ...props }: { label: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [len, setLen] = useState(0);
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {props.maxLength && (
          <span className={`text-xs font-medium ${len > props.maxLength * 0.9 ? "text-destructive" : "text-muted-foreground"}`}>
            {len} / {props.maxLength}
          </span>
        )}
      </div>
      <textarea
        {...props}
        onChange={(e) => {
          setLen(e.target.value.length);
          props.onChange?.(e);
        }}
        className={`w-full px-4 py-3 rounded-lg bg-input border ${error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"} text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition resize-none text-base`}
      />
      {error && <p className="mt-1.5 text-xs font-bold text-destructive">{error}</p>}
    </label>
  );
}
