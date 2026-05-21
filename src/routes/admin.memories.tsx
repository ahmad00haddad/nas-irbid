import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/memories")({
  component: AdminMemories,
});

function AdminMemories() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-memories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("memories").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from("memories").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-memories"] });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
      qc.invalidateQueries({ queryKey: ["public-memories"] });
      toast.success("تم التحديث");
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("memories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-memories"] });
      toast.success("تم الحذف");
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground mb-2">جدار الذكريات</h1>
      <p className="text-sm text-muted-foreground mb-8">قصص وصور قديمة من المتابعين. وافق على المناسب للنشر.</p>

      {isLoading ? <p className="text-muted-foreground text-sm">جاري التحميل…</p> :
       data.length === 0 ? <div className="text-center p-12 rounded-2xl bg-card border border-dashed border-border"><p className="text-muted-foreground">لا ذكريات بعد.</p></div> : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((m: any) => (
            <div key={m.id} className={`p-6 rounded-2xl bg-card border ${m.approved ? "border-border/60" : "border-primary/40"}`}>
              {m.photo_url && <img src={m.photo_url} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold tracking-widest ${m.approved ? "text-green-500" : "text-primary"}`}>
                  {m.approved ? (m.featured ? "★ مميّزة" : "منشورة") : "بانتظار المراجعة"}
                </span>
                <span className="text-[11px] text-muted-foreground">{new Date(m.created_at).toLocaleDateString("ar-JO")}</span>
              </div>
              {m.title && <h3 className="font-display text-lg text-foreground mb-1">{m.title}</h3>}
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-4">{m.body}</p>
              <div className="text-xs text-muted-foreground border-t border-border/60 pt-3 mb-4">
                — {m.contributor_name ?? "مجهول"}
                {m.neighborhood && <span> · {m.neighborhood}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {!m.approved && (
                  <button onClick={() => update.mutate({ id: m.id, patch: { approved: true } })} className="px-3 py-1.5 rounded-full bg-gradient-warm text-primary-foreground text-xs font-bold">
                    <Check size={11} className="inline ms-1" /> وافق ونشر
                  </button>
                )}
                {m.approved && (
                  <button onClick={() => update.mutate({ id: m.id, patch: { featured: !m.featured } })} className="px-3 py-1.5 rounded-full border border-border text-xs">
                    <Star size={11} className="inline ms-1" /> {m.featured ? "إلغاء التمييز" : "ميّز"}
                  </button>
                )}
                <button onClick={() => confirm("حذف؟") && remove.mutate(m.id)} className="px-3 py-1.5 rounded-full border border-border text-xs hover:border-destructive hover:text-destructive">
                  <Trash2 size={11} className="inline ms-1" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
