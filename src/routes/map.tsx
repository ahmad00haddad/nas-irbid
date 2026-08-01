import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Map as MapIcon, AlertCircle } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

// Dynamically import — avoids SSR issues with mapbox-gl (uses window/document)
const ClientMap = lazy(() => import("@/components/site/Map"));

// Mapbox public access token — add VITE_MAPBOX_TOKEN to your .env file
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

export const Route = createFileRoute("/map")({
  component: MapPage,
  head: () => ({
    meta: [
      { title: "خريطة الحكايات · ناس إربد" },
      { name: "description", content: "استكشف إربد وحكايات ناسها من خلال خريطة تفاعلية للمدينة." },
      { property: "og:title", content: "خريطة الحكايات · ناس إربد" },
      { property: "og:description", content: "استكشف إربد وحكايات ناسها من خلال خريطة تفاعلية للمدينة." },
      { property: "og:url", content: "https://nas-irbid.lovable.app/map" },
    ],
    links: [{ rel: "canonical", href: "https://nas-irbid.lovable.app/map" }],
  }),
});

function MapPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["map-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select(
          "id, slug, title, character_name, profession, neighborhood, decade, cover_image_url, youtube_id, latitude, longitude"
        )
        .eq("published", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full flex flex-col bg-background">

      {/* Overlay Header */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none px-6 py-5 md:px-10 md:py-7 bg-gradient-to-b from-background/95 via-background/60 to-transparent">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.42 0.16 25)", boxShadow: "0 4px 16px oklch(0.42 0.16 25 / 0.4)" }}
          >
            <MapIcon size={18} color="white" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-4xl text-foreground m-0 leading-tight">
              خريطة الحكايات
            </h1>
            {!isLoading && episodes.length > 0 && (
              <p className="text-muted-foreground mt-0.5 text-xs md:text-sm m-0">
                {episodes.length} حلقة موثّقة على أرض إربد — اضغط على الدبوس لاستعراضها
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <span className="text-sm text-muted-foreground font-medium">جاري تحميل الخريطة…</span>
          </div>
        </div>
      )}

      {/* No API Key Warning */}
      {!MAPBOX_TOKEN && isClient && !isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm p-6">
          <div className="text-center max-w-sm w-full px-8 py-8 bg-card rounded-2xl border border-border shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <AlertCircle size={26} className="text-primary" />
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">يلزمك مفتاح Mapbox</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              أضف متغير البيئة التالي إلى إعدادات مشروعك في Lovable:
            </p>
            <code className="block bg-secondary text-foreground/90 rounded-xl px-4 py-3 text-xs text-left ltr break-all shadow-inner">
              VITE_MAPBOX_TOKEN=pk.eyJ1...
            </code>
            <a
              href="https://account.mapbox.com/auth/signup/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold no-underline hover:opacity-90 transition"
              style={{ color: "white" }}
            >
              احصل على مفتاح مجاني
            </a>
          </div>
        </div>
      )}

      {/* Map */}
      {isClient && MAPBOX_TOKEN && (
        <Suspense
          fallback={
            <div className="flex-1 w-full h-full flex items-center justify-center bg-secondary/20">
              <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
            </div>
          }
        >
          <ClientMap episodes={episodes as any} accessToken={MAPBOX_TOKEN} />
        </Suspense>
      )}
    </div>
  );
}
