import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Play, Navigation, MapPin, ExternalLink, LocateFixed, X, Hand } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";


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
const PIN_COLOR_MULTI = "#5a1018"; // Slightly darker for multi-episode pins

// Per-count icon cache to avoid recreating the same DivIcon multiple times
const iconCache = new globalThis.Map<number, L.DivIcon>();

function getCustomIcon(count: number) {
  if (typeof window === "undefined") return undefined;
  if (iconCache.has(count)) return iconCache.get(count)!;

  const isSingle = count === 1;
  const fillColor = isSingle ? PIN_COLOR : PIN_COLOR_MULTI;

  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="64" viewBox="0 0 52 64">
      <defs>
        <filter id="pin-shadow-${count}" x="-40%" y="-20%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#00000060"/>
        </filter>
      </defs>
      <g filter="url(#pin-shadow-${count})">
        <path d="M26 2C15.5 2 7 10.5 7 21c0 13.5 19 39 19 39s19-25.5 19-39c0-10.5-8.5-19-19-19Z" fill="${fillColor}" />
        <circle cx="26" cy="21" r="10" fill="#fdf6e8" opacity="0.97"/>
        ${
          isSingle
            ? `<circle cx="26" cy="21" r="4.5" fill="${fillColor}"/>`
            : `<text x="26" y="26" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="800" fill="${fillColor}">${count}</text>`
        }
      </g>
    </svg>
  `;

  const icon = new L.DivIcon({
    className: "custom-map-pin bg-transparent border-0",
    html: `<div class="nas-pin">${pinSvg}</div>`,
    iconSize: [52, 64],
    iconAnchor: [26, 64],
    popupAnchor: [0, -62],
    tooltipAnchor: [0, -66],
  });

  iconCache.set(count, icon);
  return icon;
}

/** Fits viewport to all markers — uses a stable dep to prevent infinite loops */
function FitToMarkers({ groups }: { groups: { lat: number; lng: number }[] }) {
  const map = useMap();
  // Stringify just the lat/lng pairs for stable comparison
  const key = groups.map((g) => `${g.lat},${g.lng}`).join("|");

  useEffect(() => {
    if (groups.length === 0) return;
    if (groups.length === 1) {
      map.setView([groups[0].lat, groups[0].lng], 16, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(groups.map((g) => [g.lat, g.lng]));
    map.fitBounds(bounds, { padding: [90, 90], maxZoom: 16, animate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);

  return null;
}

/** Episode card inside the popup */
function EpisodeCard({ ep, lat, lng }: { ep: Episode; lat: number; lng: number }) {
  const img =
    ep.cover_image_url ??
    (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg` : null);

  return (
    <div
      className="group/card w-[248px] sm:w-[270px] shrink-0 snap-start flex flex-col rounded-xl p-2 border"
      style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(0,0,0,0.07)" }}
    >
      {/* Thumbnail */}
      <div className="w-full h-[136px] rounded-lg overflow-hidden relative mb-3 bg-[#e8d8c0] shrink-0">
        {img ? (
          <img
            src={img}
            alt={`صورة ${ep.title}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
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

        {/* YouTube play indicator */}
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
            color: "#4285F4", // Google Maps Blue
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

export default function Map({ episodes }: { episodes: Episode[] }) {
  const IRBID_CENTER: [number, number] = [32.551445, 35.851479];

  // Group near-identical coordinates (~20 m radius) to prevent overlapping pins
  const groupedEpisodes = useMemo(() => {
    const groups: { lat: number; lng: number; episodes: Episode[] }[] = [];
    const THRESHOLD = 0.0002;

    episodes.forEach((ep) => {
      const existing = groups.find(
        (g) =>
          Math.abs(g.lat - ep.latitude) < THRESHOLD &&
          Math.abs(g.lng - ep.longitude) < THRESHOLD
      );
      if (existing) existing.episodes.push(ep);
      else groups.push({ lat: ep.latitude, lng: ep.longitude, episodes: [ep] });
    });
    return groups;
  }, [episodes]);

  // Keep a reference to the map to allow custom controls outside MapContainer children
  const [mapObj, setMapObj] = useState<L.Map | null>(null);

  return (
    <div className="flex-1 w-full h-full min-h-[calc(100vh-80px)] relative z-0">
      <style>{`
        /* ── Tile pane vintage colour grade ── */
        .leaflet-tile-pane {
          filter: grayscale(0.15) sepia(0.28) contrast(1.08) brightness(1.06) hue-rotate(-8deg);
        }

        /* ── Pin styles ── */
        .nas-pin {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform-origin: bottom center;
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
          will-change: transform;
        }
        .custom-map-pin:hover .nas-pin { transform: scale(1.18) translateY(-2px); }

        /* ── Tooltip — compact label ── */
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

        /* ── Popup Styling ── */
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
          /* Adding border to the tip to match the container */
          border-top: 1px solid rgba(196,164,107,0.45) !important;
          border-left: 1px solid rgba(196,164,107,0.45) !important;
          /* Leaflet rotates the tip by 45deg, so top/left borders become top/left of the diamond */
        }
        .leaflet-popup-nas .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
          width: auto !important;
          line-height: inherit;
        }
        
        /* ── Close Button ── */
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
        .leaflet-popup-nas .leaflet-popup-close-button span {
          margin-top: -2px; /* Fix vertical alignment of the '×' */
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

      <MapContainer
        center={IRBID_CENTER}
        zoom={14}
        minZoom={10} /* Prevent zooming out too much */
        maxBounds={[
          [31.8, 35.0], // South-West (roughly Dead Sea / Jordan Valley)
          [33.0, 36.5], // North-East (roughly Mafraq / borders)
        ]} /* Restrict dragging to Northern Jordan area */
        maxBoundsViscosity={1.0} /* Bounce back strongly if they drag outside */
        zoomControl={false}
        scrollWheelZoom
        ref={setMapObj}
        className="w-full h-full min-h-[calc(100vh-80px)] z-0 absolute inset-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />
        <ZoomControl position="bottomright" />
        <FitToMarkers groups={groupedEpisodes} />

        {groupedEpisodes.map((group, index) => {
          const { lat, lng } = group;
          const isMulti = group.episodes.length > 1;

          return (
            <Marker
              key={`group-${index}`}
              position={[lat, lng]}
              icon={getCustomIcon(group.episodes.length)!}
            >
              {/* Hover label */}
              <Tooltip direction="top" opacity={1} className="leaflet-tooltip-nas" offset={[0, -4]}>
                {isMulti
                  ? `${group.episodes.length} حلقات في هذا المكان`
                  : group.episodes[0].title}
              </Tooltip>

              {/* Click popup — horizontal card slider */}
              <Popup
                className="leaflet-popup-nas"
                closeButton={true}
                maxWidth={760}
                minWidth={270}
                autoPanPadding={[24, 24]}
                autoPan
              >
                <div dir="rtl" className="relative pt-1 pb-1 px-1">
                  
                  {/* Popup outer container (scrollable area) */}
                  <div className="flex flex-row gap-3 overflow-x-auto snap-x snap-mandatory nas-scroll-x pb-2 pt-4">
                    {/* Multi-episode indicator */}
                    {isMulti && (
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold shadow-sm z-10 flex items-center gap-1.5 animate-pulse border border-[rgba(255,255,255,0.2)]"
                        style={{ background: PIN_COLOR, color: "white" }}
                      >
                        <Hand size={14} /> مرّر لاستكشاف {group.episodes.length} حلقات
                      </div>
                    )}

                    {group.episodes.map((ep) => (
                      <EpisodeCard key={ep.id} ep={ep} lat={lat} lng={lng} />
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Action Button for Resetting the Map to Irbid */}
      {mapObj && (
        <button
          onClick={() => {
            if (groupedEpisodes.length === 0) {
              mapObj.setView(IRBID_CENTER, 14, { animate: true });
            } else {
              const bounds = L.latLngBounds(groupedEpisodes.map((g) => [g.lat, g.lng]));
              mapObj.fitBounds(bounds, { padding: [90, 90], maxZoom: 16, animate: true });
            }
          }}
          className="absolute bottom-6 left-6 z-[1000] flex items-center gap-2 px-4 py-3 bg-white rounded-full shadow-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-black transition-all active:scale-95"
        >
          <LocateFixed size={18} className="text-primary" />
          العودة للمركز
        </button>
      )}
    </div>
  );
}
