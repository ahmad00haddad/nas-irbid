import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://nas-irbid.lovable.app";

type SitemapEntry = {
  path: string;
  lastmod?: string;
  changefreq: "weekly" | "monthly";
  priority: string;
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/episodes", changefreq: "weekly", priority: "0.9" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/suggest", changefreq: "monthly", priority: "0.6" },
          { path: "/ask", changefreq: "monthly", priority: "0.6" },
        ];

        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (url && key) {
          const response = await fetch(`${url}/rest/v1/episodes?select=slug,updated_at&published=eq.true`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
          });
          if (response.ok) {
            const episodes = await response.json() as Array<{ slug: string; updated_at: string | null }>;
            episodes.forEach((episode) => entries.push({
              path: `/episodes/${encodeURIComponent(episode.slug)}`,
              lastmod: episode.updated_at ?? undefined,
              changefreq: "monthly",
              priority: "0.8",
            }));
          }
        }

        const urls = entries.map((entry) => [
          "  <url>",
          `    <loc>${BASE_URL}${entry.path}</loc>`,
          entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
          `    <changefreq>${entry.changefreq}</changefreq>`,
          `    <priority>${entry.priority}</priority>`,
          "  </url>",
        ].filter(Boolean).join("\n"));

        return new Response([
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n"), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});