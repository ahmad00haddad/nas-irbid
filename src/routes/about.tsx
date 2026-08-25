import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart, Coffee, Megaphone, Building2, Users, Camera, Mic2, Palette,
  Share2, MessageCircle, MapPin, Lightbulb, Handshake, GraduationCap,
  Landmark, Sparkles, ArrowLeft, Quote, ArrowUp, Check
} from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";
import { ReadingProgressBar } from "@/components/ui/reading-progress";
import { motion, animate, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TextReveal } from "@/components/ui/text-reveal";
import { FadeIn } from "@/components/ui/fade-in";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "عن البرنامج · ناس إربد" },
      { name: "description", content: "تعرّف على رؤية ناس إربد، وكيف يمكنك أن تكون جزءاً من حماية ذاكرة المدينة." },
      { property: "og:title", content: "عن البرنامج · ناس إربد" },
      { property: "og:description", content: "الدعم مسؤولية مجتمعية، لا خدمة بمقابل." },
      { property: "og:url", content: "https://nas-irbid.lovable.app/about" },
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

function AboutPage() {
  const { data: settings } = useSiteSettings();
  const contactEmail = settings?.contact_email ?? "ahmad000haddad@gmail.com";
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(contactEmail);
    setEmailCopied(true);
    toast.success("تم نسخ البريد الإلكتروني");
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="relative">
      <ReadingProgressBar />
      
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-glow flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="العودة للأعلى"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
      {/* ============ Vision ============ */}
      <section className="container mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold text-primary tracking-widest">عن البرنامج</span>
          <h1 className="font-display text-5xl md:text-6xl mt-3 mb-6 text-foreground">
            نوثّقُ إربد <span className="text-gradient-gold">بصوت أهلها</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            «ناس إربد» مشروع وثائقي مستقل، يولد من إيمانٍ بأن المدن تحيا بذاكرة ناسها.
            نسجّل القصص قبل أن تضيع، نوثّق المهن قبل أن تنقرض، ونحفظ لهجة المدينة وأسماء حاراتها
            من النسيان. كل حلقة هي رسالة حب من جيلٍ لجيل.
          </p>
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
          </div>

          {/* Philosophy statement */}
          <div className="max-w-3xl mx-auto mt-10 p-8 md:p-10 rounded-2xl bg-background/60 border border-border/60 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Quote size={32} className="text-primary/20 absolute top-5 right-5 rotate-180 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/40" />
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-foreground/90 leading-loose text-center font-display relative z-10">
                نحنُ لا نطلبُ دعماً <span className="text-gradient-gold">مقابل خدمة</span>.
                <br />
                ولا نقدّمُ امتيازات للمتبرّعين.
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
              <div
                key={t.name}
                className={`relative p-7 rounded-2xl bg-card border transition hover:-translate-y-1 ${
                  t.featured ? "border-primary/60 shadow-glow" : "border-border/60"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <t.icon size={22} className="text-primary" />
                </div>
                <div className="font-display text-xl text-foreground">{t.name}</div>
                <div className="font-display text-3xl text-gradient-gold mt-1 mb-4">{t.amount}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 min-h-[3rem]">{t.note}</p>
                <a
                  href={mailto}
                  className={`block text-center w-full py-2.5 rounded-full text-sm font-bold transition ${
                    t.featured
                      ? "bg-gradient-warm text-primary-foreground shadow-glow hover:opacity-90"
                      : "border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {t.custom ? "ساهم بمبلغ مفتوح" : `ساهم بـ ${t.amount}`}
                </a>
              </div>
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
            <div
              key={s.tier}
              className={`relative p-8 rounded-2xl bg-card border transition group hover:-translate-y-1 ${
                s.featured ? "border-primary/60 shadow-glow" : "border-border/60 hover:border-primary/40"
              }`}
            >
              {s.featured && (
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
              )}
              <div className="text-xs font-bold text-primary tracking-widest mb-1">{s.tier}</div>
              <div className="text-[10px] uppercase text-muted-foreground mb-3">{s.name}</div>
              <div className="font-display text-3xl text-gradient-gold mb-3" dir="ltr">{s.amount}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-7">{s.desc}</p>
              <a
                href="mailto:ahmad000haddad@gmail.com?subject=طلب رعاية - ناس إربد"
                className="block text-center w-full py-3 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow hover:opacity-90"
              >
                تواصل لحجز الرعاية
              </a>
            </div>
          ))}
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
            <div key={p.title} className="p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <p.icon size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
                  <a href="mailto:ahmad000haddad@gmail.com" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1">
                    تواصل معنا <ArrowLeft size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 4. Non-Monetary Support ============ */}
      <section id="non-monetary" className="container mx-auto px-6 py-20 scroll-mt-24 border-t border-border/60">
        <SectionHeader
          eyebrow="٤ · بدون مال"
          title="تسع طرق تدعم فيها البرنامج مجاناً"
          description="الدعم لا يُقاس بالمال وحده. وقتك، صوتك، ذاكرتك، ومهارتك — كلّها مساهمات حقيقية."
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {[
            { icon: Share2, title: "شارك الحلقات", desc: "كلّ مشاركة بتوصل البرنامج لعائلة جديدة." },
            { icon: MessageCircle, title: "اكتب تعليقاً", desc: "تعليقك — على أي منصّة — يساعد الحلقة توصل لمزيد من الناس." },
            { icon: Users, title: "رشّح شخصية", desc: "تعرف حدا عنده حكاية تستحقّ التوثيق؟ رشّحه.", to: "/suggest" },
            { icon: MapPin, title: "افتح لنا بيتك أو محلّك", desc: "نحتاج مواقع تصوير أصيلة في إربد القديمة." },
            { icon: Handshake, title: "عرّفنا على ناس إربد", desc: "اربطنا بأصحاب المهن، الحكواتية، والشخصيات اللي تستاهل حلقة." },
            { icon: Mic2, title: "تطوّع بمهارتك", desc: "مصور، مونتير، صوت، مترجم؟ فريقنا بحاجتك." },
            { icon: Lightbulb, title: "اقترح فكرة حلقة", desc: "ميدان، مهنة، حدث — أي شي يستحقّ التوثيق." },
            { icon: Palette, title: "ترجم محتوانا", desc: "ساعدنا نوصل لجمهور أوسع داخل الأردن وخارجه." },
            { icon: Megaphone, title: "اكتب عنّا", desc: "صحفي، بلوغر، مؤثر؟ نسعد بأيّ تغطية تكتبها." },
          ].map((item) => {
            const Inner = (
              <>
                <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <item.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </>
            );
            return item.to ? (
              <Link
                key={item.title}
                to={item.to}
                className="p-6 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition block"
              >
                {Inner}
              </Link>
            ) : (
              <div key={item.title} className="p-6 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition">
                {Inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ 5. Transparency ============ */}
      <section className="container mx-auto px-6 py-20 border-t border-border/60">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            eyebrow="٥ · شفافية"
            title="أين يذهب كلّ دينار؟"
            description="لأنّ الثقة أساس أيّ علاقة، ننشر تقريراً مفصّلاً عن كلّ مساهمة تصلنا — مهما كانت صغيرة."
          />

          <div className="mt-12">
            <div className="p-8 rounded-2xl bg-card border border-border/60 shadow-deep max-w-2xl mx-auto">
              <h3 className="font-display text-xl text-foreground mb-5">توزيع تكلفة الحلقة الواحدة</h3>
              <div className="space-y-4">
                {[
                  { l: "التصوير والعدسات السينمائية (إيجار + فريق + خبرة)", v: 38 },
                  { l: "المونتاج والتلوين السينمائي", v: 32 },
                  { l: "إدارة الإنتاج (بحث، تنسيق، إخراج)", v: 20 },
                  { l: "بحث ميداني وتنقّلات", v: 10 },
                ].map((row) => (
                  <div key={row.l}>
                    <div className="flex justify-between text-xs mb-1.5 gap-3">
                      <span className="text-foreground/80 font-semibold">{row.l}</span>
                      <span className="font-bold text-primary shrink-0">{row.v}%</span>
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
        <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-warm shadow-deep">
          <h3 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4">
            البرنامج يستحقّ أن يستمرّ
          </h3>
          <p className="text-primary-foreground/90 text-base mb-7 leading-relaxed">
            إن كنتَ تؤمن بأنّ ذاكرة إربد أمانة، راسلنا بكلمة واحدة: «بدّي أساهم»،
            ونحن نرتّب معك أنسب طريقة — حسب وقتك وإمكانياتك.
          </p>
          <a
            href={`mailto:${contactEmail}?subject=بدّي أساهم في ناس إربد`}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-background text-foreground text-sm font-bold hover:bg-background/90 transition group"
          >
            <Heart size={16} fill="currentColor" className="text-primary transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
            راسلنا الآن
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <span className="text-xs font-bold text-primary tracking-widest">{eyebrow}</span>
      <h2 className="font-display text-3xl md:text-5xl mt-3 mb-4 text-foreground">{title}</h2>
      <div className="text-base text-muted-foreground leading-relaxed">{description}</div>
    </div>
  );
}
