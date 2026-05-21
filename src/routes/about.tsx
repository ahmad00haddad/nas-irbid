import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart, Coffee, Megaphone, Building2, Users, Camera, Mic2, Palette,
  Share2, MessageCircle, MapPin, Lightbulb, Handshake, GraduationCap,
  Landmark, Sparkles, ArrowLeft, Check, Quote
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "عن البرنامج · ناس إربد" },
      { name: "description", content: "تعرّف على رؤية ناس إربد، وكيف يمكنك أن تكون جزءاً من حماية ذاكرة المدينة." },
      { property: "og:title", content: "عن البرنامج · ناس إربد" },
      { property: "og:description", content: "الدعم مسؤولية مجتمعية، لا خدمة بمقابل." },
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
            <span className="text-xs font-bold text-primary tracking-widest">مسؤوليّتنا الجماعية</span>
            <h2 className="font-display text-4xl md:text-6xl mt-3 mb-6 text-foreground">
              ذاكرة إربد <span className="text-gradient-gold">أمانة بإيدينا</span>
            </h2>
          </div>

          {/* Philosophy statement */}
          <div className="max-w-3xl mx-auto mt-10 p-8 md:p-10 rounded-2xl bg-background/60 border border-border/60 relative">
            <Quote size={32} className="text-primary/40 absolute top-5 right-5 rotate-180" />
            <p className="text-lg md:text-xl text-foreground/90 leading-loose text-center font-display">
              نحنُ لا نطلبُ دعماً <span className="text-gradient-gold">مقابل خدمة</span>.
              <br />
              ولا نقدّمُ امتيازات للمتبرّعين.
              <br />
              ندعو فقط من يؤمن أنّ <span className="text-gradient-gold">حفظ الذاكرة مسؤولية</span>،
              وأنّ هذا البرنامج يستحقّ أن يستمرّ
              <br />
              لأنّه يُرسّخ قيماً نبيلة في مجتمعنا.
            </p>
            <p className="text-center text-sm text-muted-foreground mt-6 leading-relaxed">
              الدعم هنا فعلُ محبّةٍ للمدينة، لا صفقة. وكلّ ما يصلنا — قرشاً كان أو وقتاً أو حكاية — يعودُ كاملاً
              للبرنامج ولأهل إربد.
            </p>
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
          ].map((t) => (
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
              <button
                className={`w-full py-2.5 rounded-full text-sm font-bold transition ${
                  t.featured
                    ? "bg-gradient-warm text-primary-foreground shadow-glow hover:opacity-90"
                    : "border border-border text-foreground hover:border-primary"
                }`}
              >
                {t.custom ? "ساهم بمبلغ مفتوح" : `ساهم بـ ${t.amount}`}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          سيتم تفعيل الدفع الإلكتروني قريباً (CliQ، فيزا، حوالة بنكية، PayPal). حالياً يمكنك التواصل معنا مباشرة لإتمام المساهمة.
        </p>
      </section>

      {/* ============ 2. Sponsor an Episode ============ */}
      <section id="sponsor" className="container mx-auto px-6 py-20 scroll-mt-24 border-t border-border/60">
        <SectionHeader
          eyebrow="٢ · مساهمات أكبر"
          title="ادعم حلقة كاملة"
          description="إن أردتَ المساهمة في تكاليف حلقة بأكملها، فهذا فعلٌ يحمي قصّة كاملةً من النسيان. لا اسم على التترات، ولا مقابلٌ معلن — فقط أثرٌ يبقى."
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              tier: "جزء من حلقة",
              amount: "٢٠٠ JOD",
              desc: "تساهم في جزءٍ من تكاليف حلقة (تنقّلات، تفريغ، صور).",
            },
            {
              tier: "حلقة كاملة",
              amount: "٧٥٠ JOD",
              desc: "تغطّي تكاليف حلقة من البحث إلى التصوير إلى التلوين السينمائي.",
              featured: true,
            },
            {
              tier: "موسم كامل",
              amount: "٤٠٠٠ JOD",
              desc: "تحمي موسماً كاملاً من ست حلقات — ست قصصٍ تُروى وتُحفظ للأجيال.",
            },
          ].map((s) => (
            <div
              key={s.tier}
              className={`relative p-8 rounded-2xl bg-card border transition ${
                s.featured ? "border-primary/60 shadow-glow" : "border-border/60"
              }`}
            >
              <div className="text-xs font-bold text-primary tracking-widest mb-2">{s.tier}</div>
              <div className="font-display text-4xl text-gradient-gold mb-3">{s.amount}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-7">{s.desc}</p>
              <p className="text-xs text-muted-foreground/80 italic mb-6 leading-relaxed">
                إن رغبتَ بعدم ذكر اسمك، نحترم ذلك. وإن أردتَ أن يُذكر، نشكرك بكلمةٍ بسيطة في صفحة الداعمين — لا أكثر.
              </p>
              <a
                href="mailto:hello@nas-irbid.jo?subject=أرغب بدعم حلقة"
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
          eyebrow="٣ · للمؤسسات"
          title="دعم مؤسسي بروح المسؤولية"
          description="ندعو المؤسسات التي تؤمن بأنّ صون الهويّة الثقافية مسؤوليّةٌ مشتركة. لا حزم إعلانية، ولا رعايات تجارية بمحتوى ممول — فقط دعمٌ نبيل لرسالةٍ نبيلة."
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mt-12">
          {[
            {
              icon: Building2,
              title: "شركات إربد المحلية",
              desc: "إن كانت علامتك التجارية من إربد وتؤمن بأهميّة توثيق هويّة مدينتها، ندعوك لتكون شريكاً في الرسالة لا في الإعلان.",
            },
            {
              icon: Landmark,
              title: "المؤسسات الثقافية والحكومية",
              desc: "أمانة إربد الكبرى، وزارة الثقافة، الجامعات، المراكز الثقافية — شراكاتٌ في خدمة الذاكرة المشتركة.",
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
            { icon: MessageCircle, title: "اكتب تعليقاً", desc: "تعليقك على يوتيوب يساعد الحلقة توصل لمزيد من الناس." },
            { icon: Users, title: "رشّح شخصية", desc: "تعرف حدا عنده حكاية تستحقّ التوثيق؟ رشّحه.", to: "/suggest" },
            { icon: MapPin, title: "افتح لنا بيتك أو محلّك", desc: "نحتاج مواقع تصوير أصيلة في إربد القديمة." },
            { icon: Camera, title: "تبرّع بصور قديمة", desc: "صورك العائلية من إربد القديمة كنزٌ توثيقي.", to: "/memories" },
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
            title="أين يذهب كلّ دينار؟"
            description="لأنّ الثقة أساس أيّ علاقة، ننشر تقريراً مفصّلاً عن كلّ مساهمة تصلنا — مهما كانت صغيرة."
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
              <h4 className="font-display text-xl text-foreground mb-4">تعهّداتنا</h4>
              <ul className="space-y-3">
                {[
                  "تقرير مالي مبسّط آخر كلّ موسم، منشور للعموم",
                  "صفر إعلانات داخل الحلقات",
                  "صفر محتوى مموّل أو مخفي",
                  "كلّ دينار يذهب لإنتاج البرنامج، لا أرباح شخصية",
                  "كلّ المحتوى يبقى مجاناً للمشاهدة، للأبد",
                  "نحترم رغبة من يفضّل عدم ذكر اسمه",
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
            البرنامج يستحقّ أن يستمرّ
          </h3>
          <p className="text-primary-foreground/90 text-base mb-7 leading-relaxed">
            إن كنتَ تؤمن بأنّ ذاكرة إربد أمانة، راسلنا بكلمة واحدة: «بدّي أساهم»،
            ونحن نرتّب معك أنسب طريقة — حسب وقتك وإمكانياتك.
          </p>
          <a
            href="mailto:hello@nas-irbid.jo?subject=بدّي أساهم في ناس إربد"
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
