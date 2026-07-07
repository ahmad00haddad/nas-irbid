import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Send, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const suggestSchema = z.object({
  character: z.string().trim().min(2, "اسم الشخصية قصير جداً").max(120),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  place: z.string().trim().min(2, "الحي أو المكان مطلوب").max(120),
  age: z.string().trim().max(40).optional().or(z.literal("")),
  story: z.string().trim().min(5, "الحكاية قصيرة جداً").max(2000, "الحكاية طويلة (الحد 2000 حرف)"),
  name: z.string().trim().min(2, "اسمك مطلوب").max(100),
  phone: z.string().trim().min(6, "رقم غير صالح").max(30, "رقم طويل جداً"),
});

export const Route = createFileRoute("/suggest")({
  component: SuggestPage,
  head: () => ({
    meta: [
      { title: "اقترح حكاية · ناس إربد" },
      { name: "description", content: "رشّح شخصية، مهنة قديمة، أو حكاية لتظهر في حلقة قادمة من ناس إربد." },
      { property: "og:title", content: "اقترح حكاية · ناس إربد" },
      { property: "og:description", content: "البرنامج يصنعه أهله. رشّح حدا تعرف يستاهل حلقة." },
      { property: "og:url", content: "https://nas-irbid.lovable.app/suggest" },
    ],
    links: [{ rel: "canonical", href: "https://nas-irbid.lovable.app/suggest" }],
  }),
});

function SuggestPage() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const f = e.target as HTMLFormElement;
    const fd = new FormData(f);

    // Preserve the optional age field by prepending it to the story summary,
    // since the table doesn't have a dedicated column for it.
    const ageRaw = String(fd.get("age") ?? "").trim();
    const storyRaw = String(fd.get("story") ?? "").trim();
    const story_summary = ageRaw ? `العمر التقريبي: ${ageRaw}\n\n${storyRaw}` : storyRaw;

    const { error } = await supabase.from("guest_suggestions").insert({
      candidate_name: String(fd.get("character") ?? ""),
      profession: String(fd.get("role") ?? "") || null,
      neighborhood: String(fd.get("place") ?? "") || null,
      story_summary,
      submitter_name: String(fd.get("name") ?? "") || null,
      contact_info: String(fd.get("phone") ?? "") || null,
    });

    setSubmitting(false);

    if (error) {
      toast.error("تعذّر الإرسال", { description: error.message });
      return;
    }

    toast.success("وصلنا اقتراحك — شكراً إلك!", {
      description: "رح نراجعه ونرد عليك في حال احتجنا تفاصيل أكثر.",
    });
    f.reset();
  };

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-6">
            <Sparkles size={28} className="text-primary-foreground" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl mb-5 text-foreground">
            اقترح <span className="text-gradient-gold">حكاية</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            تعرف حدا من أهل إربد يستاهل حلقة؟ صاحب محل قديم، حكواتي، حرفي،
            أو ست بيت بحكاية ما حدا سمعها؟ احكيلنا عنه، ورح نتواصل معه.
          </p>
        </header>

        <form onSubmit={onSubmit} className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-deep space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="اسم الشخصية المقترحة *" name="character" placeholder="مثال: أبو سامي العطار" required />
            <Field label="المهنة / الدور" name="role" placeholder="عطار، إسكافي، خبّاز…" />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="الحي أو المكان *" name="place" placeholder="حارة البارحة، وسط البلد…" required />
            <Field label="العمر التقريبي" name="age" placeholder="٧٠ سنة تقريباً" />
          </div>

          <TextArea
            label="ليش بتشوفه يستاهل حلقة؟ *"
            name="story"
            placeholder="احكيلنا قصته باختصار: شو الإشي المميز فيه؟ شو الحكاية اللي بتستحق تنحكى؟"
            required minLength={5}
            rows={5}
          />

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="اسمك *" name="name" placeholder="عشان نتواصل معك" required />
            <Field label="رقم تواصلك (واتساب) *" name="phone" placeholder="07XXXXXXXX" required type="tel" />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input type="checkbox" id="contact-ok" required className="mt-1 w-4 h-4 accent-[var(--gold)]" />
            <label htmlFor="contact-ok" className="text-sm text-muted-foreground">
              متفق إنه فريق البرنامج يتواصل مع الشخصية المرشحة (بإذنها) لتقييم الحلقة.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition disabled:opacity-60"
          >
            <Send size={18} />
            {submitting ? "جاري الإرسال…" : "ابعت الترشيح"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          خصوصيتك مهمة عنّا. معلوماتك ما رح تنحفظ إلا لغرض التواصل بخصوص هذا الترشيح.
        </p>
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
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
      />
    </label>
  );
}

function TextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground mb-2">{label}</span>
      <textarea
        {...props}
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none"
      />
    </label>
  );
}
