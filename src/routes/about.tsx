import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart, Coffee, Megaphone, Building2, Users, Camera, Mic2, Palette,
  Share2, MessageCircle, MapPin, Lightbulb, Handshake, GraduationCap,
  Landmark, Sparkles, ArrowLeft, Check
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "عن البرنامج · ناس إربد" },
      { name: "description", content: "تعرّف على فريق ناس إربد، رؤيتنا، وكل الطرق التي يمكنك فيها دعم استمرار البرنامج." },
      { property: "og:title", content: "عن البرنامج · ناس إربد" },
      { property: "og:description", content: "كيف تكون جزءاً من حماية ذاكرة إربد." },
    ],
  }),
});

function AboutPage() {
  return (
    <div>
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

        {/* Numbers */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { n: "+١٢", l: "حلقة موثّقة" },
            { n: "+٢٠", l: "شخصية روت قصتها" },
            { n: "+٨", l: "حياً تم تصويره" },
            { n: "١", l: "مدينة، آلاف الحكايات" },
          ].map((s) => (
            <div key={s.l} className="text-center p-6 rounded-xl bg-card border border-border/60">
              <div className="font-display text-4xl md:text-5xl text-gradient-gold mb-2">{s.n}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Support Hero ============ */}
      <section id="support" className="relative scroll-mt-24 border-y border-border/60 bg-card/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-6">
              <Heart size={28} className="text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-xs font-bold text-primary tracking-widest">ادعم استمرار البرنامج</span>
            <h2 className="font-display text-4xl md:text-6xl mt-3 mb-6 text-foreground">
              ذاكرة إربد <span className="text-gradient-gold">أمانة بإيدينا</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              كل حلقة من «ناس إربد» تحتاج تصوير احترافي، تفريغ، مونتاج، وتلوين سينمائي.
              هذا جهد أشهر وميزانية حقيقية. ما بنطلب دعم مالي بس — في عشرات الطرق
              تكون فيها جزء من المشروع، حتى لو ما عندك قرش واحد.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <a href="#donate" className="px-5 py-2.5 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition">
                تبرّع برمز محبة
              </a>
              <a href="#sponsor" className="px-5 py-2.5 rounded-full border border-border bg-background/40 text-foreground font-bold hover:border-primary/60 transition">
                ارعَ حلقة
              </a>
              <a href="#partners" className="px-5 py-2.5 rounded-full border border-border bg-background/40 text-foreground font-bold hover:border-primary/60 transition">
                شراكة مؤسسية
              </a>
              <a href="#non-monetary" className="px-5 py-2.5 rounded-full border border-border bg-background/40 text-foreground font-bold hover:border-primary/60 transition">
                دعم بدون مال
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 1. Small Donations ============ */}
      <section id="donate" className="container mx-auto px-6 py-20 scroll-mt-24">
        <SectionHeader
          eyebrow="١ · للأفراد"
          title="تبرّع برمز محبة"
          description="مبلغ صغير من كل متابع = موسم كامل من التوثيق. اختر الباقة اللي تناسبك، أو حدد المبلغ بنفسك."
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-5 mt-12">
          {[
            {
              icon: Coffee,
              name: "فنجان قهوة",
              amount: "٥ JOD",
              perks: ["كلمة شكر على صفحتنا", "إيميل أسبوعي بكواليس التصوير"],
              cta: "ادعم بـ ٥ دينار",
            },
            {
              icon: Camera,
              name: "كاسيت ذكريات",
              amount: "١٥ JOD",
              perks: ["كل اللي فوق", "اسمك في نهاية حلقة من اختيارك", "وصول مبكر للحلقات قبل النشر بـ ٤٨ ساعة"],
              cta: "ادعم بـ ١٥ دينار",
              featured: true,
            },
            {
              icon: Mic2,
              name: "حكاية شهرية",
              amount: "١٠ JOD/شهر",
              perks: ["كل اللي فوق", "بودكاست شهري حصري للداعمين", "بوستر رقمي شهري من كواليس الحلقة"],
              cta: "اشترك شهرياً",
            },
            {
              icon: Sparkles,
              name: "حدّد المبلغ",
              amount: "أنت تختار",
              perks: ["أي مبلغ تقدر تدفعه يفرق", "كل دينار يروح للإنتاج", "إيصال إلكتروني فوري"],
              cta: "تبرّع بمبلغ مفتوح",
              custom: true,
            },
          ].map((t) => (
            <div
              key={t.name}
              className={`relative p-7 rounded-2xl bg-card border transition hover:-translate-y-1 ${
                t.featured ? "border-primary/60 shadow-glow" : "border-border/60"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-warm text-primary-foreground text-[10px] font-bold tracking-widest">
                  الأكثر دعماً
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <t.icon size={22} className="text-primary" />
              </div>
              <div className="font-display text-xl text-foreground">{t.name}</div>
              <div className="font-display text-3xl text-gradient-gold mt-1 mb-4">{t.amount}</div>
              <ul className="space-y-2 mb-6">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-full text-sm font-bold transition ${
                  t.featured
                    ? "bg-gradient-warm text-primary-foreground shadow-glow hover:opacity-90"
                    : "border border-border text-foreground hover:border-primary"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          سيتم تفعيل الدفع الإلكتروني قريباً (CliQ، فيزا، حوالة بنكية، PayPal). حالياً يمكنك التواصل معنا مباشرة لإتمام التبرع.
        </p>
      </section>

      {/* ============ 2. Sponsor an Episode ============ */}
      <section id="sponsor" className="container mx-auto px-6 py-20 scroll-mt-24 border-t border-border/60">
        <SectionHeader
          eyebrow="٢ · للداعمين الكبار"
          title="ارعَ حلقة كاملة"
          description="ارعَ تصوير حلقة باسمك، باسم عائلتك، أو إهداءً لشخص عزيز. اختر مستوى الرعاية."
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              tier: "راعي حكاية",
              amount: "٢٠٠ JOD",
              desc: "ارعَ جزءاً من تكاليف حلقة (تنقّلات، تفريغ، صور).",
              perks: ["اسمك/عائلتك في تترات الحلقة", "بوستر مطبوع موقّع", "نسخة عالية الجودة من الحلقة"],
            },
            {
              tier: "راعي حلقة",
              amount: "٧٥٠ JOD",
              desc: "ارعَ حلقة كاملة من الفكرة للتصوير للتلوين السينمائي.",
              perks: [
                "اسمك في الافتتاحية + الخاتمة",
                "حضور يوم التصوير (اختياري)",
                "حلقة مهداة باسم من تختار",
                "٥ بوسترات مطبوعة",
                "ذكر في كل منشورات الحلقة",
              ],
              featured: true,
            },
            {
              tier: "راعي موسم",
              amount: "٤٠٠٠ JOD",
              desc: "ارعَ موسماً كاملاً (٦ حلقات) وكن جزءاً من قرارات الإنتاج.",
              perks: [
                "هويتك ضمن هوية الموسم",
                "اقتراح ٢ من شخصيات الموسم",
                "حلقة وراء الكواليس عنك/عن مؤسستك",
                "كل امتيازات راعي الحلقة × ٦",
              ],
            },
          ].map((s) => (
            <div
              key={s.tier}
              className={`relative p-8 rounded-2xl bg-card border transition ${
                s.featured ? "border-primary/60 shadow-glow" : "border-border/60"
              }`}
            >
              {s.featured && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-warm text-primary-foreground text-[10px] font-bold tracking-widest">
                  الأكثر طلباً
                </div>
              )}
              <div className="text-xs font-bold text-primary tracking-widest mb-2">{s.tier}</div>
              <div className="font-display text-4xl text-gradient-gold mb-3">{s.amount}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.desc}</p>
              <ul className="space-y-2.5 mb-7">
                {s.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:hello@nas-irbid.jo?subject=أرغب برعاية حلقة"
                className="block text-center w-full py-3 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow hover:opacity-90"
              >
                تواصل معنا
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 3. Institutional Partners ============ */}
      <section id="partners" className="container mx-auto px-6 py-20 scroll-mt-24 border-t border-border/60">
        <SectionHeader
          eyebrow="٣ · للمؤسسات والشركات"
          title="شراكات مؤسسية"
          description="إذا كانت لديك علامة تجارية أو مؤسسة، ناس إربد فرصة للوصول لجمهور حقيقي مرتبط بهويته."
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mt-12">
          {[
            {
              icon: Building2,
              title: "شركات إربد المحلية",
              desc: "مطاعم، مقاهي، محلات تراثية، مكاتب — اربط علامتك بمشروع يحبّه أهل المدينة. باقات إعلانية ذكية بدون إفساد طابع البرنامج.",
              cta: "اطلب باقة الإعلان",
            },
            {
              icon: Landmark,
              title: "المؤسسات الثقافية والحكومية",
              desc: "أمانة إربد الكبرى، وزارة الثقافة، الجامعات، المراكز الثقافية. شراكة محتوى لتوثيق أرشيف مشترك.",
              cta: "اقترح شراكة",
            },
            {
              icon: Handshake,
              title: "المنظمات غير الربحية",
              desc: "هل تعمل مؤسستك على التراث، الذاكرة الشفوية، التنمية المحلية؟ نوفّر تغطية وثائقية احترافية لمشاريعكم.",
              cta: "ناقش التعاون",
            },
            {
              icon: GraduationCap,
              title: "الجامعات والأبحاث",
              desc: "أرشيف ناس إربد متاح للباحثين في الأنثروبولوجيا، التاريخ الشفوي، والإعلام. شارك معنا في أبحاث ميدانية.",
              cta: "تواصل أكاديمياً",
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
                  <a href="mailto:hello@nas-irbid.jo" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1">
                    {p.cta} <ArrowLeft size={14} />
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
          title="عشر طرق تدعم فيها البرنامج مجاناً"
          description="مش لازم تدفع. وقتك، صوتك، وحكاياتك دعم حقيقي."
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {[
            { icon: Share2, title: "شارك الحلقات", desc: "كل مشاركة بتوصل البرنامج لعائلة جديدة." },
            { icon: MessageCircle, title: "اكتب تعليق", desc: "تعليقك على يوتيوب يساعد الخوارزمية ترفع الحلقة." },
            { icon: Users, title: "رشّح شخصية", desc: "تعرف حدا عنده حكاية؟ رشّحه عبر صفحة الاقتراح.", to: "/suggest" },
            { icon: MapPin, title: "افتح لنا بيتك أو محلك", desc: "نحتاج مواقع تصوير أصيلة في إربد القديمة." },
            { icon: Camera, title: "تبرّع بصور قديمة", desc: "عندك صور عائلية من إربد القديمة؟ شاركها في جدارية الذاكرة.", to: "/memories" },
            { icon: Mic2, title: "تطوّع بمهارتك", desc: "مصور، مونتير، صوت، مترجم؟ فريقنا بحاجتك." },
            { icon: Lightbulb, title: "اقترح فكرة حلقة", desc: "ميدان، مهنة، حدث — أي شي يستحق التوثيق." },
            { icon: Palette, title: "ترجم محتوانا", desc: "ساعدنا نوصل لجمهور عربي خارج الأردن، أو نعمل ترجمة إنجليزية." },
            { icon: Megaphone, title: "اكتب عنا", desc: "صحفي، بلوغر، مؤثر؟ نسعد بأي تغطية تكتبها." },
          ].map((item) => {
            const Inner = (
              <>
                <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <item.icon size={18} className="text-primary" />
                </div>
                <h4 className="font-display text-lg text-foreground mb-1.5">{item.title}</h4>
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
            title="أين تذهب أموالكم؟"
            description="ما منعمل سر من أي قرش. كل دينار يدخل البرنامج بنشر له تقرير."
          />

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border/60">
              <h4 className="font-display text-xl text-foreground mb-4">توزيع تكلفة الحلقة الواحدة</h4>
              <div className="space-y-3">
                {[
                  { l: "تصوير وكاميرات (إيجار + فريق)", v: 40 },
                  { l: "مونتاج وتلوين سينمائي", v: 30 },
                  { l: "بحث ميداني وتنقّلات", v: 15 },
                  { l: "إنتاج موسيقي وأصوات", v: 10 },
                  { l: "نشر وتوزيع", v: 5 },
                ].map((row) => (
                  <div key={row.l}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{row.l}</span>
                      <span className="font-bold text-primary">{row.v}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                      <div className="h-full bg-gradient-warm" style={{ width: `${row.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60">
              <h4 className="font-display text-xl text-foreground mb-4">تعهداتنا للداعمين</h4>
              <ul className="space-y-3">
                {[
                  "تقرير مالي مبسّط آخر كل موسم",
                  "ذكر اسم كل داعم (إلا إذا طلب عدم الذكر)",
                  "صفر إعلانات مزعجة داخل الحلقات",
                  "صفر محتوى ممول بشكل خفي",
                  "حق الانسحاب من الاشتراك الشهري بأي وقت",
                  "كل المحتوى يبقى مجاناً للمشاهدة",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Final CTA ============ */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-warm shadow-deep">
          <h3 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4">
            ما عندك وقت لتقرأ كل هاد؟
          </h3>
          <p className="text-primary-foreground/90 text-base mb-7 leading-relaxed">
            راسلنا بكلمة واحدة "بدّي أدعم"، ونحنا منرتبلك أنسب طريقة حسب وقتك وإمكانياتك.
          </p>
          <a
            href="mailto:hello@nas-irbid.jo?subject=بدّي أدعم ناس إربد"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-background text-foreground text-sm font-bold hover:bg-background/90 transition"
          >
            <Heart size={16} fill="currentColor" className="text-primary" />
            راسلنا الآن
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <span className="text-xs font-bold text-primary tracking-widest">{eyebrow}</span>
      <h2 className="font-display text-3xl md:text-5xl mt-3 mb-4 text-foreground">{title}</h2>
      <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
