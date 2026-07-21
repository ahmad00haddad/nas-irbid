import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineError } from "@/components/ui/error-state";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const qc = useQueryClient();
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mark = useMutation({
    mutationFn: async ({ id, handled }: { id: string; handled: boolean }) => {
      const { error } = await supabase.from("contact_messages").update({ handled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground mb-2">الرسائل</h1>
      <p className="text-sm text-muted-foreground mb-8">رسائل الدعم والتواصل من الزوّار.</p>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <InlineError message="تعذّر تحميل الرسائل." onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <div className="text-center p-12 rounded-2xl bg-card border border-dashed border-border"><p className="text-muted-foreground">لا رسائل بعد.</p></div>
      ) : (
        <div className="space-y-4">
          {data.map((m: any) => (
            <div key={m.id} className={`p-6 rounded-2xl bg-card border ${m.handled ? "border-border/60 opacity-60" : "border-primary/40"}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-bold tracking-widest">
                    <span className={m.handled ? "text-muted-foreground" : "text-primary"}>{m.handled ? "مُعالجة" : "جديدة"}</span>
                    <span className="text-muted-foreground">· {m.message_type}</span>
                  </div>
                  <h3 className="font-display text-lg text-foreground">{m.subject ?? "(بدون عنوان)"}</h3>
                </div>
                <div className="text-[11px] text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleDateString("ar-JO")}</div>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-4">{m.message}</p>

              <div className="text-xs text-muted-foreground border-t border-border/60 pt-3 mb-4 flex flex-wrap gap-x-4 gap-y-1">
                <span>المرسِل: {m.name}</span>
                {m.email && <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail size={11} /> {m.email}</a>}
                {m.phone && <span className="inline-flex items-center gap-1"><Phone size={11} /> {m.phone}</span>}
              </div>

              <button
                onClick={() => mark.mutate({ id: m.id, handled: !m.handled })}
                className="px-3 py-1.5 rounded-full border border-border text-xs hover:border-primary"
              >
                <Check size={11} className="inline ms-1" /> {m.handled ? "إعادة فتح" : "تمييز كمُعالجة"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
