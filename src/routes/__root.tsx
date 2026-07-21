import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { Cursor } from "@/components/ui/cursor";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-gradient-gold">٤٠٤</h1>
        <h2 className="mt-4 font-display text-3xl text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          يبدو أن هذه الحكاية لم تُروَ بعد، أو أن الرابط الذي تبحث عنه غير صحيح.
        </p>
        <Link to="/" className="mt-8 inline-flex px-8 py-3.5 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 transition">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-20">
      <div className="max-w-md text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 items-center justify-center mb-6">
           <span className="font-display text-3xl text-destructive">!</span>
        </div>
        <h1 className="font-display text-3xl text-foreground mb-3">حدث خطأ غير متوقع</h1>
        <p className="text-muted-foreground leading-relaxed">نأسف لهذا الخلل. واجهنا مشكلة أثناء تحميل هذه الصفحة.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-primary/40 text-foreground font-bold hover:bg-primary/10 transition"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ناس إربد · برنامج وثائقي" },
      { name: "description", content: "ناس إربد برنامج وثائقي إنساني يوثّق قصص أهل إربد ومهنهم القديمة وذاكرتهم الشفوية." },
      { property: "og:title", content: "ناس إربد · برنامج وثائقي" },
      { property: "og:description", content: "ناس إربد برنامج وثائقي إنساني يوثّق قصص أهل إربد ومهنهم القديمة وذاكرتهم الشفوية." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_JO" },
      { name: "twitter:title", content: "ناس إربد · برنامج وثائقي" },
      { name: "twitter:description", content: "ناس إربد برنامج وثائقي إنساني يوثّق قصص أهل إربد ومهنهم القديمة وذاكرتهم الشفوية." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/59aadaa2-7b38-49da-b5b8-1d67340bdd24" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/59aadaa2-7b38-49da-b5b8-1d67340bdd24" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#c98a2b" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "ناس إربد" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ناس إربد",
        url: "https://nas-irbid.lovable.app",
        inLanguage: "ar",
        description: "برنامج وثائقي إنساني يوثّق قصص أهل إربد وذاكرتهم الشفوية.",
      }),
    }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col relative z-[2]">
          <Header />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
          <Footer />
        </div>
        <Cursor />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
