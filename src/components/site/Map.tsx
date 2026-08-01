import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Play, Navigation, MapPin } from "lucide-react";
import { useMemo } from "react";

type Episode = {
  id: string;
  slug: string;
  title: string;
  character_name: string | null;
  profession: string | null;
  neighborhood: string | null;
  decade: string | null;
  cover_image_url: string | null;
  youtube_id: string | null;
  latitude: number;
  longitude: number;
};

// Custom Icon function to prevent SSR issues
function getCustomIcon(count: number) {
  if (typeof window === "undefined") return undefined;
  
  const pinColor = "#7c1c22"; // Brand burgundy
  const isSingle = count === 1;

  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="64" viewBox="0 0 52 64">
      <filter id="shadow" x="-40%" y="-20%" width="180%" height="180%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#00000055"/>
      </filter>
      <g filter="url(#shadow)">
        <path d="M26 2C15.5 2 7 10.5 7 21c0 13.5 19 39 19 39s19-25.5 19-39c0-10.5-8.5-19-19-19Z" fill="${pinColor}" />
        <circle cx="26" cy="21" r="10" fill="white" opacity="0.95"/>
        ${isSingle ? "" : `<text x="26" y="26" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="bold" fill="${pinColor}">${count}</text>`}
      </g>
    </svg>
  `;

  return new L.DivIcon({
    className: "custom-map-pin bg-transparent border-0",
    html: `<div class="relative flex items-center justify-center hover:scale-110 transition-transform duration-300 origin-bottom" style="cursor: pointer;">
             ${pinSvg}
           </div>`,
    iconSize: [52, 64],
    iconAnchor: [26, 64],
    tooltipAnchor: [0, -56], // Anchors exactly above the pin
  });
}

export default function Map({ episodes }: { episodes: Episode[] }) {
  // Irbid City Center
  const IRBID_CENTER: [number, number] = [32.551445, 35.851479];

  // Group episodes by exact/very close coordinates (~20m) to prevent overlap
  const groupedEpisodes = useMemo(() => {
    const groups: { lat: number; lng: number; episodes: Episode[] }[] = [];
    const THRESHOLD = 0.0002;
    
    episodes.forEach((ep) => {
      const existing = groups.find(
        (g) =>
          Math.abs(g.lat - ep.latitude) < THRESHOLD &&
          Math.abs(g.lng - ep.longitude) < THRESHOLD
      );
      if (existing) {
        existing.episodes.push(ep);
      } else {
        groups.push({ lat: ep.latitude, lng: ep.longitude, episodes: [ep] });
      }
    });
    return groups;
  }, [episodes]);

  return (
    <div className="flex-1 w-full h-full min-h-[calc(100vh-80px)] relative z-0">
      <style>{`
        /* Map style overrides */
        .leaflet-tile-pane {
          filter: grayscale(0.2) sepia(0.3) contrast(1.1) brightness(1.05) hue-rotate(-10deg);
        }
        .leaflet-tooltip-custom {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        /* Hide tooltip arrow completely */
        .leaflet-tooltip-custom::before {
          display: none !important;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: rgba(196,164,107,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: rgba(196,164,107,0.4);
          border-radius: 4px;
        }
      `}</style>

      <MapContainer 
        center={IRBID_CENTER} 
        zoom={14.5} 
        zoomControl={false}
        className="w-full h-full min-h-[calc(100vh-80px)] z-0 absolute inset-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />

        {groupedEpisodes.map((group, index) => {
          const lat = group.lat;
          const lng = group.lng;
          
          return (
            <Marker 
              key={`group-${index}`} 
              position={[lat, lng]} 
              icon={getCustomIcon(group.episodes.length)!}
            >
              <Tooltip interactive={true} direction="top" offset={[0, 0]} opacity={1} className="leaflet-tooltip-custom">
                {/* 
                  Pointer Triangle pointing down to the pin
                */}
                <div className="relative flex flex-col items-center pb-[10px]">
                  <div className="absolute bottom-0 w-0 h-0" style={{
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderTop: "10px solid rgba(253,246,232,0.97)"
                  }} />
                  
                  {/* Container Box */}
                  <div 
                    className="flex flex-row gap-3 p-2 rounded-2xl shadow-2xl max-w-[85vw] md:max-w-[700px] overflow-x-auto snap-x snap-mandatory custom-scrollbar-horizontal relative z-10"
                    style={{ 
                      direction: 'rtl',
                      background: "rgba(253,246,232,0.97)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(196,164,107,0.3)"
                    }}
                  >
                    {group.episodes.map((ep, i) => {
                      const img = ep.cover_image_url ?? (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg` : null);
                      return (
                        <div key={ep.id} className="w-[270px] shrink-0 snap-start flex flex-col bg-white/40 rounded-xl p-2 border border-black/5 transition-colors">
                          <div className="w-full h-36 rounded-lg overflow-hidden relative shadow-inner mb-3 group/img bg-[#e8d8c0]">
                            {img ? (
                              <img src={img} alt={ep.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapPin size={32} color="#c4a46b" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-[#2d1a0e] shadow-sm"
                                 style={{ background: "rgba(253,246,232,0.9)", backdropFilter: "blur(8px)" }}>
                              {ep.decade || "زمان"}
                            </div>
                          </div>
                          
                          <div className="flex-1 px-2">
                            <h3 className="font-display text-lg m-0 leading-tight line-clamp-1" style={{ color: "#1a0e08", fontWeight: 700 }}>
                              {ep.title}
                            </h3>
                            <p className="text-xs mt-1 m-0 line-clamp-1" style={{ color: "#6b4c35" }}>
                              {ep.character_name} {ep.profession ? `· ${ep.profession}` : ""}
                            </p>
                            
                            {ep.neighborhood && (
                              <div className="flex items-center gap-1 mt-2">
                                <MapPin size={10} color="#7c1c22" />
                                <span className="text-[10px]" style={{ color: "#8a6550" }}>{ep.neighborhood}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 mt-3 px-1">
                            <a 
                              href={`/episodes/${ep.slug}`} 
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition shadow-md !no-underline"
                              style={{ background: "#7c1c22", color: "white" }}
                              onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.1)")}
                              onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "")}
                            >
                              <Play size={12} className="fill-current" />
                              شاهد
                            </a>
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center w-10 h-10 rounded-xl transition shadow-sm border shrink-0 !no-underline"
                              style={{ background: "rgba(196,164,107,0.15)", borderColor: "rgba(196,164,107,0.3)", color: "#2d1a0e" }}
                              onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(196,164,107,0.25)")}
                              onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(196,164,107,0.15)")}
                              title="الاتجاهات"
                            >
                              <Navigation size={14} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
