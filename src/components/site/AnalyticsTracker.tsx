import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Exported helper to track custom events (e.g. clicks, form submits) anywhere in the app
export const trackSiteEvent = async (eventType: string, path: string, details?: any) => {
  // Ignore admin events
  if (path.startsWith("/admin") || path.startsWith("/auth")) return;

  try {
    let sessionId = sessionStorage.getItem("nas_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("nas_session_id", sessionId);
    }
    await supabase.from("site_analytics").insert({
      session_id: sessionId,
      path: path,
      event_type: eventType,
      details: details || {},
    });
  } catch (e) {
    console.error("Analytics event error:", e);
  }
};

function determineSource(referrer: string): string {
  if (!referrer) return "Direct / Bookmark";
  const url = referrer.toLowerCase();
  if (url.includes("facebook.com")) return "Facebook";
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("google.")) return "Google Search";
  if (url.includes("wa.me") || url.includes("whatsapp")) return "WhatsApp";
  if (url.includes("twitter.com") || url.includes("x.com")) return "X (Twitter)";
  if (url.includes("tiktok.com")) return "TikTok";
  if (url.includes(window.location.hostname)) return "Internal"; // Internal navigation
  
  try {
    return new URL(referrer).hostname; // Return the raw domain if unknown
  } catch {
    return "Unknown";
  }
}

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // 1. Ignore admin traffic and auth routes completely
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/auth")) {
      return;
    }

    // 2. Generate or retrieve session ID
    let sessionId = sessionStorage.getItem("nas_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("nas_session_id", sessionId);
    }

    // 3. Record page view with source parsing
    const recordPageView = async () => {
      try {
        const source = determineSource(document.referrer);
        await supabase.from("site_analytics").insert({
          session_id: sessionId as string,
          path: location.pathname,
          event_type: "page_view",
          details: {
            referrer: document.referrer || null,
            source: source,
            userAgent: navigator.userAgent,
          },
        });
      } catch (e) {
        // Silently fail if tracker fails
        console.error("Analytics error:", e);
      }
    };

    recordPageView();
  }, [location.pathname]);

  return null;
}

