import { useEffect, useRef, useState } from "react";
import { Play, Navigation, X, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

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

type Group = {
  lat: number;
  lng: number;
  episodes: Episode[];
};

interface GoogleMapProps {
  episodes: Episode[];
  apiKey: string;
}

// Cluster nearby coordinates within ~30 meters
function groupNearby(episodes: Episode[]): Group[] {
  const groups: Group[] = [];
  const THRESHOLD = 0.0003; // ~30m in degrees

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
}

// Inject Google Maps script only once
let scriptLoaded = false;
let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=ar&region=JO`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export default function GoogleMap({ episodes, apiKey }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [activeEpIndex, setActiveEpIndex] = useState(0);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps(apiKey).then(() => setMapsLoaded(true)).catch(console.error);
  }, [apiKey]);

  // Init map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 32.551445, lng: 35.851479 },
      zoom: 15,
      mapTypeId: "roadmap",
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
      styles: [
        { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#2d1a0e" }] },
        { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#f5ead4" }, { lightness: 13 }] },
        { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#f5ead4" }] },
        { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c4a46b" }, { weight: 1.2 }] },
        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5ead4" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8d5b0" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8d9a8" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d4b896" }, { weight: 0.5 }] },
        { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#f7e8c0" }] },
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c9a55a" }, { weight: 1 }] },
        { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#e2cfa0" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#b8d1e0" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e7fa0" }] },
      ],
    });

    mapInstanceRef.current = map;

    // Close card on map click
    map.addListener("click", () => setActiveGroup(null));
  }, [mapsLoaded]);

  // Add markers when map is ready & episodes change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapsLoaded || episodes.length === 0) return;

    const groups = groupNearby(episodes);

    // Clear existing overlays by simply re-rendering markers
    groups.forEach((group) => {
      const isSingle = group.episodes.length === 1;

      // Custom SVG pin
      const pinColor = "#7c1c22"; // Brand burgundy
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="64" viewBox="0 0 52 64">
          <filter id="shadow" x="-40%" y="-20%" width="180%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#00000055"/>
          </filter>
          <g filter="url(#shadow)">
            <path d="M26 2C15.5 2 7 10.5 7 21c0 13.5 19 39 19 39s19-25.5 19-39c0-10.5-8.5-19-19-19Z" 
                  fill="${pinColor}" />
            <circle cx="26" cy="21" r="10" fill="white" opacity="0.95"/>
            ${isSingle ? "" : `<text x="26" y="26" text-anchor="middle" font-family="IBM Plex Sans Arabic" font-size="11" font-weight="bold" fill="${pinColor}">${group.episodes.length}</text>`}
          </g>
        </svg>
      `;

      const marker = new google.maps.Marker({
        position: { lat: group.lat, lng: group.lng },
        map,
        icon: {
          url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
          scaledSize: new google.maps.Size(52, 64),
          anchor: new google.maps.Point(26, 62),
        },
        title: group.episodes.map((e) => e.title).join(", "),
        optimized: false,
      });

      marker.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.domEvent) return;
        const domEv = e.domEvent as MouseEvent;
        const mapEl = mapRef.current;
        if (!mapEl) return;
        const rect = mapEl.getBoundingClientRect();
        setCardPos({ x: domEv.clientX - rect.left, y: domEv.clientY - rect.top });
        setActiveGroup(group);
        setActiveEpIndex(0);
      });
    });
  }, [mapsLoaded, episodes]);

  const activeEp = activeGroup?.episodes[activeEpIndex];
  const hasMultiple = (activeGroup?.episodes.length ?? 0) > 1;

  const getImg = (ep: Episode) =>
    ep.cover_image_url ?? (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg` : null);

  return (
    <div ref={mapRef} className="w-full h-full min-h-[calc(100vh-80px)] relative" id="google-map">
      {/* Episode Card — absolutely positioned inside the map container */}
      {activeGroup && activeEp && (() => {
        const cardW = 300;
        const cardH = 360;
        const mapEl = mapRef.current;
        const mapW = mapEl?.offsetWidth ?? 0;
        const mapH = mapEl?.offsetHeight ?? 0;

        // Smart positioning — keeps card on screen
        let left = cardPos.x - cardW / 2;
        let top = cardPos.y - cardH - 28; // above pin

        if (left < 12) left = 12;
        if (left + cardW > mapW - 12) left = mapW - cardW - 12;
        if (top < 12) top = cardPos.y + 72; // flip below pin if no space above

        return (
          <div
            className="absolute z-[9999] pointer-events-auto"
            style={{ left, top }}
          >
            {/* Triangle pointer — only shown when above pin */}
            {top < cardPos.y && (
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0"
                style={{
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "10px solid rgba(253,246,232,0.98)",
                }}
              />
            )}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                width: cardW,
                background: "rgba(253,246,232,0.98)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(196,164,107,0.3)",
              }}
            >
              {/* Thumbnail */}
              <div className="relative w-full h-40 overflow-hidden bg-secondary">
                {getImg(activeEp) && (
                  <img
                    src={getImg(activeEp)!}
                    alt={activeEp.title}
                    className="w-full h-full object-cover"
                    style={{ transition: "transform 0.4s ease" }}
                    onMouseOver={(e) => ((e.target as HTMLImageElement).style.transform = "scale(1.04)")}
                    onMouseOut={(e) => ((e.target as HTMLImageElement).style.transform = "scale(1)")}
                  />
                )}
                {/* Nav for multiple episodes */}
                {hasMultiple && (
                  <>
                    <button
                      onClick={() => setActiveEpIndex((i) => (i > 0 ? i - 1 : activeGroup!.episodes.length - 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition shadow"
                    >
                      <ChevronRight size={14} className="text-foreground" />
                    </button>
                    <button
                      onClick={() => setActiveEpIndex((i) => (i < activeGroup!.episodes.length - 1 ? i + 1 : 0))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition shadow"
                    >
                      <ChevronLeft size={14} className="text-foreground" />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {activeGroup!.episodes.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveEpIndex(idx)}
                          className="rounded-full transition-all"
                          style={{
                            width: idx === activeEpIndex ? 16 : 6,
                            height: 6,
                            background: idx === activeEpIndex ? "#7c1c22" : "rgba(255,255,255,0.7)",
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
                {/* Badge */}
                {activeEp.decade && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-foreground shadow-sm"
                    style={{ background: "rgba(253,246,232,0.9)", backdropFilter: "blur(8px)" }}>
                    {activeEp.decade}
                  </div>
                )}
                {/* Close button */}
                <button
                  onClick={() => setActiveGroup(null)}
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition"
                >
                  <X size={12} className="text-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 pt-3" style={{ direction: "rtl" }}>
                <h3 className="font-display text-lg text-foreground m-0 leading-tight">
                  {activeEp.title}
                </h3>
                <p className="text-[11px] mt-1 m-0" style={{ color: "oklch(0.38 0.06 25)" }}>
                  {activeEp.character_name}
                  {activeEp.profession ? ` · ${activeEp.profession}` : ""}
                </p>
                {activeEp.neighborhood && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin size={10} style={{ color: "#7c1c22" }} />
                    <span className="text-[10px]" style={{ color: "oklch(0.38 0.06 25)" }}>{activeEp.neighborhood}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <a
                    href={`/episodes/${activeEp.slug}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: "oklch(0.42 0.16 25)",
                      color: "white",
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.1)")}
                    onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "")}
                  >
                    <Play size={12} fill="white" />
                    شاهد الحلقة
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeGroup.lat},${activeGroup.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                    style={{
                      background: "oklch(0.86 0.06 88)",
                      border: "1px solid oklch(0.78 0.06 88)",
                      color: "oklch(0.20 0.04 25)",
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "oklch(0.82 0.06 88)")}
                    onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "oklch(0.86 0.06 88)")}
                    title="خذني للمكان"
                  >
                    <Navigation size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
