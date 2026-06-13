import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings, SETTINGS_SCHEMA, DEFAULT_SETTINGS } from "@/lib/site-settings";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Save, RotateCcw, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Hard redirect non-admins away — belt-and-suspenders on top of hidden nav link
  useEffect(() => {
    if (!isLoading && !isAdmin) navigate({ to: "/admin" });
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const setKey = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    setSaving(true);
    try {
      const rows = SETTINGS_SCHEMA.map(({ key }) => ({ key, value: values[key] ?? "" }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast.success("تم حفظ الإعدادات");
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e: any) {
      toast.error(e.message ?? "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    setValues(DEFAULT_SETTINGS);
    toast.message("تم استرجاع القيم الافتراضية (لم يُحفظ بعد)");
  };

  if (isLoading) return <p className="text-muted-foreground">جاري التحميل…</p>;

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <ShieldAlert size={32} className="text-destructive mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">هذه الصفحة للمسؤولين فقط.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground mb-2">إعدادات الموقع</h1>
      <p className="text-sm text-muted-foreground mb-8">
        عدّل النصوص الرئيسية وروابط التواصل. التغييرات تظهر فوراً للزوّار.
      </p>

      <div className="space-y-5 max-w-2xl">
        {SETTINGS_SCHEMA.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-semibold text-foreground mb-2">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                value={values[f.key] ?? ""}
                onChange={(e) => setKey(f.key, e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:border-primary outline-none resize-y"
              />
            ) : (
              <input
                type={f.type}
                value={values[f.key] ?? ""}
                onChange={(e) => setKey(f.key, e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:border-primary outline-none"
              />
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "جاري الحفظ…" : "حفظ التغييرات"}
          </button>
          <button
            onClick={onReset}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border text-sm text-foreground hover:border-primary"
          >
            <RotateCcw size={14} /> القيم الافتراضية
          </button>
        </div>
      </div>
    </div>
  );
}
