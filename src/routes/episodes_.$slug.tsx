import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, MapPin, Calendar, User, HelpCircle, Send, Share2, Link2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicEpisodeCard, type PublicEpisode } from "@/components/site/PublicEpisodeCard";

export const Route = createFileRoute("/episodes_/$slug")({
  component: EpisodeDetail,
  head: ({ loaderData }) => {
    const ep = loaderData as any;
    if (!ep) return { meta: [{ title: "حلقة · ناس إربد" }] };
    const ogImage =
      ep.cover_image_url ??
      (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/maxresdefault.jpg` : null);
    const meta: Array<{ title?: string; name?: string; property?: string; content?: string }> = [
      { title: `${ep.title} · ناس إربد` },
      { name: "description", content: ep.short_description ?? ep.title },
      { property: "og:title", content: ep.title },
      { property: "og:description", content: ep.short_description ?? "" },
      { property: "og:url", content: `https://nas-irbid.lovable.app/episodes/${ep.slug}` },
      { property: "og:type", content: "article" },
    ];
    if (ogImage) meta.push({ property: "og:image", content: ogImage });
    return {
      meta,
      links: [{ rel: "canonical", href: `https://nas-irbid.lovable.app/episodes/${ep.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: ep.title,
          description: ep.short_description ?? ep.title,
          thumbnailUrl: ogImage ? [ogImage] : undefined,
          uploadDate: ep.published_at ?? ep.created_at,
          embedUrl: ep.youtube_id ? `https://www.youtube.com/embed/${ep.youtube_id}` : undefined,
        }),
      }],
    };
  },
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("episodes").select("*")
      .eq("slug", params.slug).eq("published", true).maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data;
  },
  notFoundComponent: () => (
    <div className="container mx-auto px-6 py-20 text-center">
      <h1 className="font-display text-3xl text-foreground">الحلقة غير موجودة</h1>
      <Link to="/episodes" className="mt-6 inline-flex px-5 py-2.5 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold">
        العودة للأرشيف
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container mx-auto px-6 py-20 text-center">
      <p className="text-muted-foreground">حدث خطأ.</p>
    </div>
  ),
});

function EpisodeDetail() {
  const ep = Route.useLoaderData();
  const { data: related = [] } = useQuery({
    queryKey: ["related-episodes", ep.id, ep.neighborhood],
    queryFn: async () => {
      let request = supabase.from("episodes").select("*").eq("published", true).neq("id", ep.id).limit(3);
      if (ep.neighborhood) request = request.eq("neighborhood", ep.neighborhood);
      const { data, error } = await request;
      if (error) throw error;
      if (data.length > 0 || !ep.neighborhood) return data;
      const fallback = await supabase.from("episodes").select("*").eq("published", true).neq("id", ep.id).limit(3);
      if (fallback.error) throw fallback.error;
      return fallback.data;
    },
  });

  return (
    <article>
      {/* Hero */}
      <div className="container mx-auto px-6 pt-10 pb-6">
        <Link to="/episodes" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-6">
          <ArrowRight size={12} /> كل الحلقات
        </Link>
        <div className="max-w-4xl">
          {ep.episode_number && <span className="text-xs font-bold text-primary tracking-widest">حلقة {ep.episode_number} · الموسم {ep.season ?? 1}</span>}
          <h1 className="font-display text-4xl md:text-6xl mt-3 mb-5 text-foreground leading-tight">{ep.title}</h1>
          {ep.short_description && <p className="text-lg text-muted-foreground leading-relaxed">{ep.short_description}</p>}
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
            {ep.character_name && <span className="inline-flex items-center gap-1.5"><User size={14} /> {ep.character_name}</span>}
            {ep.neighborhood && <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {ep.neighborhood}</span>}
            {ep.decade && <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> {ep.decade}</span>}
          </div>
          <ShareActions title={ep.title} slug={ep.slug} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="container mx-auto border-t border-border/60 px-6 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div><span className="text-xs font-bold tracking-widest text-primary">تابع الحكاية</span><h2 className="mt-2 font-display text-3xl text-foreground">حلقات قد تعجبك</h2></div>
            <Link to="/episodes" className="text-sm font-bold text-primary">كل الأرشيف</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">{related.map((item) => <PublicEpisodeCard key={item.id} episode={item as PublicEpisode} />)}</div>
        </section>
      )}

      {/* Video */}
      {ep.youtube_id && (
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden bg-black shadow-deep">
            <iframe
              src={`https://www.youtube.com/embed/${ep.youtube_id}`}
              title={ep.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Story */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {ep.story && (
            <section>
              <h2 className="font-display text-2xl text-gradient-gold mb-4">القصة</h2>
              <div className="prose text-foreground leading-loose whitespace-pre-wrap text-base md:text-lg">
                {ep.story}
              </div>
            </section>
          )}

          {ep.behind_the_scenes && (
            <section className="p-8 rounded-2xl bg-card border border-border/60">
              <span className="text-xs font-bold text-primary tracking-widest">خلف الكواليس</span>
              <h2 className="font-display text-2xl text-foreground mt-2 mb-4">ما لم يظهر في الحلقة</h2>
              <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {ep.behind_the_scenes}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Question bank */}
      <div className="container mx-auto px-6 py-16 border-t border-border/60">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-4">
              <HelpCircle size={20} className="text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl text-foreground mb-2">عندك سؤال للضيف؟</h2>
            <p className="text-sm text-muted-foreground">
              نختار أفضل الأسئلة من الجمهور ونطرحها في الحلقات القادمة. سؤالك ممكن يصير جزء من البرنامج.
            </p>
          </div>
          <QuestionForm episodeId={ep.id} target={ep.character_name ?? ep.title} />
        </div>
      </div>
    </article>
  );
}

function ShareActions({ title, slug }: { title: string; slug: string }) {
  const url = `https://nas-irbid.lovable.app/episodes/${slug}`;
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("تم نسخ رابط الحلقة");
  };
  const share = async () => {
    if (navigator.share) await navigator.share({ title, url });
    else await copy();
  };

  return (
    <div className="mt-7 flex flex-wrap gap-2" aria-label="مشاركة الحلقة">
      <Button variant="outline" className="rounded-full" onClick={share}><Share2 size={15} /> مشاركة</Button>
      <Button variant="outline" className="rounded-full" onClick={copy}><Link2 size={15} /> نسخ الرابط</Button>
      <Button asChild variant="outline" className="rounded-full"><a href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> واتساب</a></Button>
    </div>
  );
}

function QuestionForm({ episodeId, target }: { episodeId: string; target: string }) {
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const f = e.target as HTMLFormElement;
    const fd = new FormData(f);
    const { error } = await supabase.from("questions").insert({
      episode_id: episodeId,
      target_character: target,
      question_text: String(fd.get("q") ?? ""),
      submitter_name: String(fd.get("name") ?? "") || null,
      selected: false,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("وصلنا سؤالك!");
    f.reset();
  };

  return (
    <form onSubmit={submit} className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
      <textarea
        name="q" required minLength={3} rows={3}
        placeholder={`سؤالك لـ ${target}…`}
        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
      />
      <div className="flex gap-3">
        <input
          name="name" placeholder="اسمك (اختياري)"
          className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
        <button disabled={busy} className="px-6 py-3 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow disabled:opacity-60 inline-flex items-center gap-2">
          <Send size={14} /> {busy ? "..." : "ابعت"}
        </button>
      </div>
    </form>
  );
}
