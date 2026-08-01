import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
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
        .select("id, slug, title, character_name, profession, neighborhood, decade, cover_image_url, youtube_id, latitude, longitude")
        .eq("published", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full flex flex-col bg-background">
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none p-6 md:p-10 bg-gradient-to-b from-background via-background/80 to-transparent">
        <h1 className="font-display text-4xl md:text-5xl text-foreground drop-shadow-sm">
          خريطة <span className="text-gradient-gold">الحكايات</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm md:text-base">
          تجوّل في حارات إربد القديمة، واكتشف قصص أهلها في أماكن حدوثها الحقيقية.
        </p>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      )}

      {/* Map Container - Render only on client to avoid SSR Leaflet issues */}
      {isClient && (
        <Suspense fallback={
          <div className="flex-1 w-full h-full flex items-center justify-center bg-secondary/20">
            <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
          </div>
        }>
          <ClientMap episodes={episodes} />
        </Suspense>
      )}
    </div>
  );
}
