import { createFileRoute } from "@tanstack/react-router";
import { Heart, Coffee, Megaphone, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "عن البرنامج · ناس إربد" },
      { name: "description", content: "تعرّف على فريق ناس إربد، رؤية البرنامج، وكيف يمكنك دعمه." },
      { property: "og:title", content: "عن البرنامج · ناس إربد" },
      { property: "og:description", content: "رؤية البرنامج وكيف يمكنك أن تكون جزءاً من استمراره." },
    ],
  }),
});

function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      {/* Vision */}
      <section className="max-w-3xl mx-auto text-center mb-24">
        <span className="text-xs font-bold text-primary tracking-widest">عن البرنامج</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3 mb-6 text-foreground">
          نوثّقُ إربد <span className="text-gradient-gold">بصوت أهلها</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          «ناس إربد» مشروع وثائقي مستقل، يولد من إيمانٍ بأن المدن تحيا بذاكرة ناسها.
          نسجّل القصص قبل أن تضيع، نوثّق المهن قبل أن تنقرض، ونحفظ لهجة المدينة وأسماء حاراتها
          من النسيان. كل حلقة هي رسالة حب من جيلٍ لجيل.
        </p>
      </section>

      {/* Numbers */}
      <section className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
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
      </section>

      {/* Support */}
      <section id="support" className="max-w-5xl mx-auto scroll-mt-24">
        <header className="text-center mb-14">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-6">
            <Heart size={28} className="text-primary-foreground" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl mb-5 text-foreground">
            ادعم <span className="text-gradient-gold">استمرار البرنامج</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            البرنامج إنتاج مستقل، يحمل تكاليف التصوير، المونتاج، والتلوين السينمائي.
            كل دعم — مهما كان حجمه — يساعدنا نُكمل التوثيق.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Coffee,
              title: "ارعَ حلقة",
              text: "ادعم تصوير حلقة كاملة بشكلٍ شخصي أو باسم عائلتك. اسمك يظهر في الجنريك.",
              cta: "تواصل معنا",
            },
            {
              icon: Megaphone,
              title: "كن راعياً",
              text: "إذا كانت لديك مؤسسة أو علامة تجارية تحب توثيق التراث، شراكتنا تصلك لجمهور مخلص.",
              cta: "خيارات الرعاية",
            },
            {
              icon: ShoppingBag,
              title: "متجر ناس إربد",
              text: "قريباً: منتجات تحمل هوية البرنامج (بوسترات، أكواب، بطاقات) تعرّفك على المدينة وتدعمنا.",
              cta: "قريباً",
              disabled: true,
            },
          ].map(({ icon: Icon, title, text, cta, disabled }) => (
            <div key={title} className="p-7 rounded-2xl bg-card border border-border/60">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{text}</p>
              <a
                href={disabled ? undefined : "mailto:hello@nas-irbid.jo"}
                aria-disabled={disabled}
                className={
                  disabled
                    ? "inline-block text-sm font-bold text-muted-foreground cursor-not-allowed"
                    : "inline-block text-sm font-bold text-primary hover:underline"
                }
              >
                {cta} ←
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
