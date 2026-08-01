import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Play, Navigation, X, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { createRoot } from "react-dom/client";

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

interface MapboxMapProps {
  episodes: Episode[];
  accessToken: string;
}

// Cluster nearby coordinates within ~50 meters
function groupNearby(episodes: Episode[]): Group[] {
  const groups: Group[] = [];
  const THRESHOLD = 0.0004;
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

// Episode Card Component
function EpisodeCard({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const ep = group.episodes[idx];
  const hasMultiple = group.episodes.length > 1;

  const img =
    ep.cover_image_url ??
    (ep.youtube_id
      ? `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg`
      : null);

  return (
    <div
      className="episode-card"
      style={{
        width: 290,
        background: "rgba(253,246,232,0.97)",
        backdropFilter: "blur(20px)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid rgba(196,164,107,0.25)",
        direction: "rtl",
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", width: "100%", height: 160, overflow: "hidden", background: "#e8d8c0" }}>
        {img ? (
          <img
            src={img}
            alt={ep.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={32} color="#c4a46b" />
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 8, left: 8,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(253,246,232,0.85)", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <X size={13} color="#2d1a0e" />
        </button>

        {/* Decade badge */}
        {ep.decade && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(253,246,232,0.9)", backdropFilter: "blur(8px)",
            padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
            color: "#2d1a0e", boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
          }}>
            {ep.decade}
          </div>
        )}

        {/* Nav arrows for multiple episodes */}
        {hasMultiple && (
          <>
            <button
              onClick={() => setIdx((i) => (i > 0 ? i - 1 : group.episodes.length - 1))}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                width: 28, height: 28, borderRadius: "50%", border: "none",
                background: "rgba(253,246,232,0.85)", backdropFilter: "blur(8px)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            >
              <ChevronRight size={14} color="#2d1a0e" />
            </button>
            <button
              onClick={() => setIdx((i) => (i < group.episodes.length - 1 ? i + 1 : 0))}
              style={{
                position: "absolute", left: 40, top: "50%", transform: "translateY(-50%)",
                width: 28, height: 28, borderRadius: "50%", border: "none",
                background: "rgba(253,246,232,0.85)", backdropFilter: "blur(8px)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            >
              <ChevronLeft size={14} color="#2d1a0e" />
            </button>

            {/* Dots */}
            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
              {group.episodes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  style={{
                    border: "none", cursor: "pointer", padding: 0,
                    borderRadius: 99,
                    width: i === idx ? 18 : 6, height: 6,
                    background: i === idx ? "#7c1c22" : "rgba(255,255,255,0.7)",
                    transition: "all 0.25s ease",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px" }}>
        {hasMultiple && (
          <div style={{
            marginBottom: 8, fontSize: 10, fontWeight: 600,
            color: "#7c1c22", background: "rgba(124,28,34,0.08)",
            display: "inline-block", padding: "2px 8px", borderRadius: 99
          }}>
            {group.episodes.length} حلقات في هذا الموقع
          </div>
        )}

        <h3 style={{ margin: 0, fontSize: 18, fontFamily: "'Amiri', serif", fontWeight: 700, color: "#1a0e08", lineHeight: 1.3 }}>
          {ep.title}
        </h3>

        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#6b4c35", lineHeight: 1.5 }}>
          {ep.character_name}
          {ep.profession ? ` · ${ep.profession}` : ""}
        </p>

        {ep.neighborhood && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            <MapPin size={10} color="#7c1c22" />
            <span style={{ fontSize: 10, color: "#8a6550" }}>{ep.neighborhood}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <a
            href={`/episodes/${ep.slug}`}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 6, padding: "10px 14px", borderRadius: 12, textDecoration: "none",
              background: "#7c1c22", color: "white", fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 14px rgba(124,28,34,0.35)",
            }}
          >
            <Play size={13} fill="white" color="white" />
            شاهد الحلقة
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${group.lat},${group.lng}`}
            target="_blank"
            rel="noreferrer"
            style={{
              width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 12, textDecoration: "none",
              background: "rgba(196,164,107,0.15)", border: "1px solid rgba(196,164,107,0.3)",
              color: "#2d1a0e", flexShrink: 0,
            }}
            title="خذني للمكان"
          >
            <Navigation size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function MapboxMap({ episodes, accessToken }: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const popupRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const [, forceUpdate] = useState(0);

  const closeCard = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [35.851479, 32.551445],
      zoom: 14.5,
      language: "ar",
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    // Close popup on map click
    map.on("click", () => closeCard());

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken, closeCard]);

  // Add markers when episodes change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const groups = groupNearby(episodes);

      groups.forEach((group) => {
        const count = group.episodes.length;

        // Custom pin element
        const el = document.createElement("div");
        el.style.cursor = "pointer";
        el.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58" style="overflow:visible">
            <filter id="dp" x="-50%" y="-20%" width="200%" height="200%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#00000040"/>
            </filter>
            <g filter="url(#dp)">
              <path d="M24 2C13.5 2 5 10.5 5 21c0 14 19 36 19 36s19-22 19-36c0-10.5-8.5-19-19-19Z" fill="#7c1c22"/>
              <circle cx="24" cy="21" r="11" fill="white" opacity="0.95"/>
              ${count > 1
                ? `<text x="24" y="26" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="800" fill="#7c1c22">${count}</text>`
                : `<circle cx="24" cy="21" r="5" fill="#7c1c22" opacity="0.8"/>`
              }
            </g>
          </svg>
        `;

        // Hover scale effect
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.15)";
          el.style.transition = "transform 0.2s ease";
          el.style.zIndex = "10";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([group.lng, group.lat])
          .addTo(map);

        el.addEventListener("click", (e) => {
          e.stopPropagation();

          // Remove existing popup
          if (popupRef.current) popupRef.current.remove();

          // Create popup container
          const container = document.createElement("div");

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, -52],
            maxWidth: "none",
            className: "mapbox-episode-popup",
          })
            .setLngLat([group.lng, group.lat])
            .setDOMContent(container)
            .addTo(map);

          // Render React card into container
          if (popupRootRef.current) {
            popupRootRef.current.unmount();
          }
          popupRootRef.current = createRoot(container);
          popupRootRef.current.render(
            <EpisodeCard group={group} onClose={() => popup.remove()} />
          );

          popupRef.current = popup;
        });

        markersRef.current.push(marker);
      });
    };

    if (mapRef.current?.loaded()) {
      addMarkers();
    } else {
      mapRef.current?.on("load", addMarkers);
    }
  }, [episodes]);

  return (
    <>
      <style>{`
        .mapbox-episode-popup .mapboxgl-popup-content {
          padding: 0 !important;
          background: transparent !important;
          border-radius: 20px !important;
          box-shadow: none !important;
        }
        .mapbox-episode-popup .mapboxgl-popup-tip {
          display: none !important;
        }
        .mapboxgl-ctrl-group {
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
          border: 1px solid rgba(196,164,107,0.2) !important;
        }
        .mapboxgl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", minHeight: "calc(100vh - 80px)" }}
      />
    </>
  );
}
