import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Heart } from "lucide-react";

export const Route = createFileRoute("/memories")({
  component: MemoriesPage,
  head: () => ({
    meta: [
      { title: "ذاكرتنا · صور وحكايات من إربد" },
      { name: "description", content: "شاركنا صورة قديمة أو ذكرى من إربد، وكن جزءاً من الأرشيف الشعبي للمدينة." },
      { property: "og:title", content: "ذاكرتنا · ناس إربد" },
      { property: "og:description", content: "أرشيف شعبي يبنيه الجمهور: صور وحكايات من إربد." },
    ],
  }),
});

const memories = [
  {
    quote: "كنّا نطلع من المدرسة نشتري كعك ساركيس بقرشين، وريحته ما زالت بأنفي لليوم.",
    by: "أم محمد · حارة الدلاقمة",
  },
  {
    quote: "جدي كان يقرأ علينا من الراديو كل مغرب… ذاك الصوت ما بينمحي من الذاكرة.",
    by: "خالد التل",
  },
  {
    quote: "في كشك الزرعيني اشتريت أول كتاب بمصروفي. ‹رجال في الشمس›… ما نسيت.",
    by: "د. سامي · أستاذ جامعي",
  },
];

function MemoriesPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <header className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-6">
          <Heart size={28} className="text-primary-foreground" />
        </div>
        <h1 className="font-display text-5xl md:text-6xl mb-5 text-foreground">
          ذاكرتنا <span className="text-gradient-gold">الجماعية</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          كل ذكرى تكتبها، كل صورة قديمة تشاركها، تضيف حجراً في بناء أرشيف شعبي
          لمدينة إربد. اختر طريقة المشاركة:
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20">
        <MemoryForm />
        <PhotoForm />
      </div>

      {/* Wall of memories */}
      <section className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-12 text-foreground">
          من <span className="text-gradient-gold">جدار الذكريات</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {memories.map((m, i) => (
            <article key={i} className="p-7 rounded-xl bg-card border border-border/60 hover:border-primary/30 transition relative">
              <div className="text-4xl font-display text-primary/60 leading-none mb-3">❝</div>
              <p className="text-foreground leading-relaxed mb-5 font-display text-lg italic">
                {m.quote}
              </p>
              <div className="text-sm text-muted-foreground font-semibold border-t border-border/60 pt-4">
                — {m.by}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MemoryForm() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("وصلتنا ذكرتك — شكراً إلك!");
    (e.target as HTMLFormElement).reset();
  };
  return (
    <form onSubmit={onSubmit} className="bg-card border border-border/60 rounded-2xl p-8 shadow-deep">
      <h3 className="font-display text-2xl text-foreground mb-2">اكتب ذكرى</h3>
      <p className="text-sm text-muted-foreground mb-6">موقف، رائحة، صوت، أو حكاية من إربد القديمة.</p>
      <textarea
        required
        rows={6}
        placeholder="احكيلنا…"
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none mb-4"
      />
      <input
        required
        placeholder="اسمك (أو لقبك)"
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none mb-5"
      />
      <button className="w-full px-6 py-3 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition">
        انشر ذكرتي
      </button>
    </form>
  );
}

function PhotoForm() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("وصلتنا الصورة — رح نراجعها ونضيفها للأرشيف.");
    (e.target as HTMLFormElement).reset();
  };
  return (
    <form onSubmit={onSubmit} className="bg-card border border-border/60 rounded-2xl p-8 shadow-deep">
      <h3 className="font-display text-2xl text-foreground mb-2">ارفع صورة قديمة</h3>
      <p className="text-sm text-muted-foreground mb-6">صورة من ألبوم العائلة، أو لشارع/محل من إربد القديمة.</p>

      <label className="block border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition mb-4">
        <Upload size={28} className="mx-auto text-muted-foreground mb-3" />
        <span className="block text-sm font-semibold text-foreground">اختر صورة</span>
        <span className="block text-xs text-muted-foreground mt-1">JPG · PNG · حتى ١٠ ميجا</span>
        <input type="file" accept="image/*" className="hidden" />
      </label>

      <textarea
        required
        rows={3}
        placeholder="احكيلنا قصة الصورة: وين؟ إيمتى؟ مين فيها؟"
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none mb-4"
      />
      <input
        required
        placeholder="اسمك"
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none mb-5"
      />
      <button className="w-full px-6 py-3 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition">
        ارفع للأرشيف
      </button>
    </form>
  );
}
