import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SettingsMap = Record<string, string>;

export const DEFAULT_SETTINGS: SettingsMap = {
  contact_email: "ahmad000haddad@gmail.com",
  instagram_handle: "ahmad00haddad",
  youtube_url:
    "https://www.youtube.com/watch?v=jBTSEPj5GyI&list=PL2kh_LOeNn-cakuboTWXV3kxhrqTsYRLS",
  hero_title: "نوثّقُ إربد بصوت أهلها",
  hero_subtitle:
    "برنامج وثائقي مستقل يحفظ ذاكرة المدينة وحكايات ناسها",
  about_tagline: "ذاكرة إربد أمانة بإيدينا",
  facebook_url: "",
  whatsapp_url: "",
};

export const SETTINGS_SCHEMA: { key: string; label: string; type: "text" | "textarea" | "email" | "url" }[] = [
  { key: "contact_email", label: "إيميل التواصل", type: "email" },
  { key: "instagram_handle", label: "حساب إنستاجرام (بدون @)", type: "text" },
  { key: "youtube_url", label: "رابط قناة/قائمة يوتيوب", type: "url" },
  { key: "hero_title", label: "عنوان الصفحة الرئيسية", type: "text" },
  { key: "hero_subtitle", label: "وصف الصفحة الرئيسية", type: "textarea" },
  { key: "about_tagline", label: "شعار صفحة الدعم", type: "text" },
  { key: "facebook_url", label: "رابط صفحة فيسبوك", type: "url" },
  { key: "whatsapp_url", label: "رابط واتساب", type: "url" },
];

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async (): Promise<SettingsMap> => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      const map: SettingsMap = { ...DEFAULT_SETTINGS };
      (data ?? []).forEach((r) => {
        if (r.value != null) map[r.key] = r.value;
      });
      return map;
    },
    staleTime: 60_000,
  });
}
