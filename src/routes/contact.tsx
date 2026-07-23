import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, MessageCircle, CheckCircle2, Loader2, Phone } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/site-settings";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { useSpamGuard, HONEYPOT_INPUT_PROPS } from "@/lib/spam-guard";

const contactSchema = z.object({
  name: z.string().trim().min(2, "اسمك قصير جداً").max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(3, "الموضوع قصير جداً").max(200),
  message: z.string().trim().min(10, "الرسالة قصيرة جداً").max(2000),
  message_type: z.enum(["general", "support", "partnership", "media"]),
});

const messageTypes = [
  { value: "general", label: "استفسار عام" },
  { value: "support", label: "دعم البرنامج" },
  { value: "partnership", label: "شراكة أو تعاون" },
  { value: "media", label: "إعلام وصحافة" },
] as const;

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "تواصل معنا · ناس إربد" },
      { name: "description", content: "راسل فريق ناس إربد لأي استفسار أو تعاون أو دعم." },
      { property: "og:title", content: "تواصل معنا · ناس إربد" },
      { property: "og:url", content: "https://nas-irbid.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://nas-irbid.lovable.app/contact" }],
  }),
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [messageType, setMessageType] = useState<string>("general");
  const { data: settings } = useSiteSettings();
  const email = settings?.contact_email ?? "ahmad000haddad@gmail.com";
  const spam = useSpamGuard();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (spam.isSpam(form)) { setSubmitted(true); return; }
    const fd = new FormData(form);
    const parsed = contactSchema.safeParse({
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
      message_type: messageType,
    });
    if (!parsed.success) {
      toast.error("تعذّر الإرسال", { description: parsed.error.issues[0]?.message });
      return;
    }
    const lastSubmit = localStorage.getItem("lastContactSubmit");
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      toast.error("يرجى الانتظار", { description: "عفواً، انتظر دقيقة قبل إرسال رسالة أخرى." });
      return;
    }

    setSubmitting(true);
    const d = parsed.data;
    const { error } = await supabase.from("contact_messages").insert({
      name: d.name,
      phone: d.phone || null,
      email: null,
      subject: d.subject,
      message: d.message,
      message_type: d.message_type,
      handled: false,
    });
    setSubmitting(false);

    if (error) {
      toast.error("تعذّر الإرسال", { description: error.message });
      return;
    }
    localStorage.setItem("lastContactSubmit", Date.now().toString());
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-6">
            <Mail size={28} className="text-primary-foreground" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl mb-5 text-foreground">
            تواصل <span className="text-gradient-gold">معنا</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            سواء كان عندك سؤال، فكرة تعاون، أو بس بدك تقول «شكراً» —
            رسالتك توصل مباشرة للفريق.
          </p>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline font-semibold"
          >
            <Mail size={14} />
            {email}
          </a>
        </FadeIn>

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
              <h2 className="font-display text-4xl text-foreground mb-4">وصلتنا رسالتك!</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                شكراً لتواصلك مع فريق «ناس إربد». رح نرد عليك في أقرب وقت ممكن.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-primary/40 text-foreground font-bold hover:bg-primary/10 transition"
              >
                إرسال رسالة ثانية
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-deep space-y-6"
            >
              {/* Message type */}
              <div>
                <span className="block text-sm font-semibold text-foreground mb-3">نوع رسالتك</span>
                <div className="flex flex-wrap gap-2" role="group">
                  {messageTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setMessageType(t.value)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                        messageType === t.value
                          ? "bg-primary text-primary-foreground border-primary shadow-glow"
                          : "bg-background border-border/60 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="اسمك *" name="name" placeholder="أبو علي" required />
                <Field label="رقم الواتساب (اختياري)" name="phone" placeholder="07XXXXXXXX" type="tel" />
              </div>

              <Field label="موضوع الرسالة *" name="subject" placeholder="شو موضوع تواصلك؟" required />

              <label className="block">
                <span className="block text-sm font-semibold text-foreground mb-2">رسالتك *</span>
                <textarea
                  name="message"
                  required
                  minLength={10}
                  rows={5}
                  placeholder="اكتب رسالتك هنا…"
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none text-base"
                />
              </label>

              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                <label>Website<input {...HONEYPOT_INPUT_PROPS} /></label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition disabled:opacity-60 text-base"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> جاري الإرسال…</>
                ) : (
                  <><Send size={18} /> أرسل رسالتك</>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground mb-2">{label}</span>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base"
      />
    </label>
  );
}
