import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Map as MapIcon } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

// Dynamically import the map component so it's not executed during SSR
const ClientMap = lazy(() => import("@/components/site/Map"));

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
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none px-6 py-5 md:px-10 md:py-8 bg-gradient-to-b from-background/95 via-background/70 to-transparent">
        <div className="flex items-start gap-3">
          <div
            className="mt-1 w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.42 0.16 25)", boxShadow: "0 4px 16px oklch(0.42 0.16 25 / 0.35)" }}
          >
            <MapIcon size={18} color="white" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground m-0 leading-tight">
              خريطة الحكايات
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-md m-0">
              {isLoading
                ? "جاري تحميل مواقع الحلقات..."
                : episodes.length === 0
                  ? "لا توجد حلقات مضافة بإحداثيات بعد."
                  : `${episodes.length} حلقة موثّقة على خارطة إربد — ضع مؤشر الماوس على الدبوس لاستعراضها`}
            </p>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <span className="text-sm text-muted-foreground">جاري تحميل الخريطة…</span>
          </div>
        </div>
      )}

      {/* Map — Client-only */}
      {isClient && (
        <Suspense
          fallback={
            <div className="flex-1 w-full h-full flex items-center justify-center bg-secondary/20">
              <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
            </div>
          }
        >
          <ClientMap episodes={episodes as any} />
        </Suspense>
      )}
    </div>
  );
}
