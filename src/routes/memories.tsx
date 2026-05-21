import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

function MemoriesPage() {
  const { data: memories = [] } = useQuery({
    queryKey: ["public-memories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories").select("*").eq("approved", true)
        .order("featured", { ascending: false }).order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

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
          لمدينة إربد. شاركنا حكايتك.
        </p>
      </header>

      <div className="max-w-3xl mx-auto mb-20">
        <MemoryForm />
      </div>

      <section className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-12 text-foreground">
          من <span className="text-gradient-gold">جدار الذكريات</span>
        </h2>
        {memories.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">كن أول من يكتب ذكرى هنا.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((m: any) => (
              <article key={m.id} className={`p-7 rounded-xl bg-card border ${m.featured ? "border-primary/40 shadow-glow" : "border-border/60"} hover:border-primary/30 transition relative`}>
                {m.photo_url && <img src={m.photo_url} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
                <div className="text-4xl font-display text-primary/60 leading-none mb-3">❝</div>
                {m.title && <h3 className="font-display text-lg text-foreground mb-2">{m.title}</h3>}
                <p className="text-foreground leading-relaxed mb-5 font-display text-base italic whitespace-pre-wrap">
                  {m.body}
                </p>
                <div className="text-sm text-muted-foreground font-semibold border-t border-border/60 pt-4">
                  — {m.contributor_name ?? "صديق المدينة"}
                  {m.neighborhood && <span className="text-xs"> · {m.neighborhood}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MemoryForm() {
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const f = e.target as HTMLFormElement;
    const fd = new FormData(f);

    const { error } = await supabase.from("memories").insert({
      body: String(fd.get("body") ?? ""),
      contributor_name: String(fd.get("name") ?? "") || null,
      neighborhood: String(fd.get("neighborhood") ?? "") || null,
      decade: String(fd.get("decade") ?? "") || null,
      approved: false,
      featured: false,
    });
    setBusy(false);

    if (error) {
      toast.error("تعذّر الإرسال", { description: error.message });
      return;
    }
    toast.success("وصلتنا ذكرتك — رح تظهر بعد المراجعة. شكراً إلك!");
    f.reset();
  };

  return (
    <form onSubmit={onSubmit} className="bg-card border border-border/60 rounded-2xl p-8 shadow-deep">
      <h3 className="font-display text-2xl text-foreground mb-2">اكتب ذكرى من إربد القديمة</h3>
      <p className="text-sm text-muted-foreground mb-6">موقف، رائحة، صوت، أو حكاية. كل ذكرى تستحق أن تُحفظ.</p>

      <textarea
        name="body" required minLength={5} rows={6}
        placeholder="احكيلنا…"
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none mb-4"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <input
          name="name" placeholder="اسمك (أو لقبك)" required
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
        <input
          name="neighborhood" placeholder="الحي (اختياري)"
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
        <input
          name="decade" placeholder="العقد (مثلاً: السبعينات)"
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <button disabled={busy} className="w-full px-6 py-3 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition disabled:opacity-60">
        {busy ? "..." : "انشر ذكرتي"}
      </button>
    </form>
  );
}
