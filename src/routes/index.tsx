import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { episodes } from "@/lib/episodes";
import { EpisodeCard } from "@/components/site/EpisodeCard";
import { ArrowLeft, Camera, MessageSquareHeart, Image as ImageIcon, Users } from "lucide-react";

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
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img
          src={heroImg}
          alt="ناس إربد"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          width={1600}
          height={800}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/70 to-background/30" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-dark)" }} />

        <div className="container mx-auto px-6 relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wider">برنامج وثائقي · موسم ٢٠٢٥</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6">
              <span className="text-foreground">حكاياتُ مدينة</span>
              <br />
              <span className="text-gradient-gold">برواية أهلها.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
              «ناس إربد» برنامج وثائقي إنساني يجمع قصص الناس وذاكرتهم الشفوية،
              ويوثّق المهن القديمة والحكايات الشعبية قبل أن يطويها النسيان.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/episodes"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition"
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
            البرنامج <span className="text-gradient-gold">يصنعه أهله</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            رأيك واقتراحاتك جزء من كل حلقة. اختر كيف تريد أن تشارك:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              title: "رشّح شخصية",
              text: "تعرف حدا يستاهل حلقة؟ صاحب مهنة قديمة، حكواتي، أو ست بيتٍ بحكاية؟",
              link: "/suggest",
              cta: "ابعت ترشيحك",
            },
            {
              icon: MessageSquareHeart,
              title: "شاركنا ذكرى",
              text: "اكتب لنا ذكرى من إربد القديمة، حكاية جدّك، أو موقف من حارتك.",
              link: "/memories",
              cta: "اكتب ذكرى",
            },
            {
              icon: ImageIcon,
              title: "صورة وحكاية",
              text: "ارفع صورة قديمة من ألبوم العائلة، واكتب قصتها بكلماتك.",
              link: "/memories",
              cta: "ارفع صورة",
            },
            {
              icon: Camera,
              title: "اسأل الضيف",
              text: "قبل كل تصوير، نفتح بابك لتسأل أنت ما تريد معرفته من ضيف الحلقة.",
              link: "/suggest",
              cta: "أرسل سؤالك",
            },
          ].map(({ icon: Icon, title, text, link, cta }) => (
            <Link
              key={title}
              to={link}
              className="group p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/50 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-gradient-warm group-hover:border-transparent transition">
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
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest">أحدث الحلقات</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3 text-foreground">
              من أرشيف <span className="text-gradient-gold">ناس إربد</span>
            </h2>
          </div>
          <Link to="/episodes" className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
            كل الحلقات <ArrowLeft size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} ep={ep} />
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="font-display text-6xl text-primary mb-6 leading-none">❝</div>
          <p className="font-display text-2xl md:text-4xl text-foreground leading-relaxed italic">
            «المدينةُ ليست حجراً ولا أسفلتاً، المدينةُ ناسُها.
            <br />
            وحكاياتُهم هي ما يجعلها تستحقُّ أن تُذكر».
          </p>
          <div className="mt-8 inline-block w-16 h-px bg-gradient-warm" />
          <div className="mt-4 text-sm text-muted-foreground tracking-widest">فريق ناس إربد</div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 bg-card border border-primary/20 shadow-deep">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl text-foreground leading-tight mb-4">
                ساعدنا نُكمل <span className="text-gradient-gold">الحكاية</span>
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
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition"
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
