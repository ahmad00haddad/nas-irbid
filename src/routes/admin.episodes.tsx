import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Eye, EyeOff, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/episodes")({
  component: AdminEpisodes,
});

type Episode = {
  id: string;
  slug: string;
  title: string;
  character_name: string | null;
  profession: string | null;
  neighborhood: string | null;
  decade: string | null;
  youtube_id: string | null;
  cover_image_url: string | null;
  short_description: string | null;
  story: string | null;
  behind_the_scenes: string | null;
  episode_number: number | null;
  season: number | null;
  published: boolean;
};

const empty: Partial<Episode> = {
  slug: "", title: "", character_name: "", profession: "", neighborhood: "",
  decade: "", youtube_id: "", cover_image_url: "", short_description: "", story: "",
  behind_the_scenes: "", episode_number: null, season: 1, published: false,
};

/** Sanitize a slug: lowercase, strip non-alphanumeric (except hyphens), collapse hyphens */
function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

/** Confirm dialog component for destructive actions */
function ConfirmDialog({
  title, description, onConfirm, onCancel,
}: { title: string; description: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-destructive/40 rounded-2xl w-full max-w-sm shadow-deep p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={20} className="text-destructive shrink-0" />
          <h3 className="font-display text-lg text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-full border border-border text-sm">إلغاء</button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-sm font-bold"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminEpisodes() {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState<Partial<Episode> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Episode | null>(null);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["admin-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes").select("*")
        .order("episode_number", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as Episode[];
    },
  });

  const save = useMutation({
    mutationFn: async (ep: Partial<Episode>) => {
      const payload = { ...ep };
      if (payload.id) {
        const { error } = await supabase.from("episodes").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("episodes").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-episodes"] });
      qc.invalidateQueries({ queryKey: ["public-episodes"] });
      setEditing(null);
      toast.success("تم الحفظ");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("episodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-episodes"] });
      setConfirmDelete(null);
      toast.success("تم الحذف");
    },
  });

  const togglePublish = useMutation({
    mutationFn: async (ep: Episode) => {
      const { error } = await supabase
        .from("episodes")
        .update({ published: !ep.published, published_at: !ep.published ? new Date().toISOString() : null })
        .eq("id", ep.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-episodes"] });
      qc.invalidateQueries({ queryKey: ["public-episodes"] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-foreground">الحلقات</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة أرشيف حلقات البرنامج.</p>
        </div>
        <button
          onClick={() => {
            const maxNum = episodes.reduce((m, e) => Math.max(m, e.episode_number ?? 0), 0);
            setEditing({ ...empty, episode_number: maxNum + 1 });
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow hover:opacity-90"
        >
          <Plus size={16} /> حلقة جديدة
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">جاري التحميل…</p>
      ) : episodes.length === 0 ? (
        <div className="text-center p-12 rounded-2xl bg-card border border-dashed border-border">
          <p className="text-muted-foreground">لا توجد حلقات بعد. ابدأ بإضافة أول حلقة.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <div key={ep.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60">
              <div className="w-20 h-14 rounded-lg bg-background/60 overflow-hidden shrink-0">
                {ep.cover_image_url && <img src={ep.cover_image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {ep.episode_number && <span className="text-[10px] font-bold text-primary tracking-widest">حلقة {ep.episode_number}</span>}
                  {ep.published ? (
                    <span className="text-[10px] font-bold text-green-500 tracking-widest">منشورة</span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground tracking-widest">مسوّدة</span>
                  )}
                </div>
                <div className="font-display text-base text-foreground truncate">{ep.title}</div>
                <div className="text-xs text-muted-foreground truncate">{ep.character_name}</div>
              </div>
              <div className="flex items-center gap-1">
                {/* Publish toggle — admin only */}
                {isAdmin && (
                  <button
                    onClick={() => togglePublish.mutate(ep)}
                    className="p-2 rounded-lg hover:bg-background/60 text-muted-foreground"
                    title={ep.published ? "إلغاء النشر" : "نشر"}
                  >
                    {ep.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
                <button onClick={() => setEditing(ep)} className="p-2 rounded-lg hover:bg-background/60 text-muted-foreground" title="تعديل">
                  <Pencil size={16} />
                </button>
                {/* Delete — admin only */}
                {isAdmin && (
                  <button
                    onClick={() => setConfirmDelete(ep)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EpisodeEditor
          value={editing}
          onClose={() => setEditing(null)}
          onSave={(v) => save.mutate(v)}
          saving={save.isPending}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="حذف الحلقة نهائياً"
          description={`هل أنت متأكد من حذف حلقة "${confirmDelete.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
          onConfirm={() => remove.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function EpisodeEditor({
  value, onClose, onSave, saving,
}: { value: Partial<Episode>; onClose: () => void; onSave: (v: Partial<Episode>) => void; saving: boolean }) {
  const [v, setV] = useState(value);

  const set = <K extends keyof Episode>(k: K, x: Episode[K]) => setV((p) => ({ ...p, [k]: x }));

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl my-8 shadow-deep">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-xl text-foreground">
            {v.id ? "تعديل حلقة" : "حلقة جديدة"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-background/60"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="رقم الحلقة" type="number" value={v.episode_number ?? ""} onChange={(e) => set("episode_number", e.target.value ? Number(e.target.value) : null)} />
            <Input label="الموسم" type="number" value={v.season ?? 1} onChange={(e) => set("season", Number(e.target.value))} />
          </div>
          <Input label="العنوان *" value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
          <div>
            <Input
              label="المعرّف (slug) — بالإنجليزي *"
              value={v.slug ?? ""}
              onChange={(e) => set("slug", sanitizeSlug(e.target.value))}
              required
              placeholder="darkal-family"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              يُسمح فقط بالأحرف الإنجليزية الصغيرة والأرقام والشرطة (-). يُحوَّل تلقائياً.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="اسم الشخصية" value={v.character_name ?? ""} onChange={(e) => set("character_name", e.target.value)} />
            <Input label="المهنة" value={v.profession ?? ""} onChange={(e) => set("profession", e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="العقد الزمني" placeholder="٧٠s, ٨٠s..." value={v.decade ?? ""} onChange={(e) => set("decade", e.target.value)} />
          </div>

          <Input label="معرّف فيديو يوتيوب (YouTube ID)" placeholder="dQw4w9WgXcQ" value={v.youtube_id ?? ""} onChange={(e) => set("youtube_id", e.target.value)} />
          <p className="text-[11px] text-muted-foreground -mt-3">انسخ فقط الجزء بعد ?v= من رابط الفيديو على يوتيوب</p>

          <Input label="رابط صورة الغلاف" value={v.cover_image_url ?? ""} onChange={(e) => set("cover_image_url", e.target.value)} placeholder="https://..." />

          <Textarea label="وصف قصير" rows={2} value={v.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} />
          <Textarea label="قصة الشخصية" rows={5} value={v.story ?? ""} onChange={(e) => set("story", e.target.value)} />
          <Textarea label="ما لم يظهر في الحلقة (خلف الكواليس)" rows={5} value={v.behind_the_scenes ?? ""} onChange={(e) => set("behind_the_scenes", e.target.value)} />

          <label className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-border cursor-pointer">
            <input type="checkbox" checked={v.published ?? false} onChange={(e) => set("published", e.target.checked)} className="accent-[var(--gold)]" />
            <span className="text-sm text-foreground">نشر الحلقة على الموقع العام</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t border-border">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full border border-border text-sm">إلغاء</button>
          <button
            onClick={() => {
              if (!v.title?.trim()) { toast.error("العنوان مطلوب"); return; }
              if (!v.slug?.trim()) { toast.error("المعرّف (slug) مطلوب"); return; }
              if (!/^[a-z0-9\u0600-\u06ff-]+$/.test(v.slug)) { toast.error("المعرّف يحتوي على أحرف غير مسموح بها"); return; }
              onSave(v);
            }}
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow disabled:opacity-60"
          >
            {saving ? "..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground mb-1.5">{label}</span>
      <input {...props} className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
    </label>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground mb-1.5">{label}</span>
      <textarea {...props} className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
    </label>
  );
}
