import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Play, Navigation, MapPin, LocateFixed, Maximize, Minimize, Hand, X, Route, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

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

const PIN_COLOR = "#7c1c22";
const PIN_COLOR_MULTI = "#5a1018";

// ── Clustering: merge pins within a zoom-dependent radius ──────────────────────
function clusterEpisodes(
  episodes: Episode[],
  zoom: number
): { lat: number; lng: number; episodes: Episode[] }[] {
  // Threshold shrinks as you zoom in (more granular at high zoom)
  const threshold = zoom >= 16 ? 0.0001 : zoom >= 14 ? 0.0003 : zoom >= 12 ? 0.001 : 0.005;
  const groups: { lat: number; lng: number; episodes: Episode[] }[] = [];

  episodes.forEach((ep) => {
    const existing = groups.find(
      (g) =>
        Math.abs(g.lat - ep.latitude) < threshold &&
        Math.abs(g.lng - ep.longitude) < threshold
    );
    if (existing) existing.episodes.push(ep);
    else groups.push({ lat: ep.latitude, lng: ep.longitude, episodes: [ep] });
  });
  return groups;
}

// ── Per-zoom, per-count icon cache ────────────────────────────────────────────
const iconCache = new globalThis.Map<string, L.DivIcon>();

function getThumbnailPin(ep: Episode, isPulse: boolean, isNewest: boolean = false): L.DivIcon {
  const img =
    ep.cover_image_url ??
    (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg` : null);
  const cacheKey = `thumb-${ep.id}-${isPulse}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey)!;

  const pulseRing = isPulse
    ? `<div class="nas-pin-pulse"></div>`
    : "";

  const inner = img
    ? `<img src="${img}" alt="${ep.title}" class="nas-thumb-img" />`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

  const html = `
    <div class="nas-thumb-pin" style="border-color:${PIN_COLOR}">
      ${pulseRing}
      <div class="nas-thumb-inner">${inner}</div>
      <div class="nas-thumb-tail" style="background:${PIN_COLOR}"></div>
    </div>
  `;

  const icon = new L.DivIcon({
    className: "custom-map-pin bg-transparent border-0",
    html,
    iconSize: [52, 62],
    iconAnchor: [26, 62],
    popupAnchor: [0, -64],
    tooltipAnchor: [0, -66],
  });

  iconCache.set(cacheKey, icon);
  return icon;
}

function getClusterIcon(count: number, isPulse: boolean = false): L.DivIcon {
  const cacheKey = `cluster-${count}-${isPulse}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey)!;

  const pulseRing = isPulse ? `<div class="nas-pin-pulse"></div>` : "";

  const html = `
    <div class="nas-cluster-pin" style="background:${PIN_COLOR_MULTI}">
      ${pulseRing}
      <span class="nas-cluster-count">${count}</span>
      <div class="nas-thumb-tail" style="background:${PIN_COLOR_MULTI}"></div>
    </div>
  `;

  const icon = new L.DivIcon({
    className: "custom-map-pin bg-transparent border-0",
    html,
    iconSize: [52, 62],
    iconAnchor: [26, 62],
    popupAnchor: [0, -64],
    tooltipAnchor: [0, -66],
  });

  iconCache.set(cacheKey, icon);
  return icon;
}

// ── Track zoom level for dynamic clustering ───────────────────────────────────
function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({
    zoomend: (e) => onZoom(e.target.getZoom()),
  });
  return null;
}

// ── Fit map to all markers ONCE on first load only ──────────────────────────
function FitToMarkers({ episodes }: { episodes: Episode[] }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current || episodes.length === 0) return;
    hasFit.current = true;
    if (episodes.length === 1) {
      map.setView([episodes[0].latitude, episodes[0].longitude], 16, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(episodes.map((ep) => [ep.latitude, ep.longitude]));
    map.fitBounds(bounds, { padding: [90, 90], maxZoom: 16, animate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, episodes.length]);

  return null;
}

// ── Episode card inside popup / bottom sheet ──────────────────────────────────
function EpisodeCard({ ep, lat, lng, userPos }: { ep: Episode; lat: number; lng: number; userPos: [number, number] | null }) {
  const img =
    ep.cover_image_url ??
    (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg` : null);

  const distanceKm = userPos
    ? (() => {
        const R = 6371;
        const dLat = ((lat - userPos[0]) * Math.PI) / 180;
        const dLng = ((lng - userPos[1]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((userPos[0] * Math.PI) / 180) *
            Math.cos((lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      })()
    : null;

  return (
    <div
      className="group/card w-[248px] sm:w-[270px] shrink-0 snap-start flex flex-col rounded-xl p-2 border"
      style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(0,0,0,0.07)" }}
    >
      {/* Thumbnail */}
      <div className="w-full aspect-video rounded-lg overflow-hidden relative mb-3 bg-[#e8d8c0] shrink-0 shadow-sm border border-[rgba(0,0,0,0.05)]">
        {img ? (
          <img
            src={img}
            alt={`صورة ${ep.title}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-[center_20%] transition-transform duration-500 group-hover/card:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin size={32} color="#c4a46b" />
          </div>
        )}

        {ep.decade && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md shadow-sm"
            style={{ background: "rgba(253,246,232,0.92)", color: "#2d1a0e" }}
          >
            {ep.decade}
          </div>
        )}

        {ep.youtube_id && !ep.cover_image_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center opacity-80"
              style={{ background: PIN_COLOR }}
            >
              <Play size={16} fill="white" color="white" />
            </div>
          </div>
        )}

        {/* Distance badge */}
        {distanceKm !== null && (
          <div
            className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm"
            style={{ background: "rgba(20,20,20,0.7)", color: "white" }}
          >
            {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} م` : `${distanceKm.toFixed(1)} كم`}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 px-1 min-w-0 flex flex-col justify-center">
        <h3
          className="font-display text-lg m-0 leading-tight line-clamp-2"
          style={{ color: "#1a0e08", fontWeight: 700 }}
        >
          {ep.title}
        </h3>
        {(ep.character_name || ep.profession) && (
          <p className="text-[12px] mt-1 m-0 line-clamp-1" style={{ color: "#6b4c35" }}>
            {ep.character_name}
            {ep.profession ? ` · ${ep.profession}` : ""}
          </p>
        )}
        {ep.neighborhood && (
          <div className="flex items-center gap-1 mt-2 bg-black/5 self-start px-2 py-0.5 rounded-full">
            <MapPin size={10} color={PIN_COLOR} />
            <span className="text-[10px] line-clamp-1 font-bold" style={{ color: "#8a6550" }}>
              {ep.neighborhood}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 px-1 shrink-0">
        <a
          href={`/episodes/${ep.slug}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-bold shadow-md !no-underline transition-all hover:brightness-110 active:scale-95"
          style={{ background: PIN_COLOR, color: "#fff" }}
        >
          <Play size={14} className="fill-current shrink-0" />
          شاهد الحلقة
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          aria-label="الاتجاهات على خرائط جوجل"
          title="الاتجاهات"
          className="flex flex-col items-center justify-center w-[60px] h-[40px] rounded-xl border shrink-0 !no-underline transition-all hover:brightness-95 active:scale-95 bg-white"
          style={{
            borderColor: "rgba(196,164,107,0.35)",
            color: "#4285F4",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}
        >
          <Navigation size={14} className="fill-current mb-0.5" />
          <span className="text-[9px] font-bold text-slate-600 leading-none">المسار</span>
        </a>
      </div>
    </div>
  );
}

// ── Bottom Sheet (mobile) ─────────────────────────────────────────────────────
function BottomSheet({
  group,
  userPos,
  onClose,
}: {
  group: { lat: number; lng: number; episodes: Episode[] } | null;
  userPos: [number, number] | null;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (group) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [group]);

  if (!group) return null;

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[1100] md:hidden transition-transform duration-300 ease-out"
      style={{ transform: visible ? "translateY(0)" : "translateY(110%)" }}
    >
      <div
        className="rounded-t-2xl shadow-2xl border-t border-x overflow-hidden"
        style={{ background: "rgba(253,246,232,0.99)", borderColor: "rgba(196,164,107,0.4)" }}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-black/15 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <div />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/8 hover:bg-black/15 transition"
          >
            <X size={14} color="#6b4c35" />
          </button>
        </div>

        {group.episodes.length > 1 && (
          <div className="px-4 pb-1">
            <span className="text-[11px] font-bold" style={{ color: PIN_COLOR }}>
              {group.episodes.length} حلقات في هذا الموقع — مرّر للاستكشاف
            </span>
          </div>
        )}

        {/* Horizontal episode scroll */}
        <div
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 px-4 nas-scroll-x"
          dir="rtl"
        >
          {group.episodes.map((ep) => (
            <EpisodeCard key={ep.id} ep={ep} lat={group.lat} lng={group.lng} userPos={userPos} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MapInteractionWatcher({ onInteract }: { onInteract: () => void }) {
  useMapEvents({
    mousedown: onInteract,
    touchstart: onInteract,
    wheel: onInteract,
    keydown: onInteract,
  });
  return null;
}

// ── Main Map component ────────────────────────────────────────────────────────
export default function Map({ episodes }: { episodes: Episode[] }) {
  const IRBID_CENTER: [number, number] = [32.551445, 35.851479];
  const [mapObj, setMapObj] = useState<L.Map | null>(null);
  const [zoom, setZoom] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [activeGroup, setActiveGroup] = useState<{ lat: number; lng: number; episodes: Episode[] } | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // ── Trail / filter state ────────────────────────────────────────────────────
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [showTrailPanel, setShowTrailPanel] = useState(false);

  // Unique decades present in mapped episodes, sorted
  const decades = useMemo(() => {
    const d = new Set(episodes.map((e) => e.decade).filter(Boolean) as string[]);
    return Array.from(d).sort();
  }, [episodes]);

  // Episodes filtered by selected decade
  const filteredEpisodes = useMemo(() => {
    if (!selectedDecade) return episodes;
    return episodes.filter((e) => e.decade === selectedDecade);
  }, [episodes, selectedDecade]);

  // Trail episodes ordered by episode_number for polyline + tour
  const trailEpisodes = useMemo(() => {
    if (!selectedDecade) return [];
    return filteredEpisodes
      .slice()
      .sort((a, b) => ((a as any).episode_number ?? 999) - ((b as any).episode_number ?? 999));
  }, [filteredEpisodes, selectedDecade]);

  // Polyline coords
  const trailPolyline = useMemo((): [number, number][] =>
    trailEpisodes.map((ep) => [ep.latitude, ep.longitude])
  , [trailEpisodes]);

  // Auto-tour: fly to each episode in sequence
  useEffect(() => {
    if (tourIndex === null || !mapObj || trailEpisodes.length === 0) return;
    const ep = trailEpisodes[tourIndex];
    if (!ep) return;
    mapObj.flyTo([ep.latitude, ep.longitude], 17, { animate: true, duration: 1.4 });
  }, [tourIndex, mapObj, trailEpisodes]);

  const startTour = () => { if (trailEpisodes.length > 0) setTourIndex(0); };
  const nextTourStop = () => setTourIndex((i) => (i !== null ? Math.min(i + 1, trailEpisodes.length - 1) : 0));
  const prevTourStop = () => setTourIndex((i) => (i !== null ? Math.max(i - 1, 0) : 0));
  const endTour = () => setTourIndex(null);
  const clearTrail = () => { setSelectedDecade(null); setTourIndex(null); };


  // Newest episode id (for pulse animation)
  const newestId = useMemo(() => episodes[0]?.id ?? null, [episodes]);

  // Dynamic clustering based on FILTERED episodes
  const groupedEpisodes = useMemo(() => clusterEpisodes(filteredEpisodes, zoom), [filteredEpisodes, zoom]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Geolocate user
  const locateUser = useCallback(() => {
    if (!mapObj) return;
    setLocating(true);
    mapObj.locate({ setView: true, maxZoom: 16 });
    mapObj.once("locationfound", (e) => {
      setUserPos([e.latlng.lat, e.latlng.lng]);
      setLocating(false);
    });
    mapObj.once("locationerror", () => setLocating(false));
  }, [mapObj]);

  // User position marker icon
  const userIcon = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return new L.DivIcon({
      className: "bg-transparent border-0",
      html: `<div style="width:14px;height:14px;border-radius:50%;background:#4285F4;border:2px solid white;box-shadow:0 0 0 4px rgba(66,133,244,0.25)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full min-h-[calc(100vh-80px)] relative z-0"
    >
      {/* ── preconnect for tile server (perf) ── */}
      <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://b.basemaps.cartocdn.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://c.basemaps.cartocdn.com" crossOrigin="anonymous" />

      {/* ── noscript / SEO text list ── */}
      <noscript>
        <div dir="rtl" style={{ padding: "1rem", fontFamily: "sans-serif" }}>
          <h2>مواقع حلقات ناس إربد</h2>
          <ul>
            {episodes.map((ep) => (
              <li key={ep.id}>
                <a href={`/episodes/${ep.slug}`}>{ep.title}</a>
                {ep.neighborhood ? ` — ${ep.neighborhood}` : ""}
                {ep.character_name ? ` (${ep.character_name})` : ""}
              </li>
            ))}
          </ul>
        </div>
      </noscript>

      <style>{`
        /* ── Tile vintage grade ── */
        .leaflet-tile-pane {
          filter: grayscale(0.15) sepia(0.28) contrast(1.08) brightness(1.06) hue-rotate(-8deg);
        }

        /* ── Thumbnail pin ── */
        .nas-thumb-pin {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50% 50% 50% 4px;
          border: 3px solid ${PIN_COLOR};
          overflow: hidden;
          background: #fdf6e8;
          box-shadow: 0 6px 20px rgba(0,0,0,0.32);
          cursor: pointer;
          transform-origin: bottom center;
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
          will-change: transform;
        }
        .custom-map-pin:hover .nas-thumb-pin { transform: scale(1.18) translateY(-3px); }
        .nas-thumb-inner { width: 100%; height: 100%; }
        .nas-thumb-img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; }
        .nas-thumb-tail {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          clip-path: polygon(50% 100%, 0 0, 100% 0);
        }

        /* ── Cluster pin ── */
        .nas-cluster-pin {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50% 50% 50% 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(0,0,0,0.32);
          cursor: pointer;
          transform-origin: bottom center;
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .custom-map-pin:hover .nas-cluster-pin { transform: scale(1.18) translateY(-3px); }
        .nas-cluster-count {
          font-family: system-ui, sans-serif;
          font-size: 18px;
          font-weight: 900;
          color: white;
          line-height: 1;
        }

        /* ── Pulse ring on newest pin ── */
        @keyframes nas-pulse {
          0%   { transform: scale(1);   opacity: .7; }
          70%  { transform: scale(2.1); opacity: 0; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        .nas-pin-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 3px solid ${PIN_COLOR};
          animation: nas-pulse 2.4s ease-out infinite;
          pointer-events: none;
          z-index: -1;
        }

        /* ── Tooltip ── */
        .leaflet-tooltip-nas {
          background: rgba(253,246,232,0.97) !important;
          border: 1px solid rgba(196,164,107,0.45) !important;
          color: #1a0e08 !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          border-radius: 9999px !important;
          box-shadow: 0 6px 18px rgba(0,0,0,.14) !important;
          padding: 4px 12px !important;
          white-space: nowrap;
          pointer-events: none;
        }
        .leaflet-tooltip-nas::before { display: none !important; }

        /* ── Popup ── */
        .leaflet-popup-nas .leaflet-popup-content-wrapper {
          background: rgba(253,246,232,0.98) !important;
          backdrop-filter: blur(14px) !important;
          border: 1px solid rgba(196,164,107,0.45) !important;
          border-radius: 20px !important;
          box-shadow: 0 12px 36px rgba(0,0,0,0.2) !important;
          padding: 8px !important;
        }
        .leaflet-popup-nas .leaflet-popup-tip {
          background: rgba(253,246,232,0.98) !important;
          border-top: 1px solid rgba(196,164,107,0.45) !important;
          border-left: 1px solid rgba(196,164,107,0.45) !important;
        }
        .leaflet-popup-nas .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
          width: auto !important;
          line-height: inherit;
        }
        .leaflet-popup-nas .leaflet-popup-close-button {
          top: 12px !important;
          right: 12px !important;
          color: #6b4c35 !important;
          background: rgba(0,0,0,0.05) !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-weight: 900 !important;
          transition: all 0.2s !important;
          z-index: 50 !important;
        }
        .leaflet-popup-nas .leaflet-popup-close-button:hover {
          background: rgba(0,0,0,0.1) !important;
          color: #1a0e08 !important;
        }

        /* ── Horizontal scroll ── */
        .nas-scroll-x { scroll-behavior: smooth; }
        .nas-scroll-x::-webkit-scrollbar { height: 6px; }
        .nas-scroll-x::-webkit-scrollbar-track { background: rgba(196,164,107,0.1); border-radius: 6px; margin: 0 8px; }
        .nas-scroll-x::-webkit-scrollbar-thumb { background: rgba(196,164,107,0.4); border-radius: 6px; }
        .nas-scroll-x::-webkit-scrollbar-thumb:hover { background: rgba(196,164,107,0.7); }

        /* ── Zoom control ── */
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.14) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(253,246,232,0.97) !important;
          color: #2d1a0e !important;
          border: none !important;
          border-bottom: 1px solid rgba(196,164,107,0.25) !important;
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover { background: rgba(240,225,200,0.97) !important; }
        .leaflet-control-zoom-out { border-bottom: none !important; }

        /* ── Attribution ── */
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(253,246,232,0.75) !important;
          border-radius: 6px 0 0 0 !important;
        }
      `}</style>

      {/* ── Contextual Hint (disappears on interaction) ── */}
      <div
        className={`absolute inset-0 z-[500] pointer-events-none flex items-center justify-center transition-opacity duration-1000 ${
          hasInteracted ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="bg-black/60 backdrop-blur-sm text-white px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-pulse">
          <Hand size={18} className="animate-bounce" />
          <span className="font-bold text-sm">اسحب الخريطة لاستكشاف حكايات إربد</span>
        </div>
      </div>

      <MapContainer
        center={IRBID_CENTER}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom
        ref={setMapObj}
        className="w-full h-full min-h-[calc(100vh-80px)] z-0 absolute inset-0"
      >
        <MapInteractionWatcher onInteract={() => setHasInteracted(true)} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />
        <ZoomControl position="bottomright" />
        <FitToMarkers episodes={filteredEpisodes} />
        <ZoomWatcher onZoom={setZoom} />

        {/* User location marker */}
        {userPos && userIcon && (
          <Marker position={userPos} icon={userIcon} />
        )}

        {/* Trail polyline */}
        {trailPolyline.length >= 2 && (
          <Polyline
            positions={trailPolyline}
            pathOptions={{ color: "#c4a46b", weight: 3, dashArray: "8 6", opacity: 0.85 }}
          />
        )}

        {groupedEpisodes.map((group, index) => {
          const { lat, lng } = group;
          const isMulti = group.episodes.length > 1;
          const containsNewest = group.episodes.some((ep) => ep.id === newestId);
          const icon = isMulti
            ? getClusterIcon(group.episodes.length, containsNewest)
            : getThumbnailPin(group.episodes[0], containsNewest, containsNewest);

          return (
            <Marker
              key={`group-${index}`}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={
                isMobile
                  ? {
                      click: () => setActiveGroup(group),
                    }
                  : {}
              }
            >
              {/* Hover tooltip */}
              <Tooltip direction="top" opacity={1} className="leaflet-tooltip-nas" offset={[0, -4]}>
                {isMulti
                  ? `${group.episodes.length} حلقات في هذا المكان`
                  : group.episodes[0].title}
              </Tooltip>

              {/* Desktop popup only */}
              {!isMobile && (
                <Popup
                  className="leaflet-popup-nas"
                  closeButton={true}
                  maxWidth={760}
                  minWidth={270}
                  autoPanPadding={[24, 24]}
                  autoPan
                >
                  <div dir="rtl" className="relative pt-1 pb-1 px-1">
                    <div className="flex flex-row gap-3 overflow-x-auto snap-x snap-mandatory nas-scroll-x pb-2 pt-4">
                      {isMulti && (
                        <div
                          className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold shadow-sm z-10 flex items-center gap-1.5 border border-[rgba(255,255,255,0.2)]"
                          style={{ background: PIN_COLOR, color: "white" }}
                        >
                          <Hand size={14} /> مرّر لاستكشاف {group.episodes.length} حلقات
                        </div>
                      )}
                      {group.episodes.map((ep) => (
                        <EpisodeCard key={ep.id} ep={ep} lat={lat} lng={lng} userPos={userPos} />
                      ))}
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {/* ── Bottom Sheet (mobile) ── */}
      <BottomSheet
        group={activeGroup}
        userPos={userPos}
        onClose={() => setActiveGroup(null)}
      />

      {/* ── Story Trails Panel (decade-based) ── */}
      {/* 
        [LOVABLE NOTE]: تم إخفاء ميزة "مسارات الحكايات" مؤقتاً لأن جميع الحلقات الحالية مصورة في نفس العقد الزمني.
        لتفعيل الميزة مستقبلاً بشكل صحيح: يجب إضافة حقل `trail_tag` في قاعدة البيانات لتصنيف الحلقات يدوياً 
        (مثل: "الحرفيون"، "أقدم المحلات")، وبناء المسارات بناءً عليه، ثم تحويل false إلى true هنا.
      */}
      {false && decades.length > 0 && (
        <>
          {/* Toggle button */}
          <button
            onClick={() => setShowTrailPanel((v) => !v)}
            className="absolute top-20 left-4 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-sm font-bold transition-all active:scale-95"
            style={{
              background: showTrailPanel ? PIN_COLOR : "rgba(253,246,232,0.97)",
              color: showTrailPanel ? "white" : "#2d1a0e",
              borderColor: showTrailPanel ? PIN_COLOR : "rgba(196,164,107,0.4)"
            }}
          >
            <Route size={16} />
            <span className="hidden sm:inline">مسارات الحكايات</span>
          </button>

          {showTrailPanel && (
            <div
              className="absolute top-36 left-4 z-[1000] w-60 rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: "rgba(253,246,232,0.98)", border: "1px solid rgba(196,164,107,0.4)" }}
              dir="rtl"
            >
              {/* Header */}
              <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "rgba(196,164,107,0.25)" }}>
                <p className="text-xs font-bold" style={{ color: PIN_COLOR }}>سافر عبر الزمن</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#8a6550" }}>اختر حقبة لترى حكاياتها على الخريطة وتجول بينها</p>
              </div>

              {/* Decade cards */}
              <div className="p-2 flex flex-col gap-1">
                {decades.map((d) => {
                  const count = episodes.filter((e) => e.decade === d).length;
                  const isActive = selectedDecade === d;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        const next = isActive ? null : d;
                        setSelectedDecade(next);
                        setTourIndex(null);
                        if (next && mapObj) {
                          const eps = episodes.filter((e) => e.decade === next);
                          if (eps.length === 1) mapObj.flyTo([eps[0].latitude, eps[0].longitude], 16, { animate: true, duration: 1.2 });
                          else if (eps.length > 1) {
                            const bounds = L.latLngBounds(eps.map((e) => [e.latitude, e.longitude]));
                            mapObj.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true });
                          }
                        }
                      }}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-right transition-all active:scale-95"
                      style={{
                        background: isActive ? PIN_COLOR : "rgba(196,164,107,0.12)",
                        color: isActive ? "white" : "#2d1a0e",
                        border: `1px solid ${isActive ? PIN_COLOR : "transparent"}`
                      }}
                    >
                      <span>{d}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.2)" : "rgba(124,28,34,0.12)",
                          color: isActive ? "white" : PIN_COLOR
                        }}
                      >
                        {count} حلقة
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tour controls — only when a decade is selected */}
              {selectedDecade && trailEpisodes.length > 0 && (
                <div className="p-3 border-t" style={{ borderColor: "rgba(196,164,107,0.25)" }}>
                  {tourIndex === null ? (
                    <button
                      onClick={startTour}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition active:scale-95"
                      style={{ background: PIN_COLOR }}
                    >
                      <Play size={12} fill="white" /> ابدأ الجولة التلقائية
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 mb-1">
                        <button onClick={prevTourStop} disabled={tourIndex === 0} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold bg-black/6 hover:bg-black/10 disabled:opacity-40 transition">
                          <ChevronRight size={13} /> السابق
                        </button>
                        <span className="text-[10px] font-bold px-1" style={{ color: PIN_COLOR }}>
                          {tourIndex + 1}/{trailEpisodes.length}
                        </span>
                        <button onClick={nextTourStop} disabled={tourIndex === trailEpisodes.length - 1} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold bg-black/6 hover:bg-black/10 disabled:opacity-40 transition">
                          التالي <ChevronLeft size={13} />
                        </button>
                      </div>
                      {trailEpisodes[tourIndex] && (
                        <p className="text-[10px] text-center font-bold line-clamp-1" style={{ color: "#6b4c35" }}>
                          {trailEpisodes[tourIndex].title}
                        </p>
                      )}
                      <button onClick={endTour} className="w-full mt-1.5 py-1 text-[10px] text-center text-red-500 hover:underline">
                        إنهاء الجولة
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Clear */}
              {selectedDecade && (
                <button
                  onClick={clearTrail}
                  className="w-full py-2 text-[11px] font-bold text-center border-t transition hover:bg-black/5"
                  style={{ borderColor: "rgba(196,164,107,0.25)", color: "#8a6550" }}
                >
                  عرض جميع الحلقات
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Floating Controls ── */}
      {mapObj && (
        <div className="fixed bottom-6 left-4 z-[100000] flex flex-col gap-2">
          {/* Reset / recenter */}
          <button
            onClick={() => {
              setActiveGroup(null);
              if (groupedEpisodes.length === 0) {
                mapObj.setView(IRBID_CENTER, 14, { animate: true });
              } else {
                const bounds = L.latLngBounds(groupedEpisodes.map((g) => [g.lat, g.lng]));
                mapObj.fitBounds(bounds, { padding: [90, 90], maxZoom: 16, animate: true });
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-black transition-all active:scale-95"
          >
            <LocateFixed size={17} className="text-primary" />
            <span className="hidden sm:inline">العودة للمركز</span>
          </button>

          {/* Locate me */}
          <button
            onClick={locateUser}
            disabled={locating}
            title="موقعي الحالي"
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg border border-slate-200 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-60"
          >
            <Navigation size={17} className={locating ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{locating ? "جاري التحديد…" : "موقعي"}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
          >
            {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
            <span className="hidden sm:inline">{isFullscreen ? "تصغير" : "ملء الشاشة"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
