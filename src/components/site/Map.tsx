import { MapContainer, TileLayer, Marker, Popup, Tooltip, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Play, Navigation, MapPin } from "lucide-react";
import { useEffect, useMemo } from "react";

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

function getCustomIcon(count: number) {
  if (typeof window === "undefined") return undefined;
  const isSingle = count === 1;

  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="64" viewBox="0 0 52 64">
      <filter id="pin-shadow" x="-40%" y="-20%" width="180%" height="180%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#00000055"/>
      </filter>
      <g filter="url(#pin-shadow)">
        <path d="M26 2C15.5 2 7 10.5 7 21c0 13.5 19 39 19 39s19-25.5 19-39c0-10.5-8.5-19-19-19Z" fill="${PIN_COLOR}" />
        <circle cx="26" cy="21" r="10" fill="#fdf6e8" opacity="0.97"/>
        ${
          isSingle
            ? `<circle cx="26" cy="21" r="4" fill="${PIN_COLOR}"/>`
            : `<text x="26" y="26" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="bold" fill="${PIN_COLOR}">${count}</text>`
        }
      </g>
    </svg>
  `;

  return new L.DivIcon({
    className: "custom-map-pin bg-transparent border-0",
    html: `<div class="nas-pin">${pinSvg}</div>`,
    iconSize: [52, 64],
    iconAnchor: [26, 64],
    popupAnchor: [0, -58],
    tooltipAnchor: [0, -58],
  });
}

/** Fits the viewport to all markers so no pin ends up off-screen. */
function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [90, 90], maxZoom: 16 });
  }, [map, JSON.stringify(points)]);
  return null;
}

export default function Map({ episodes }: { episodes: Episode[] }) {
  const IRBID_CENTER: [number, number] = [32.551445, 35.851479];

  // Group episodes sharing (near-)identical coordinates (~20m) to prevent overlap
  const groupedEpisodes = useMemo(() => {
    const groups: { lat: number; lng: number; episodes: Episode[] }[] = [];
    const THRESHOLD = 0.0002;

    episodes.forEach((ep) => {
      const existing = groups.find(
        (g) =>
          Math.abs(g.lat - ep.latitude) < THRESHOLD &&
          Math.abs(g.lng - ep.longitude) < THRESHOLD,
      );
      if (existing) existing.episodes.push(ep);
      else groups.push({ lat: ep.latitude, lng: ep.longitude, episodes: [ep] });
    });
    return groups;
  }, [episodes]);

  const points = useMemo(
    () => groupedEpisodes.map((g) => [g.lat, g.lng] as [number, number]),
    [groupedEpisodes],
  );

  return (
    <div className="flex-1 w-full h-full min-h-[calc(100vh-80px)] relative z-0">
      <style>{`
        .leaflet-tile-pane {
          filter: grayscale(0.2) sepia(0.3) contrast(1.1) brightness(1.05) hue-rotate(-10deg);
        }
        .nas-pin {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform-origin: bottom center;
          transition: transform .3s ease;
        }
        .custom-map-pin:hover .nas-pin { transform: scale(1.12); }

        /* Strip Leaflet chrome from popups & tooltips */
        .leaflet-popup-nas .leaflet-popup-content-wrapper,
        .leaflet-popup-nas .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .leaflet-popup-nas .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
          width: auto !important;
          line-height: inherit;
        }
        .leaflet-popup-nas .leaflet-popup-close-button {
          top: 6px !important;
          inset-inline-end: 8px !important;
          left: auto !important;
          color: #7c1c22 !important;
          font-size: 20px !important;
          z-index: 20;
        }
        .leaflet-tooltip-nas {
          background: rgba(253,246,232,0.97) !important;
          border: 1px solid rgba(196,164,107,0.45) !important;
          color: #1a0e08 !important;
          font-weight: 700 !important;
          border-radius: 9999px !important;
          box-shadow: 0 6px 18px rgba(0,0,0,.15) !important;
          padding: 4px 12px !important;
        }
        .leaflet-tooltip-nas::before { display: none !important; }

        .nas-scroll-x::-webkit-scrollbar { height: 6px; }
        .nas-scroll-x::-webkit-scrollbar-track { background: rgba(196,164,107,0.12); border-radius: 4px; }
        .nas-scroll-x::-webkit-scrollbar-thumb { background: rgba(196,164,107,0.45); border-radius: 4px; }
      `}</style>

      <MapContainer
        center={IRBID_CENTER}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom
        className="w-full h-full min-h-[calc(100vh-80px)] z-0 absolute inset-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        <FitToMarkers points={points} />

        {groupedEpisodes.map((group, index) => {
          const { lat, lng } = group;
          const multiple = group.episodes.length > 1;

          return (
            <Marker
              key={`group-${index}`}
              position={[lat, lng]}
              icon={getCustomIcon(group.episodes.length)!}
            >
              <Tooltip direction="top" opacity={1} className="leaflet-tooltip-nas">
                {multiple ? `${group.episodes.length} حلقات هنا` : group.episodes[0].title}
              </Tooltip>

              <Popup className="leaflet-popup-nas" closeButton maxWidth={720} autoPanPadding={[24, 24]}>
                <div
                  dir="rtl"
                  className="flex flex-row gap-3 p-2 rounded-2xl shadow-2xl max-w-[86vw] md:max-w-[700px] overflow-x-auto snap-x snap-mandatory nas-scroll-x"
                  style={{
                    background: "rgba(253,246,232,0.98)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(196,164,107,0.35)",
                  }}
                >
                  {group.episodes.map((ep) => {
                    const img =
                      ep.cover_image_url ??
                      (ep.youtube_id ? `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg` : null);
                    return (
                      <div
                        key={ep.id}
                        className="group/card w-[248px] sm:w-[270px] shrink-0 snap-start flex flex-col rounded-xl p-2 border"
                        style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(0,0,0,0.06)" }}
                      >
                        <div className="w-full h-32 sm:h-36 rounded-lg overflow-hidden relative mb-3 bg-[#e8d8c0]">
                          {img ? (
                            <img
                              src={img}
                              alt={`صورة حلقة ${ep.title}`}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin size={32} color="#c4a46b" />
                            </div>
                          )}
                          {ep.decade && (
                            <div
                              className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold"
                              style={{ background: "rgba(253,246,232,0.92)", color: "#2d1a0e" }}
                            >
                              {ep.decade}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 px-1">
                          <h3
                            className="font-display text-lg m-0 leading-tight line-clamp-1"
                            style={{ color: "#1a0e08", fontWeight: 700 }}
                          >
                            {ep.title}
                          </h3>
                          <p className="text-xs mt-1 m-0 line-clamp-1" style={{ color: "#6b4c35" }}>
                            {ep.character_name}
                            {ep.profession ? ` · ${ep.profession}` : ""}
                          </p>
                          {ep.neighborhood && (
                            <div className="flex items-center gap-1 mt-2">
                              <MapPin size={11} color="#7c1c22" />
                              <span className="text-[10px]" style={{ color: "#8a6550" }}>
                                {ep.neighborhood}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3 px-1">
                          <a
                            href={`/episodes/${ep.slug}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold shadow-md !no-underline transition hover:brightness-110"
                            style={{ background: PIN_COLOR, color: "#fff" }}
                          >
                            <Play size={12} className="fill-current" />
                            شاهد الحلقة
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="الاتجاهات على خرائط جوجل"
                            title="الاتجاهات"
                            className="flex items-center justify-center w-10 h-10 rounded-xl border shrink-0 !no-underline transition hover:brightness-95"
                            style={{
                              background: "rgba(196,164,107,0.18)",
                              borderColor: "rgba(196,164,107,0.35)",
                              color: "#2d1a0e",
                            }}
                          >
                            <Navigation size={14} />
                          </a>
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
