import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Star, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/questions")({
  component: AdminQuestions,
});

function ConfirmDialog({ title, description, onConfirm, onCancel }: {
  title: string; description: string; onConfirm: () => void; onCancel: () => void;
}) {
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
          <button onClick={onConfirm} className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-sm font-bold">تأكيد الحذف</button>
        </div>
      </div>
    </div>
  );
}

function AdminQuestions() {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("questions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from("questions").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-questions"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      toast.success("تم الحذف");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-questions"] }); setConfirmDelete(null); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground mb-2">بنك الأسئلة</h1>
      <p className="text-sm text-muted-foreground mb-8">أسئلة الجمهور للضيوف. اختر الأفضل قبل التصوير.</p>

      {isLoading ? <p className="text-muted-foreground text-sm">جاري التحميل…</p> :
       data.length === 0 ? <div className="text-center p-12 rounded-2xl bg-card border border-dashed border-border"><p className="text-muted-foreground">لا أسئلة بعد.</p></div> : (
        <div className="space-y-3">
          {data.map((q: any) => (
            <div key={q.id} className="p-5 rounded-xl bg-card border border-border/60 flex items-start gap-4">
              <button
                onClick={() => update.mutate({ id: q.id, patch: { selected: !q.selected } })}
                className={`p-2 rounded-lg shrink-0 ${q.selected ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-background/60"}`}
                title={q.selected ? "إلغاء الاختيار" : "اختر"}
              >
                <Star size={16} fill={q.selected ? "currentColor" : "none"} />
              </button>
              <div className="flex-1 min-w-0">
                {q.target_character && <div className="text-[11px] font-bold text-primary tracking-widest mb-1">للضيف: {q.target_character}</div>}
                <p className="text-sm text-foreground leading-relaxed mb-2">{q.question_text}</p>
                <div className="text-[11px] text-muted-foreground">
                  — {q.submitter_name ?? "مجهول"} · {new Date(q.created_at).toLocaleDateString("ar-JO")}
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => setConfirmDelete(q)} className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="حذف السؤال"
          description={`هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.`}
          onConfirm={() => remove.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
