import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Play, Navigation } from "lucide-react";

// Custom Icon for Map Pins (Vintage Ink Style)
const customIcon = new L.DivIcon({
  className: "custom-map-pin",
  html: `<div class="relative flex items-center justify-center w-8 h-8">
           <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
           <div class="relative z-10 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-glow"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export default function Map({ episodes }: { episodes: any[] }) {
  // Irbid City Center Coordinates
  const IRBID_CENTER: [number, number] = [32.551445, 35.851479];

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

        {episodes.map((ep) => {
          const img = ep.cover_image_url ?? (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/mqdefault.jpg` : null);
          return (
            <Marker 
              key={ep.id} 
              position={[ep.latitude!, ep.longitude!]} 
              icon={customIcon}
            >
              <Popup className="vintage-popup" closeButton={false}>
                <div className="flex flex-col gap-3 p-1 min-w-[200px]">
                  <div className="w-full h-28 rounded-xl overflow-hidden relative shadow-sm border border-border/50">
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
                  <div className="flex gap-2 mt-1">
                    <a 
                      href={`/episodes/${ep.slug}`} 
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition shadow-glow no-underline"
                    >
                      <Play size={12} />
                      شاهد الحلقة
                    </a>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${ep.latitude},${ep.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition shadow-sm border border-border/50"
                      title="خذني للمكان"
                    >
                      <Navigation size={14} />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
