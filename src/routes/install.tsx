import { createFileRoute } from "@tanstack/react-router";
import { Apple, Smartphone, Share, MoreVertical, PlusSquare, Monitor, Download } from "lucide-react";

export const Route = createFileRoute("/install")({
  head: () => ({
    meta: [
      { title: "ثبّت التطبيق · ناس إربد" },
      { name: "description", content: "طريقة تثبيت موقع ناس إربد كتطبيق على هاتفك (iPhone وAndroid) وعلى الحاسوب." },
      { property: "og:title", content: "ثبّت التطبيق · ناس إربد" },
      { property: "og:description", content: "دليل مصوّر لخطوات إضافة ناس إربد إلى الشاشة الرئيسية على iPhone وAndroid." },
      { property: "og:url", content: "https://nas-irbid.lovable.app/install" },
    ],
    links: [{ rel: "canonical", href: "https://nas-irbid.lovable.app/install" }],
  }),
  component: InstallPage,
});

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 items-start">
      <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center font-bold text-sm shadow-glow">
        {n}
      </span>
      <div className="text-sm leading-relaxed text-foreground/90 pt-1">{children}</div>
    </li>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 md:p-8 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
      </div>
      <ol className="space-y-4">{children}</ol>
    </div>
  );
}

function InstallPage() {
  return (
    <div className="container mx-auto px-6 py-14 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold mb-4">
          <Download size={14} /> تطبيق ويب قابل للتثبيت
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
          ثبّت ناس إربد على جهازك
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          يمكنك إضافة الموقع كتطبيق على شاشتك الرئيسية لتفتحه بضغطة واحدة، بدون تحميل من متجر التطبيقات.
          يعمل على iPhone وAndroid وأجهزة الحاسوب.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card icon={<Apple size={22} />} title="على iPhone / iPad (Safari)">
          <Step n={1}>
            افتح الموقع من متصفح <strong>Safari</strong> (لن تعمل الخطوة من داخل تطبيق آخر مثل انستغرام).
          </Step>
          <Step n={2}>
            اضغط زر المشاركة <Share size={14} className="inline mx-1 text-primary" /> في الشريط السفلي.
          </Step>
          <Step n={3}>
            من القائمة اختر <strong>«إضافة إلى الشاشة الرئيسية»</strong>{" "}
            <PlusSquare size={14} className="inline mx-1 text-primary" />.
          </Step>
          <Step n={4}>
            اضغط <strong>«إضافة»</strong>، وستظهر أيقونة ناس إربد على شاشة جهازك.
          </Step>
        </Card>

        <Card icon={<Smartphone size={22} />} title="على Android (Chrome)">
          <Step n={1}>
            افتح الموقع من متصفح <strong>Chrome</strong>.
          </Step>
          <Step n={2}>
            اضغط زر القائمة <MoreVertical size={14} className="inline mx-1 text-primary" /> في أعلى الشاشة.
          </Step>
          <Step n={3}>
            اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.
          </Step>
          <Step n={4}>
            أكّد التثبيت، وسيُضاف التطبيق تلقائيًا إلى قائمة تطبيقاتك.
          </Step>
        </Card>

        <Card icon={<Monitor size={22} />} title="على الحاسوب (Chrome / Edge)">
          <Step n={1}>
            افتح الموقع من متصفح Chrome أو Edge.
          </Step>
          <Step n={2}>
            ابحث عن أيقونة التثبيت <Download size={14} className="inline mx-1 text-primary" /> في نهاية شريط العنوان.
          </Step>
          <Step n={3}>
            اضغطها ثم <strong>«تثبيت»</strong>، وسيفتح التطبيق في نافذة مستقلة.
          </Step>
        </Card>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-3">لماذا تثبّته؟</h2>
          <ul className="space-y-3 text-sm text-foreground/90 leading-relaxed list-disc pr-5">
            <li>يفتح مباشرة من شاشتك الرئيسية بدون شريط المتصفح.</li>
            <li>أخف وأسرع من تطبيقات المتجر — لا يشغل مساحة تُذكر.</li>
            <li>يبقى محدَّثًا تلقائيًا؛ لا حاجة لتحديثات يدوية.</li>
            <li>تصلك أحدث الحلقات فور نشرها.</li>
          </ul>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-10">
        لا يظهر خيار التثبيت؟ تأكّد أنك تستخدم متصفحًا حديثًا وأنك تفتح الموقع مباشرة وليس من داخل تطبيق آخر.
      </p>
    </div>
  );
}
