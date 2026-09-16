import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart, Coffee, Megaphone, Building2, Users, Camera, Mic2, Palette,
  Share2, MessageCircle, MapPin, Lightbulb, Handshake, GraduationCap,
  Landmark, Sparkles, ArrowLeft, Quote, Check, Scale, Clock, Info, RotateCcw
} from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";
import { motion, animate, useScroll, useSpring, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { TextReveal } from "@/components/ui/text-reveal";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "عن البرنامج · ناس إربد" },
      { name: "description", content: "تعرّف على رؤية ناس إربد، وكيف يمكنك أن تكون جزءاً من حماية ذاكرة المدينة." },
      { property: "og:title", content: "عن البرنامج · ناس إربد" },
      { property: "og:description", content: "الدعم مسؤولية مجتمعية، لا خدمة بمقابل." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nas-irbid.lovable.app/about" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://nas-irbid.lovable.app/about" }],
  }),
});

function AnimatedCounter({ from, to, formatter }: { from: number; to: number; formatter: (val: number) => string }) {
  const [displayValue, setDisplayValue] = useState(formatter(from));

  useEffect(() => {
    const controls = animate(from, to, {
      duration: 2.5,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayValue(formatter(value));
      }
    });
    return controls.stop;
  }, [from, to, formatter]);

  return <>{displayValue}</>;
}

function VerticalReadingProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  const dotTop = useTransform(progress, [0, 1], [0, 152]);

  return (
    <div className="fixed left-3 top-1/2 z-[80] hidden h-40 w-5 -translate-y-1/2 items-center justify-center md:flex" aria-hidden="true">
      <div className="absolute h-full w-px bg-border/70" />
      <motion.div className="absolute top-0 h-full w-px origin-top bg-primary" style={{ scaleY: progress }} />
      <motion.div className="absolute top-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-gold shadow-glow" style={{ y: dotTop }} />
    </div>
  );
}

function HandDrawnOrnament() {
  const reduceMotion = useReducedMotion();
  const lineMotion = reduceMotion
    ? { initial: { pathLength: 1, opacity: 1 }, whileInView: { pathLength: 1, opacity: 1 } }
    : { initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 } };

  return (
    <motion.svg
      viewBox="0 0 360 74"
      className="mx-auto mt-8 h-16 w-full max-w-sm text-primary/55"
      fill="none"
      aria-hidden="true"
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, amount: 0.8 }}
    >
      <motion.path d="M22 58C68 58 70 18 111 18C145 18 147 51 180 51C213 51 215 18 249 18C290 18 292 58 338 58" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" variants={lineMotion} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path d="M56 57C85 49 85 31 111 26M304 57C275 49 275 31 249 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" variants={lineMotion} transition={{ duration: 1.35, delay: reduceMotion ? 0 : 0.45 }} />
      <motion.path d="M170 51C174 43 176 37 180 29C184 37 186 43 190 51" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" variants={lineMotion} transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.9 }} />
    </motion.svg>
  );
}

function SupportFlipCard({
  icon: Icon,
  title,
  highlight,
  details,
  action,
  featured = false,
  compact = false,
}: {
  icon: React.ElementType;
  title: string;
  highlight?: string;
  details: string;
  action?: React.ReactNode;
  featured?: boolean;
  compact?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className={`relative w-full [perspective:1200px] ${compact ? "h-64" : "h-72"}`}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: reduceMotion ? 0 : flipped ? 180 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className={`absolute inset-0 flex flex-col rounded-2xl border bg-card p-7 [backface-visibility:hidden] ${flipped && reduceMotion ? "pointer-events-none" : ""} ${featured ? "border-primary/60 shadow-glow" : "border-border/60"}`}
          animate={{ opacity: flipped && reduceMotion ? 0 : 1 }}
          aria-hidden={flipped}
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Icon size={22} className="text-primary" />
          </div>
          <h3 className="font-display text-xl text-foreground">{title}</h3>
          {highlight && <div className="mt-1 font-display text-2xl text-primary">{highlight}</div>}
          <div className="mt-auto pt-5">
            <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => setFlipped(true)} aria-expanded={flipped}>
              اكتشف التفاصيل <ArrowLeft size={15} />
            </Button>
          </div>
        </motion.div>

        <motion.div
          className={`absolute inset-0 flex flex-col rounded-2xl border bg-secondary p-7 [backface-visibility:hidden] ${reduceMotion ? "[transform:none]" : "[transform:rotateY(180deg)]"} ${!flipped && reduceMotion ? "pointer-events-none" : ""} ${featured ? "border-primary/60" : "border-border/60"}`}
          animate={{ opacity: !flipped && reduceMotion ? 0 : 1 }}
          aria-hidden={!flipped}
        >
          <div className="mb-3 flex items-center gap-3">
            <Icon size={20} className="text-primary" />
            <h3 className="font-display text-lg text-foreground">{title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{details}</p>
          <div className="mt-auto flex items-center gap-2 pt-4">
            {action}
            <Button type="button" size="icon" variant="ghost" className="shrink-0 rounded-full" onClick={() => setFlipped(false)} aria-label={`إغلاق تفاصيل ${title}`}>
              <RotateCcw size={16} />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

function AboutPage() {
  const { data: settings } = useSiteSettings();
  const contactEmail = settings?.contact_email ?? "ahmad000haddad@gmail.com";
  const [emailCopied, setEmailCopied] = useState(false);
  
  // Exit intent logic
  const hasTriggeredExit = useRef(false);
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && !hasTriggeredExit.current && window.scrollY > 1000) {
        hasTriggeredExit.current = true;
        toast("لحظة من فضلك!", {
          description: "حتى لو لم تدعمنا مالياً.. يمكنك دعمنا بأكثر من ١٢ طريقة مختلفة (مجاناً) 💛",
          duration: 6000,
          position: "top-center"
        });
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(contactEmail);
    setEmailCopied(true);
    toast.success("تم نسخ البريد الإلكتروني");
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="relative overflow-x-hidden">
      <VerticalReadingProgress />
      
      {/* ============ Vision ============ */}
      <section className="container mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center gap-3 mb-3">
            <span className="text-xs font-bold text-primary tracking-widest">عن البرنامج</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground border border-border/50">
              <Clock size={12} />
              يستغرق القراءة: ٤ دقائق
            </span>
          </div>
          <TextReveal
            as="h1"
            by="word"
            delay={0.1}
            className="font-display text-5xl md:text-6xl mt-3 mb-6 text-foreground"
          >
            نوثّقُ إربد بصوت أهلها
          </TextReveal>
          <FadeIn delay={0.3}>
            <p className="text-lg text-muted-foreground leading-relaxed">
              «ناس إربد» مشروع وثائقي مستقل، يولد من إيمانٍ بأن المدن تحيا بذاكرة ناسها.
              نسجّل القصص قبل أن تضيع، نوثّق المهن قبل أن تنقرض، ونحفظ لهجة المدينة وأسماء حاراتها
              من النسيان. كل حلقة هي رسالة حب من جيلٍ لجيل.
            </p>
          </FadeIn>
        </div>

      </section>


      {/* ============ Support Hero ============ */}
      <section id="support" className="relative scroll-mt-24 border-y border-border/60 bg-card/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto inline-flex w-16 h-16 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-8">
              <Heart size={28} className="text-primary-foreground" fill="currentColor" />
            </div>
            <div className="block">
              <span className="inline-block text-xs font-bold text-primary tracking-widest">مسؤوليّتنا الجماعية</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-foreground">
              ذاكرة إربد <span className="text-gradient-gold">أمانة بإيدينا</span>
            </h2>
            <HandDrawnOrnament />
          </div>

          {/* Philosophy statement */}
          <div className="max-w-3xl mx-auto mt-10 p-8 md:p-10 rounded-2xl bg-background/60 border border-border/60 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Quote size={32} className="text-primary/20 absolute top-5 right-5 rotate-180 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/40" />
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-foreground/90 leading-loose text-center font-display relative z-10">
                نحنُ لا نطلبُ دعماً {" "}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="relative z-10 text-gradient-gold">مقابل خدمة</span>
                  <span 
                    className="absolute top-1/2 right-0 w-full h-[3px] bg-primary -translate-y-1/2 origin-right scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-20 shadow-glow"
                  />
                </span>
                .
                <br />
                ندعو فقط من يؤمن أنّ <span className="text-gradient-gold">حفظ الذاكرة مسؤولية</span>،
                وأنّ هذا البرنامج يستحقّ أن يستمرّ
                <br />
                لأنّه يُرسّخ قيماً نبيلة في مجتمعنا.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-center text-sm text-muted-foreground mt-6 leading-relaxed relative z-10">
                الدعم هنا فعلُ محبّةٍ للمدينة، لا صفقة. وكلّ ما يصلنا — قرشاً كان أو وقتاً أو حكاية — يعودُ كاملاً
                للبرنامج ولأهل إربد.
              </p>
            </FadeIn>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-sm mt-10">
            <a href="#donate" className="px-5 py-2.5 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition">
              ساهم برمز محبّة
            </a>
            <a href="#sponsor" className="px-5 py-2.5 rounded-full border border-border bg-background/40 text-foreground font-bold hover:border-primary/60 transition">
              ادعم حلقة
            </a>
            <a href="#partners" className="px-5 py-2.5 rounded-full border border-border bg-background/40 text-foreground font-bold hover:border-primary/60 transition">
              دعم مؤسسي
            </a>
            <a href="#non-monetary" className="px-5 py-2.5 rounded-full border border-border bg-background/40 text-foreground font-bold hover:border-primary/60 transition">
              دعم بدون مال
            </a>
          </div>
        </div>
      </section>

      {/* ============ 1. Small Donations ============ */}
      <section id="donate" className="container mx-auto px-6 py-20 scroll-mt-24">
        <SectionHeader
          id="donate"
          eyebrow="١ · للأفراد"
          title="ساهم برمز محبّة"
          description="أيّ مبلغ — مهما كان صغيراً — يفرق. لا امتيازات، لا اشتراكات، لا مقابل. فقط إيمانٌ بأنّ ما نفعله يستحقّ أن يبقى."
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-5 mt-12">
          {[
            { icon: Coffee, name: "بثمن فنجان قهوة", amount: "٥ JOD", note: "كلّ مبلغٍ صغير يجتمع مع غيره ليصنع حلقة." },
            { icon: Camera, name: "بثمن شريط ذكريات", amount: "١٥ JOD", note: "تكفي لتغطية تنقّلات يوم تصوير في حيٍّ قديم.", featured: true },
            { icon: Mic2, name: "حكاية كاملة", amount: "٥٠ JOD", note: "تساهم في تفريغ وتوثيق مقابلة كاملة مع شخصية." },
            { icon: Sparkles, name: "حدّد المبلغ", amount: "أنت تختار", note: "أي مبلغ، بأيّ تكرار — مرّة واحدة أو متى ما أردت.", custom: true },
          ].map((t) => {
            const mailto = `mailto:ahmad000haddad@gmail.com?subject=${encodeURIComponent(
              t.custom ? "أرغب بالمساهمة في ناس إربد" : `مساهمة ${t.amount} · ناس إربد`,
            )}`;
            return (
              <SupportFlipCard
                key={t.name}
                icon={t.icon}
                title={t.name}
                highlight={t.amount}
                details={t.note}
                featured={t.featured}
                action={<Button asChild className="flex-1 rounded-full"><a href={mailto}>{t.custom ? "ساهم بمبلغ مفتوح" : `ساهم بـ ${t.amount}`}</a></Button>}
              />
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          سيتم تفعيل الدفع الإلكتروني قريباً (CliQ، فيزا، حوالة بنكية، PayPal). حالياً يمكنك التواصل معنا مباشرة لإتمام المساهمة.
        </p>
      </section>

      {/* ============ 2. Sponsor an Episode ============ */}
      <section id="sponsor" className="container mx-auto px-6 py-20 scroll-mt-24 border-t border-border/60">
        <SectionHeader
          id="sponsor"
          eyebrow="٢ · للشركات والمؤسسات"
          title="باقات الرعاية المعتمدة"
          description={
            <>
              استثمار مجتمعي يربط علامتك التجارية بذاكرة وهوية المدينة. يقتصر قبول الرعايات على ٢٠ راعياً كحد أقصى لضمان حصرية وأناقة الظهور، مع أكثر من{" "}
              <span className="font-bold text-primary inline-block" dir="ltr">
                +<AnimatedCounter from={0} to={2000000} formatter={(v) => (v / 1000000).toFixed(1) + "M"} />
              </span>{" "}
              مشاهدة مجتمعة لأعمالنا التجريبية.
            </>
          }
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              tier: "راعي ريل",
              name: "Reel Sponsor",
              amount: "٥٠٠ - ١,٠٠٠ JOD",
              desc: "رعاية ريل واحد من مكتبة الريلز، يشمل بطاقة رعاية مستقلة والذكر في وصف المنشور.",
            },
            {
              tier: "راعي أساسي",
              name: "Basic Sponsor",
              amount: "٢,٠٠٠ JOD",
              desc: "يرتبط اسمك بإحدى الحلقات، ظهور ضمن شاشة الرعاة الجامعة، وإدراج في المواد الرقمية.",
            },
            {
              tier: "راعي حصري لحلقة",
              name: "Exclusive Sponsor",
              amount: "٥,٠٠٠ JOD",
              desc: "شاشة «بدعم من» بشعار كبير للحلقة والريلز المرتبطة بها، وظهور أوضح في حملة الإطلاق.",
              featured: true,
            },
          ].map((s) => (
            <SupportFlipCard
              key={s.tier}
              icon={s.featured ? Sparkles : Building2}
              title={s.tier}
              highlight={s.amount}
              details={`${s.name} — ${s.desc}`}
              featured={s.featured}
              action={<Button asChild className="flex-1 rounded-full"><a href="mailto:ahmad000haddad@gmail.com?subject=طلب رعاية - ناس إربد">اطلب الرعاية</a></Button>}
            />
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <a
            href="mailto:ahmad000haddad@gmail.com?subject=طلب رعاية - ناس إربد"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow hover:opacity-90 transition hover:scale-105"
          >
            تواصل معنا لحجز رعايتك
          </a>
        </div>
        
        <div className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-secondary/30 border border-border/50">
          <h4 className="font-display text-lg mb-3">قيمة ومحددات الظهور (ضوابط الرعاية):</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-2">
            <li>شاشة مستقلة من 3 إلى 5 ثوانٍ بعنوان "بدعم من: [شعار الراعي]".</li>
            <li>لا شعار داخل المشاهد أثناء السرد.</li>
            <li>راعٍ كبير واحد لكل حلقة، وشاشة جامعة لا تتجاوز 20 شعاراً.</li>
          </ul>
        </div>
      </section>


      {/* ============ 3. Institutional Partners ============ */}
      <section id="partners" className="container mx-auto px-6 py-20 scroll-mt-24 border-t border-border/60">
        <SectionHeader
          id="partners"
          eyebrow="٣ · الشركاء المعرفيون"
          title="شراكات لخدمة الذاكرة المشتركة"
          description="ندعو المؤسسات الثقافية والجامعات والمنظمات غير الربحية التي تؤمن بأنّ صون الهويّة الثقافية مسؤوليّةٌ مشتركة، لنتعاون معاً في بناء هذا الأرشيف وإتاحته للجميع."
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mt-12">
          {[
            {
              icon: Landmark,
              title: "المؤسسات الثقافية والحكومية",
              desc: "أمانة إربد الكبرى، وزارة الثقافة، المراكز الثقافية — شراكاتٌ في خدمة الذاكرة المشتركة.",
            },
            {
              icon: Handshake,
              title: "المنظمات غير الربحية",
              desc: "إن كانت مؤسستك تعمل على التراث أو الذاكرة الشفوية أو التنمية المحلية، نرحّب بتعاونٍ يخدم الجميع.",
            },
            {
              icon: GraduationCap,
              title: "الجامعات والباحثون",
              desc: "أرشيف ناس إربد متاحٌ مجاناً للباحثين في الأنثروبولوجيا والتاريخ الشفوي. علمٌ يُهدى للعلم.",
            },
            {
              icon: Users,
              title: "المبادرات والمساحات الشبابية",
              desc: "المساحات الثقافية، نوادي القراءة، والفرق التطوعية — لنتعاون في نقل هذه الذاكرة للأجيال الشابة.",
            },
          ].map((p) => (
            <SupportFlipCard
              key={p.title}
              icon={p.icon}
              title={p.title}
              details={p.desc}
              action={<Button asChild className="flex-1 rounded-full"><a href="mailto:ahmad000haddad@gmail.com">تواصل معنا</a></Button>}
            />
          ))}
        </div>
      </section>

      {/* ============ 4. Non-Monetary Support ============ */}
      <section id="non-monetary" className="container mx-auto px-6 py-20 scroll-mt-24 border-t border-border/60">
        <SectionHeader
          id="non-monetary"
          eyebrow="٤ · بدون مال"
          title="١٢ طريقة تدعم فيها البرنامج مجاناً"
          description="الدعم لا يُقاس بالمال وحده. وقتك، صوتك، ذاكرتك، أرشيفك، ومهارتك — كلّها مساهمات حقيقية."
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {[
            { icon: Share2, title: "النشر المستهدف", desc: "انشر روابط حلقاتنا في جروبات الفيسبوك الكبيرة الخاصة بعائلات وقرى إربد." },
            { icon: MessageCircle, title: "المنشن الاستراتيجي", desc: "أشر (منشن) للصحفيين والمؤثرين في تعليقات حلقاتنا ليلتفتوا للمشروع." },
            { icon: Users, title: "رشّح شخصية", desc: "تعرف حدا عنده حكاية تستحقّ التوثيق؟ رشّحه.", to: "/suggest" },
            { icon: MapPin, title: "افتح لنا بيتك أو محلّك", desc: "نحتاج مواقع تصوير أصيلة في إربد القديمة." },
            { icon: Handshake, title: "عرّفنا على ناس إربد", desc: "اربطنا بأصحاب المهن، الحكواتية، والشخصيات اللي تستاهل حلقة." },
            { icon: Mic2, title: "تطوّع وخبرة (SEO)", desc: "خبير تحسين محركات بحث، مونتير، أو تقني؟ مهاراتك تضاعف أثرنا." },
            { icon: Lightbulb, title: "اقترح فكرة حلقة", desc: "ميدان، مهنة، حدث — أي شي يستحقّ التوثيق." },
            { icon: Palette, title: "ترجمة ولغة إشارة", desc: "تطوع بترجمة الحلقات للغات أخرى أو إضافة لغة الإشارة لفئة الصم." },
            { icon: Megaphone, title: "اكتب عنّا", desc: "صحفي، بلوغر، مؤثر؟ نسعد بأيّ تغطية تكتبها." },
            { icon: Scale, title: "استشارة قانونية مجانية", desc: "محامٍ؟ ساعدنا بمراجعة عقود وموافقات النشر لحفظ حقوق الجميع." },
            { icon: Sparkles, title: "نظّم عرضاً محلياً", desc: "اعرض حلقاتنا في مدرستك، جامعتك، أو مقهاك لنشر الحكاية." },
            { icon: Quote, title: "ساعدنا في البحث والتدقيق", desc: "شغوف بالتاريخ؟ ساعدنا في توثيق وتدقيق أسماء الأماكن والأحداث." },
          ].map((item) => {
            return (
              <SupportFlipCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                details={item.desc}
                compact
                action={item.to ? <Button asChild className="flex-1 rounded-full"><Link to={item.to}>ابدأ الآن</Link></Button> : <Button asChild className="flex-1 rounded-full"><a href="mailto:ahmad000haddad@gmail.com">تواصل معنا</a></Button>}
              />
            );
          })}
        </div>
      </section>

      {/* ============ 5. Transparency ============ */}
      <section id="transparency" className="container mx-auto px-6 py-20 scroll-mt-24 border-t border-border/60">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            id="transparency"
            eyebrow="٥ · شفافية"
            title="أين يذهب كلّ دينار؟"
            description={
              <>
                لأنّ الثقة أساس أيّ علاقة، ننشر تقريراً مفصّلاً عن كلّ مساهمة تصلنا — مهما كانت صغيرة.{" "}
                <span className="group/fact relative inline-block align-middle outline-none" tabIndex={0}>
                  <button className="text-primary hover:text-primary/80 transition-colors pointer-events-none translate-y-[2px]">
                    <Info size={15} />
                  </button>
                  <span className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 w-[260px] p-3 bg-card border border-border/50 text-foreground text-xs rounded-xl opacity-0 group-hover/fact:opacity-100 group-focus/fact:opacity-100 transition-all pointer-events-none z-50 text-right shadow-lg">
                    <strong className="font-bold text-primary block mb-1">هل تعلم؟ 💡</strong>
                    يستغرق إنتاج حلقة وثائقية واحدة أكثر من ٤٠ ساعة عمل متواصلة تتوزع بين البحث الميداني، التصوير، والمونتاج لضمان خروجها بجودة تليق بذاكرة إربد.
                  </span>
                </span>
              </>
            }
          />

          <div className="mt-12">
            <div className="p-8 rounded-2xl bg-card border border-border/60 shadow-deep max-w-2xl mx-auto">
              <h3 className="font-display text-xl text-foreground mb-5">توزيع تكلفة الحلقة الواحدة</h3>
              <div className="space-y-4">
                {[
                  { l: "التصوير والعدسات السينمائية (إيجار + فريق)", v: 38, tooltip: "نعتمد كاميرات ومعدات سينمائية عالية الجودة لتوثيق الصورة بأفضل شكل يليق بإربد." },
                  { l: "المونتاج والتلوين السينمائي", v: 32, tooltip: "يتطلب أجهزة وتراخيص متخصصة لتوحيد ألوان الكاميرات وإعطاء الطابع الوثائقي المميز." },
                  { l: "إدارة الإنتاج (بحث، تنسيق، إخراج)", v: 20, tooltip: "إدارة اللوجستيات، وتنسيق فريق العمل والمعدات لضمان سير التصوير بسلاسة." },
                  { l: "بحث ميداني وتنقّلات", v: 10, tooltip: "تكاليف التنقل للقرى والأطراف للجلوس مع كبار السن وجمع المعلومات بدقة." },
                ].map((row) => (
                  <div key={row.l}>
                    <div className="flex justify-between text-xs mb-1.5 gap-3">
                      <span className="text-foreground/80 font-semibold group/tooltip relative cursor-help outline-none" tabIndex={0}>
                        <span className="border-b border-dashed border-primary/50">{row.l}</span>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-foreground text-background text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 group-focus/tooltip:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-md">
                          {row.tooltip}
                        </span>
                      </span>
                      <span className="font-bold text-primary shrink-0">
                        <AnimatedCounter from={0} to={row.v} formatter={(v) => `${Math.round(v)}%`} />
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.v}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="h-full bg-gradient-warm" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============ Final CTA ============ */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-warm shadow-deep relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <h3 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4 relative z-10">
            البرنامج يستحقّ أن يستمرّ
          </h3>
          <p className="text-primary-foreground/90 text-base mb-7 leading-relaxed relative z-10">
            إن كنتَ تؤمن بأنّ ذاكرة إربد أمانة، راسلنا بكلمة واحدة: «بدّي أساهم»،
            ونحن نرتّب معك أنسب طريقة — حسب وقتك وإمكانياتك.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <div className="relative group/glow">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-background to-primary rounded-full blur opacity-30 group-hover/glow:opacity-75 transition duration-1000 group-hover/glow:duration-200 animate-tilt"></div>
              <a
                href={`mailto:${contactEmail}?subject=بدّي أساهم في ناس إربد`}
                className="relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-background text-foreground text-sm font-bold hover:bg-background/90 transition group/btn hover:scale-105"
              >
                <Heart size={16} fill="currentColor" className="text-primary transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:animate-pulse" />
                <span>راسلنا الآن</span>
                
                {/* Email tooltip on hover */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max text-center text-[11px] text-primary-foreground/90 bg-background/20 backdrop-blur-sm rounded-md py-1.5 px-3 opacity-0 group-hover/btn:opacity-100 transition-all pointer-events-none font-sans tracking-wider" dir="ltr">
                  {contactEmail}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-background/20" />
                </span>
              </a>
            </div>
            
            <div className="relative">
              <button
                onClick={copyEmail}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-primary-foreground/30 text-primary-foreground text-sm font-bold hover:bg-primary-foreground/10 transition"
              >
                {emailCopied ? <Check size={16} /> : <Share2 size={16} />}
                {emailCopied ? "تم النسخ" : "انسخ البريد"}
              </button>
              <AnimatePresence>
                {emailCopied && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 text-center text-[11px] text-primary-foreground/80 bg-background/20 backdrop-blur-sm rounded py-1 px-2 pointer-events-none"
                  >
                    يمكنك الآن لصقه في تطبيق البريد الخاص بك
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, id }: { eyebrow: string; title: string; description: React.ReactNode; id?: string }) {
  const [copied, setCopied] = useState(false);

  const copyAnchor = () => {
    if (!id) return;
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("تم نسخ رابط القسم المباشر");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto text-center group">
      <span className="block text-xs font-bold text-primary tracking-widest mb-3">{eyebrow}</span>
      <h2 className="font-display text-3xl md:text-5xl mb-4 text-foreground relative flex items-center justify-center gap-3">
        {title}
        {id && (
          <button 
            onClick={copyAnchor}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-primary"
            title="انسخ رابط هذا القسم"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
          </button>
        )}
      </h2>
      <div className="text-base text-muted-foreground leading-relaxed">{description}</div>
    </div>
  );
}
