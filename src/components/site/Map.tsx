import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Play, Navigation, MapPin } from "lucide-react";
import { useMemo } from "react";

// Custom Icon for Map Pins (Premium Red Location Pin)
let customIcon: L.DivIcon | undefined;

function getCustomIcon() {
  if (typeof window === "undefined") return undefined;
  if (!customIcon) {
    const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 6px 8px rgba(0,0,0,0.5));">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none" />
    </svg>`;

    customIcon = new L.DivIcon({
      className: "custom-map-pin bg-transparent border-0 text-primary",
      html: `<div class="relative flex items-center justify-center hover:scale-110 transition-transform duration-300 origin-bottom">
               ${pinSvg}
             </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      tooltipAnchor: [0, -44], // Anchors exactly at the top center of the pin
      popupAnchor: [0, -44],
    });
  }
  return customIcon;
}

export default function Map({ episodes }: { episodes: any[] }) {
  // Irbid City Center Coordinates
  const IRBID_CENTER: [number, number] = [32.551445, 35.851479];

  // Group episodes by exact coordinates to prevent overlap
  const groupedEpisodes = useMemo(() => {
    const groups: Record<string, typeof episodes> = {};
    episodes.forEach((ep) => {
      if (ep.latitude == null || ep.longitude == null) return;
      const key = `${ep.latitude.toFixed(6)},${ep.longitude.toFixed(6)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ep);
    });
    return Object.values(groups);
  }, [episodes]);

  return (
    <div className="flex-1 w-full h-full relative">
      <style>{`
        .leaflet-tile-pane {
          filter: sepia(0.6) contrast(1.1) brightness(0.95);
        }
      `}</style>
      <MapContainer 
        center={IRBID_CENTER} 
        zoom={14} 
        zoomControl={false}
        className="w-full h-full min-h-[calc(100vh-80px)] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />

        {groupedEpisodes.map((group, index) => {
          const lat = group[0].latitude!;
          const lng = group[0].longitude!;
          
          return (
            <Marker 
              key={`group-${index}`} 
              position={[lat, lng]} 
              icon={getCustomIcon()!}
              // No eventHandlers needed, Tooltip automatically shows on hover and hides on mouseout
            >
              <Tooltip interactive={true} direction="top" offset={[0, -5]} opacity={1} className="bg-transparent border-0 shadow-none !p-0 leaflet-tooltip-custom">
                <div 
                  className="flex flex-row gap-3 p-2 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border max-w-[85vw] md:max-w-[700px] overflow-x-auto snap-x snap-mandatory"
                  style={{ direction: 'rtl' }}
                >
                  {group.map((ep, i) => {
                    const img = ep.cover_image_url ?? (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/mqdefault.jpg` : null);
                    return (
                      <div key={ep.id} className="w-[260px] shrink-0 snap-start flex flex-col bg-card/40 rounded-xl p-2 border border-border/40 hover:bg-card/80 transition-colors">
                        <div className="w-full h-32 rounded-lg overflow-hidden relative shadow-inner mb-3 group/img">
                          {img ? (
                            <img src={img} alt={ep.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center" />
                          )}
                          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-foreground shadow-sm">
                            {ep.decade || "زمان"}
                          </div>
                        </div>
                        <div className="flex-1 px-1">
                          <h3 className="font-display text-base text-foreground m-0 leading-tight line-clamp-1">
                            {ep.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-1 m-0 line-clamp-1">
                            {ep.character_name} {ep.profession ? `· ${ep.profession}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3 px-1">
                          <a 
                            href={`/episodes/${ep.slug}`} 
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary text-primary-foreground !text-white text-xs font-bold hover:brightness-110 transition shadow-md !no-underline"
                          >
                            <Play size={12} className="fill-current" />
                            شاهد
                          </a>
                          {i === 0 && (
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-foreground !text-foreground hover:bg-secondary/80 transition shadow-sm border border-border/50 shrink-0 !no-underline"
                              title="خذني للمكان"
                            >
                              <Navigation size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
