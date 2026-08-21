import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Search, RotateCcw, X, Play, Heart, Eye, Clock } from "lucide-react";
import { PublicEpisodeCard, type PublicEpisode } from "@/components/site/PublicEpisodeCard";
import { Skeleton, EpisodeGridSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { ErrorState } from "@/components/ui/error-state";

export const Route = createFileRoute("/episodes")({
  component: EpisodesPage,
  loader: async () => {
    const { data } = await supabase
      .from("episodes")
      .select("slug,title,short_description,youtube_id,cover_image_url,published_at,created_at")
      .eq("published", true)
      .order("episode_number", { ascending: false, nullsFirst: false })
      .limit(50);
    return { list: data ?? [] };
  },
  head: ({ loaderData }) => {
    const list = loaderData?.list ?? [];
    return {
      meta: [
        { title: "أرشيف الحلقات · ناس إربد" },
        { name: "description", content: "كل حلقات برنامج ناس إربد الوثائقي، مرتبة ومفهرسة حسب الشخصية والحي والمهنة." },
        { property: "og:title", content: "أرشيف الحلقات · ناس إربد" },
        { property: "og:description", content: "كل حلقات البرنامج بجودة عالية، مع تفاصيل خلف الكواليس." },
        { property: "og:url", content: "https://nas-irbid.lovable.app/episodes" },
      ],
      links: [{ rel: "canonical", href: "https://nas-irbid.lovable.app/episodes" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "أرشيف حلقات ناس إربد",
            itemListElement: list.map((ep, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "VideoObject",
                name: ep.title,
                description: ep.short_description ?? ep.title,
                url: `https://nas-irbid.lovable.app/episodes/${ep.slug}`,
                thumbnailUrl: ep.cover_image_url
                  ? [ep.cover_image_url]
                  : ep.youtube_id
                    ? [`https://i.ytimg.com/vi/${ep.youtube_id}/maxresdefault.jpg`]
                    : undefined,
                uploadDate: ep.published_at ?? ep.created_at,
                embedUrl: ep.youtube_id ? `https://www.youtube.com/embed/${ep.youtube_id}` : undefined,
              },
            })),
          }),
        },
      ],
    };
  },
});

type SortMode = "latest" | "views";

function useTypewriterPlaceholder(texts: string[], speed = 100, pause = 2000) {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const currentText = texts[index];
    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText((prev) => currentText.substring(0, prev.length - 1));
      }, speed / 2);
    } else {
      timer = setTimeout(() => {
        setDisplayText((prev) => currentText.substring(0, prev.length + 1));
      }, speed);
    }

    if (!isDeleting && displayText === currentText) {
      clearTimeout(timer);
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && displayText === "") {
      clearTimeout(timer);
      setIsDeleting(false);
      setIndex((i) => (i + 1) % texts.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, texts, speed, pause]);

  return displayText || " "; // Return space when empty to preserve height
}

function EpisodesPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("latest");
  const deferredQuery = useDeferredValue(query);

  const { data: episodes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["public-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes").select("*").eq("published", true)
        .order("episode_number", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const searchPlaceholder = useTypewriterPlaceholder([
    "ابحث عن اسم عائلة...",
    "ابحث عن مهنة قديمة...",
    "جرب البحث عن حي أو شارع...",
    "ابحث باسم الشخصية..."
  ], 80, 2500);

  const normalize = (s: string) =>
    s.toLocaleLowerCase("ar")
      .replace(/[\u064B-\u065F\u0670]/g, "") // strip Arabic diacritics
      .replace(/[إأآا]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ")
      .trim();

  const filtered = useMemo(() => {
    if (!episodes || episodes.length === 0) return [];
    const needle = normalize(deferredQuery);
    const base = needle
      ? episodes.filter((ep) => {
          const haystack = normalize(
            [ep.title, ep.character_name, ep.profession, ep.neighborhood, ep.short_description, ep.story]
              .filter(Boolean).join(" ")
          );
          return haystack.includes(needle);
        })
      : [...episodes];

    return base.sort((a, b) => {
      if (sort === "views") {
        const viewsA = a.instagram_views ?? 0;
        const viewsB = b.instagram_views ?? 0;
        if (viewsB !== viewsA) return viewsB - viewsA;
      }
      // fallback / latest: episode_number desc, then published_at desc
      const numA = a.episode_number ?? 0;
      const numB = b.episode_number ?? 0;
      if (numB !== numA) return numB - numA;
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [episodes, deferredQuery, sort]);

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const totalViews = useMemo(() => episodes.reduce((acc, ep) => acc + (ep.instagram_views || 0), 0), [episodes]);
  const totalLikes = useMemo(() => episodes.reduce((acc, ep) => acc + (ep.instagram_likes || 0), 0), [episodes]);

  return (
    <div className="container mx-auto px-6 py-20">
      <FadeIn className="max-w-3xl mb-14">
        <span className="text-xs font-bold accent-emerald tracking-widest divider-emerald">الأرشيف</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3 mb-5 text-foreground">
          أرشيف <span className="text-gradient-gold">الحلقات</span>
        </h1>
        {(totalViews > 0 || totalLikes > 0) && (
          <div className="flex items-center gap-4 mb-6">
            {totalViews > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Play size={13} className="fill-current" />
                <span className="text-sm font-bold tracking-wide" dir="ltr">{formatCount(totalViews)}</span>
                <span className="text-xs font-semibold ms-1">مشاهدة</span>
              </div>
            )}
            {totalLikes > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                <Heart size={13} className="fill-current" />
                <span className="text-sm font-bold tracking-wide" dir="ltr">{formatCount(totalLikes)}</span>
                <span className="text-xs font-semibold ms-1">إعجاب</span>
              </div>
            )}
          </div>
        )}
        <p className="text-lg text-muted-foreground leading-relaxed">
          كل حلقات «ناس إربد» في مكان واحد. شاهدها بجودة عالية، اقرأ ملخصها التاريخي،
          واكتشف ما لم يظهر في المونتاج.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative block flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={17} />
            <span className="sr-only">ابحث في الحلقات</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={query ? "" : searchPlaceholder}
              className="min-h-12 w-full rounded-xl border border-border bg-input py-3 pl-11 pr-11 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="مسح البحث"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </label>

          <div className="inline-flex items-center rounded-xl border border-border bg-card p-1 gap-1">
            <button
              type="button"
              onClick={() => setSort("latest")}
              aria-pressed={sort === "latest"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                sort === "latest"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Clock size={13} />
              الأحدث
            </button>
            <button
              type="button"
              onClick={() => setSort("views")}
              aria-pressed={sort === "views"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                sort === "views"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Eye size={13} />
              الأعلى مشاهدة
            </button>
          </div>
        </div>
        {query.trim() && !isLoading && (
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length > 0
              ? `${filtered.length} من ${episodes.length} حلقة`
              : "لا توجد نتائج"}
          </p>
        )}
      </FadeIn>

      {isLoading ? (
        <div aria-label="جاري تحميل الحلقات">
          <EpisodeGridSkeleton count={6} />
        </div>
      ) : isError ? (
        <div className="py-8">
          <ErrorState
            title="تعذّر تحميل الأرشيف"
            description="تحقّق من اتصالك بالإنترنت ثم حاول مرة أخرى."
            variant="network"
            action={{ label: "إعادة المحاولة", onClick: () => refetch() }}
            backTo={{ to: "/", label: "الصفحة الرئيسية" }}
          />
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center p-16 rounded-2xl bg-card border border-dashed border-border max-w-xl mx-auto">
          <p className="font-display text-xl text-foreground mb-2">قريباً جداً</p>
          <p className="text-sm text-muted-foreground">حلقات الموسم الأول قيد التصوير. تابعنا لتكون أول من يشاهد.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-xl text-foreground">لا توجد نتائج مطابقة</p>
          <p className="mt-2 text-sm text-muted-foreground">جرّب كلمة أخرى.</p>
          <Button variant="outline" className="mt-5 rounded-full" onClick={() => setQuery("")}><RotateCcw size={15} /> مسح البحث</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ep) => (
            <PublicEpisodeCard key={ep.id} episode={ep as PublicEpisode} />
          ))}
        </div>
      )}
    </div>
  );
}

