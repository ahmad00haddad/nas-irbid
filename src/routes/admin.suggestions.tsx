import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Archive, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/admin/suggestions")({
  component: AdminSuggestions,
});

function AdminSuggestions() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guest_suggestions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("guest_suggestions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-suggestions"] });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
      toast.success("تم التحديث");
    },
  });

  const statuses: Record<string, { label: string; color: string }> = {
    new: { label: "جديد", color: "text-primary bg-primary/10" },
    contacted: { label: "تم التواصل", color: "text-blue-500 bg-blue-500/10" },
    approved: { label: "مقبول للتصوير", color: "text-green-500 bg-green-500/10" },
    rejected: { label: "غير مناسب", color: "text-muted-foreground bg-background/60" },
  };

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground mb-2">اقتراحات الجمهور</h1>
      <p className="text-sm text-muted-foreground mb-8">شخصيات رشّحها متابعو البرنامج.</p>

      {isLoading ? <p className="text-muted-foreground text-sm">جاري التحميل…</p> :
       data.length === 0 ? (
        <div className="text-center p-12 rounded-2xl bg-card border border-dashed border-border">
          <p className="text-muted-foreground">لا اقتراحات بعد.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((s: any) => {
            const st = statuses[s.status] ?? statuses.new;
            return (
              <div key={s.id} className="p-6 rounded-2xl bg-card border border-border/60">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                      {s.profession && <span className="text-xs text-muted-foreground">{s.profession}</span>}
                    </div>
                    <h3 className="font-display text-xl text-foreground">{s.candidate_name}</h3>
                    {s.neighborhood && (
                      <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                        <MapPin size={12} /> {s.neighborhood}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(s.created_at).toLocaleDateString("ar-JO")}
                  </div>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed mb-4 whitespace-pre-wrap">{s.story_summary}</p>

                {(s.submitter_name || s.contact_info) && (
                  <div className="text-xs text-muted-foreground border-t border-border/60 pt-3 mb-4 flex flex-wrap gap-x-4 gap-y-1">
                    {s.submitter_name && <span>المقترِح: {s.submitter_name}</span>}
                    {s.contact_info && <span className="inline-flex items-center gap-1"><Phone size={11} /> {s.contact_info}</span>}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(["contacted", "approved", "rejected"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus.mutate({ id: s.id, status: st })}
                      disabled={s.status === st}
                      className="px-3 py-1.5 rounded-full border border-border text-xs hover:border-primary/60 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {st === "contacted" && <><Phone size={11} className="inline ms-1" /> تم التواصل</>}
                      {st === "approved" && <><Check size={11} className="inline ms-1" /> مقبول</>}
                      {st === "rejected" && <><X size={11} className="inline ms-1" /> غير مناسب</>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
