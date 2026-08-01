import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Play, Navigation, MapPin } from "lucide-react";
import { useMemo } from "react";

// Custom Icon for Map Pins (Olive Green - Well-known location pin)
let customIcon: L.DivIcon | undefined;

function getCustomIcon() {
  if (typeof window === "undefined") return undefined;
  if (!customIcon) {
    const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="#556b2f" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.4));">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none" />
    </svg>`;

    customIcon = new L.DivIcon({
      className: "custom-map-pin bg-transparent border-0",
      html: `<div class="relative flex items-center justify-center hover:-translate-y-1 transition-transform duration-200">
               ${pinSvg}
             </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -40],
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
    <div className="flex-1 w-full h-full relative" style={{ filter: "sepia(0.6) contrast(1.1) brightness(0.95)" }}>
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
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openPopup();
                }
              }}
            >
              <Popup className="vintage-popup" closeButton={false}>
                <div className="flex flex-col gap-5 p-1 max-h-[350px] overflow-y-auto px-2 -mx-2 custom-scrollbar">
                  {group.map((ep, i) => {
                    const img = ep.cover_image_url ?? (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/mqdefault.jpg` : null);
                    return (
                      <div key={ep.id} className={i !== 0 ? "pt-4 border-t border-border/50" : ""}>
                        <div className="w-full h-28 rounded-xl overflow-hidden relative shadow-sm border border-border/50 mb-3">
                          {img ? (
                            <img src={img} alt={ep.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center" />
                          )}
                          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-foreground">
                            {ep.decade || "زمان"}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-display text-base text-foreground m-0 leading-tight">
                            {ep.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 m-0">
                            {ep.character_name} {ep.profession ? `· ${ep.profession}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <a 
                            href={`/episodes/${ep.slug}`} 
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition shadow-glow no-underline"
                          >
                            <Play size={12} />
                            شاهد الحلقة
                          </a>
                          {i === 0 && (
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition shadow-sm border border-border/50 shrink-0"
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
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
