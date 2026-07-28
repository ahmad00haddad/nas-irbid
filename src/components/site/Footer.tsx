import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Mail } from "lucide-react";
import { useSiteSettings, DEFAULT_SETTINGS } from "@/lib/site-settings";

export function Footer() {
  const { data: s } = useSiteSettings();
  const settings = s ?? DEFAULT_SETTINGS;
  const igUrl = `https://instagram.com/${settings.instagram_handle.replace(/^@/, "")}`;

  return (
    <footer className="border-t border-border/60 bg-card/30 mt-24">
      <div className="container mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="font-display text-2xl font-bold text-gradient-gold mb-3">ناس إربد</div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            برنامج وثائقي إنساني يحكي قصص أهل إربد، يحفظ ذاكرتهم الشفوية، ويوثّق المهن والحارات
            قبل أن يطويها الزمن.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg text-foreground mb-4 divider-emerald">روابط سريعة</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/episodes" className="hover:text-primary">أرشيف الحلقات</Link></li>
            <li><Link to="/suggest" className="hover:text-primary">اقترح شخصية أو حكاية</Link></li>
            <li><Link to="/about" className="hover:text-primary">عن البرنامج وفريقه</Link></li>
            <li><Link to="/about" hash="support" className="hover:text-primary">ادعم البرنامج</Link></li>
            <li className="pt-2">
              <Link to="/install" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary font-bold hover:bg-primary/20 transition">
                ثبّت التطبيق <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-foreground mb-4">تابعنا</h4>
          <div className="flex gap-3">
            <a href={igUrl} target="_blank" rel="noreferrer" aria-label="انستغرام"
               className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition">
              <Instagram size={18} />
            </a>
            <a href={settings.youtube_url} target="_blank" rel="noreferrer" aria-label="يوتيوب"
               className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition">
              <Youtube size={18} />
            </a>
            <a href={`mailto:${settings.contact_email}`} aria-label="بريد"
               className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition">
              <Mail size={18} />
            </a>
          </div>
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="text-sm font-semibold text-primary/80 mb-1 opacity-90">
              فيلم لـ أحمد حداد
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تقديم بسمة الذينات · جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
