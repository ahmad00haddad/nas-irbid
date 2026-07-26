import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem("nas_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("nas_session_id", sessionId);
    }

    // Record page view
    const recordPageView = async () => {
      try {
        await supabase.from("site_analytics").insert({
          session_id: sessionId,
          path: location.pathname,
          event_type: "page_view",
          details: {
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
          },
        });
      } catch (e) {
        // Silently fail if tracker fails, so it doesn't break the user experience
        console.error("Analytics error:", e);
      }
    };

    recordPageView();
  }, [location.pathname]);

  return null;
}
