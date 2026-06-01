import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import introLogo from "@/assets/intro-logo.gif";
import { ArrowLeft, Users, HelpCircle, Share2, Play } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ناس إربد · حكايات أهل المدينة" },
      { name: "description", content: "برنامج وثائقي يوثّق قصص أهل إربد ومهنهم القديمة وذاكرتهم الشفوية." },
    ],
  }),
});

function Index() {
  const { data: episodes = [] } = useQuery({
    queryKey: ["home-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes").select("*").eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      {/* GIF INTRO BAND — blended onto the page background (no black box) */}
      <section className="relative w-full overflow-hidden">
        <div className="container mx-auto px-6 py-10 md:py-14 flex items-center justify-center">
          <img
            src={introLogo}
            alt="ناس إربد"
            style={{ mixBlendMode: "screen" }}
            className="w-full max-w-3xl h-auto object-contain"
          />
        </div>
      </section>

      {/* HERO TEXT */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="container mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wider">برنامج وثائقي · موسم ٢٠٢٦</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.15] mb-6 text-foreground" style={{ letterSpacing: "0", wordSpacing: "-0.05em" }}>
              حكايات مدينة
              <br />
              <span className="text-primary">برواية أهلها</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              «ناس إربد» برنامج وثائقي إنساني يجمع قصص الناس وذاكرتهم الشفوية،
              ويوثّق المهن القديمة والحكايات الشعبية قبل أن يطويها النسيان.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/episodes"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-primary text-primary-foreground font-bold shadow-glow hover:opacity-90 transition"
              >
                شاهد الحلقات
                <ArrowLeft size={18} />
              </Link>
              <Link
                to="/suggest"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border-2 border-primary/40 text-foreground font-bold hover:bg-primary/10 transition"
              >
                اقترح شخصية للحلقة الجاية
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PARTICIPATION GRID */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary tracking-widest">شاركنا الحكاية</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-foreground">
            البرنامج <span className="text-primary">يصنعه أهله</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            رأيك واقتراحاتك جزء من كل حلقة. اختر كيف تريد أن تشارك:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "رشّح شخصية", text: "تعرف حدا يستاهل حلقة؟ صاحب مهنة قديمة، حكواتي، أو ست بيتٍ بحكاية؟", link: "/suggest", cta: "ابعت ترشيحك" },
            { icon: HelpCircle, title: "اسأل الضيف", text: "اختر شخصية من حلقاتنا واسألها سؤالك — ممكن نطرحه عليها في حلقة قادمة.", link: "/ask", cta: "أرسل سؤالك" },
            { icon: Share2, title: "انشر الحلقة", text: "كل مشاركة بتوصل البرنامج لعائلة جديدة، وحكاية إربد لجمهور أوسع.", link: "/episodes", cta: "شاهد الحلقات" },
          ].map(({ icon: Icon, title, text, link, cta }) => (
            <Link
              key={title}
              to={link}
              className="group p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/60 transition-all hover:-translate-y-1 shadow-deep"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary transition">
                <Icon size={22} className="text-primary group-hover:text-primary-foreground transition" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{text}</p>
              <span className="text-sm font-bold text-primary inline-flex items-center gap-1">
                {cta} <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST EPISODES */}
      {episodes.length > 0 && (
        <section className="container mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-primary tracking-widest">أحدث الحلقات</span>
              <h2 className="font-display text-4xl md:text-5xl mt-3 text-foreground">
                من أرشيف <span className="text-primary">ناس إربد</span>
              </h2>
            </div>
            <Link to="/episodes" className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
              كل الحلقات <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="max-w-6xl mx-auto px-2 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {episodes.map((ep: any) => (
                <Link
                  key={ep.id}
                  to="/episodes/$slug"
                  params={{ slug: ep.slug }}
                  className="group bg-card border border-border/60 overflow-hidden hover:border-primary/60 transition hover:-translate-y-1 arch-frame shadow-deep"
                >
                  <div className="aspect-[3/4] bg-secondary relative overflow-hidden arch-top">
                    {ep.youtube_id && (
                      <img
                        src={`https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg`}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition">
                        <Play size={16} className="text-primary-foreground translate-x-[-1px]" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    {ep.episode_number && <span className="text-[10px] font-bold accent-emerald tracking-widest">حلقة {ep.episode_number}</span>}
                    <h3 className="font-display text-sm md:text-base text-foreground mt-1 mb-1 line-clamp-2">{ep.title}</h3>
                    {ep.character_name && <div className="text-[11px] text-muted-foreground line-clamp-1">{ep.character_name}</div>}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link to="/episodes" className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-primary/40 text-foreground font-bold hover:bg-primary/10 transition">
                كل الحلقات <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* QUOTE */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="font-display text-6xl text-primary mb-6 leading-none">❝</div>
          <p className="font-display text-2xl md:text-4xl text-foreground leading-relaxed italic">
            «المدينةُ ليست حجراً ولا أسفلتاً، المدينةُ ناسُها.
            <br />
            وحكاياتُهم هي ما يجعلها تستحقُّ أن تُذكر».
          </p>
          <div className="mt-8 inline-block w-16 h-px bg-primary" />
          <div className="mt-4 text-sm text-muted-foreground tracking-widest">فريق ناس إربد</div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 bg-card border border-primary/20 shadow-deep">
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl text-foreground leading-tight mb-4">
                ساعدنا نُكمل <span className="text-primary">الحكاية</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                البرنامج إنتاج مستقل يصنعه فريق صغير بشغف كبير. دعمك — مهما كان بسيطاً —
                يساعدنا في توثيق المزيد من قصص إربد قبل أن تضيع.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link
                to="/about"
                hash="support"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold shadow-glow hover:opacity-90 transition"
              >
                طرق الدعم
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
