import { createFileRoute } from "@tanstack/react-router";
import { episodes } from "@/lib/episodes";
import { EpisodeCard } from "@/components/site/EpisodeCard";

export const Route = createFileRoute("/episodes")({
  component: EpisodesPage,
  head: () => ({
    meta: [
      { title: "أرشيف الحلقات · ناس إربد" },
      { name: "description", content: "كل حلقات برنامج ناس إربد الوثائقي، مرتبة ومفهرسة حسب الشخصية والحي والمهنة." },
      { property: "og:title", content: "أرشيف الحلقات · ناس إربد" },
      { property: "og:description", content: "كل حلقات البرنامج بجودة عالية، مع تفاصيل خلف الكواليس." },
    ],
  }),
});

const filters = ["الكل", "مهن قديمة", "عائلات", "ثقافة", "حارات", "نساء ملهمات"];

function EpisodesPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <header className="max-w-3xl mb-14">
        <span className="text-xs font-bold text-primary tracking-widest">الأرشيف</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3 mb-5 text-foreground">
          أرشيف <span className="text-gradient-gold">الحلقات</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          كل حلقات «ناس إربد» في مكان واحد. شاهدها بجودة عالية، اقرأ ملخصها التاريخي،
          واكتشف ما لم يظهر في المونتاج.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-12">
        {filters.map((f, i) => (
          <button
            key={f}
            className={
              i === 0
                ? "px-4 py-2 rounded-full text-sm font-semibold bg-gradient-warm text-primary-foreground"
                : "px-4 py-2 rounded-full text-sm font-semibold border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {episodes.map((ep) => <EpisodeCard key={ep.id} ep={ep} />)}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-16">
        المزيد من الحلقات قريباً · الموسم الأول لا يزال قيد التصوير
      </p>
    </div>
  );
}
