import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-gradient-gold">٤٠٤</h1>
        <h2 className="mt-4 font-display text-2xl text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          يبدو أن هذه الحكاية لم تُروَ بعد.
        </p>
        <Link to="/" className="mt-6 inline-flex px-5 py-2.5 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold">
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm text-muted-foreground">يمكنك المحاولة مرة أخرى.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex px-5 py-2.5 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold"
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
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9a1c4ffb-1dff-4c24-9e33-3d8a39ccbafb/id-preview-d3e1e81a--50ee44a8-d79f-4bc1-8e87-330d85d85aef.lovable.app-1779399802002.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9a1c4ffb-1dff-4c24-9e33-3d8a39ccbafb/id-preview-d3e1e81a--50ee44a8-d79f-4bc1-8e87-330d85d85aef.lovable.app-1779399802002.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col relative z-[2]">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
