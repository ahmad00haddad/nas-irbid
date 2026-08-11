import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  Users,
  MousePointerClick,
  Activity,
  Loader2,
  ArrowUpRight,
  Share2,
  Heart,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [{ title: "الإحصائيات · إدارة ناس إربد" }],
  }),
});

function formatPathname(path: string) {
  if (path === "/") return "الرئيسية";
  if (path === "/about") return "عن البرنامج";
  if (path === "/contact") return "تواصل معنا";
  if (path === "/suggest") return "اقترح حكاية";
  if (path === "/ask") return "اسأل الضيف";
  if (path === "/episodes") return "كافة الحلقات";
  if (path.startsWith("/episodes/"))
    return `حلقة: ${decodeURIComponent(path.replace("/episodes/", "").replace(/-/g, " "))}`;
  return path;
}

function AnalyticsPage() {
  const queryClient = useQueryClient();

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["site-analytics"],
    queryFn: async () => {
      const { data: allEvents, error } = await supabase
        .from("site_analytics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Exclude only dev/preview traffic (Lovable editor preview, localhost)
      const isInternal = (e: (typeof allEvents)[number]) => {
        const d = (e.details ?? {}) as Record<string, string>;
        const blob = `${d.source ?? ""} ${d.referrer ?? ""}`.toLowerCase();
        return (
          blob.includes("lovableproject.com") ||
          blob.includes("id-preview") ||
          blob.includes("localhost") ||
          e.path.startsWith("/admin") ||
          e.path.startsWith("/auth")
        );
      };
      const rawEvents = allEvents.filter((e) => !isInternal(e));

      const views = rawEvents.filter((e) => e.event_type === "page_view");
      const ctaClicks = rawEvents.filter((e) => e.event_type === "cta_click");
      const formSubmits = rawEvents.filter((e) => e.event_type === "form_submitted");

      const totalViews = views.length;
      const uniqueSessions = new Set(views.map((v) => v.session_id)).size;

      // Sources
      const sourceCounts: Record<string, number> = {};
      views.forEach((v) => {
        const source = (v.details as Record<string, string>)?.source || "Unknown";
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
      const topSources = Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

      // Top Pages
      const pageCounts: Record<string, number> = {};
      views.forEach((v) => {
        pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Recent Activity
      const recentActivity = rawEvents.slice(0, 20);

      return {
        totalViews,
        uniqueSessions,
        topSources,
        topPages,
        recentActivity,
        conversions: {
          supportClicks: ctaClicks.length,
          formSubmits: formSubmits.length,
        },
      };
    },
    refetchInterval: 30000,
  });

  const cleanMutation = useMutation({
    mutationFn: async () => {
      // Delete all logs to reset analytics to zero (e.g. before launch)
      const { error } = await supabase
        .from("site_analytics")
        .delete()
        .not("id", "is", null);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تصفير البيانات", {
        description: "تم مسح جميع الإحصائيات وتصفيرها بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ["site-analytics"] });
    },
    onError: (err: Error) => {
      toast.error("حدث خطأ", { description: err.message });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-display text-foreground">إحصائيات الموقع (أداة القرارات)</h1>
        <Button
          variant="outline"
          onClick={() => {
            if (
              confirm(
                "تحذير هام: هل أنت متأكد من تصفير الإحصائيات بالكامل؟ سيتم مسح جميع البيانات ولن يمكنك التراجع.",
              )
            ) {
              cleanMutation.mutate();
            }
          }}
          disabled={cleanMutation.isPending}
          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <Trash2 size={16} className="ml-2" />
          تصفير الإحصائيات بالكامل
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin ml-2" size={24} /> جاري جلب وتحليل الإحصائيات...
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl font-semibold border border-destructive/20">
          تعذّر جلب الإحصائيات. تأكد من إعداد جدول site_analytics في قاعدة البيانات.
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الزيارات"
              value={stats.totalViews.toString()}
              icon={<MousePointerClick size={22} />}
              trend="مشاهدات صفحات"
            />
            <StatCard
              title="الزوار الفعليون"
              value={stats.uniqueSessions.toString()}
              icon={<Users size={22} />}
              trend="أشخاص مختلفين"
            />
            <StatCard
              title="ضغطات 'ادعم البرنامج'"
              value={stats.conversions.supportClicks.toString()}
              icon={<Heart size={22} />}
              trend="تحويلات"
            />
            <StatCard
              title="النماذج المرسلة"
              value={stats.conversions.formSubmits.toString()}
              icon={<CheckCircle2 size={22} />}
              trend="تفاعل الجمهور"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 pt-4">
            {/* Top Pages */}
            <div className="lg:col-span-1 space-y-6">
              {/* Traffic Sources */}
              <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                  <Share2 size={18} className="text-primary" />
                  مصادر الزيارات (من أين أتوا؟)
                </h3>
                <div className="space-y-4">
                  {stats.topSources.length === 0 ? (
                    <p className="text-muted-foreground text-sm">لا توجد بيانات بعد.</p>
                  ) : (
                    stats.topSources.map(([source, count]) => (
                      <div key={source} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{source}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.max(5, (count / stats.totalViews) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" />
                  الصفحات الأكثر زيارة
                </h3>
                <div className="space-y-4">
                  {stats.topPages.length === 0 ? (
                    <p className="text-muted-foreground text-sm">لا توجد بيانات بعد.</p>
                  ) : (
                    stats.topPages.map(([path, count], i) => (
                      <div key={path} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground font-mono text-sm w-4">
                            {i + 1}.
                          </span>
                          <span
                            className="text-sm font-medium text-foreground truncate max-w-[150px] md:max-w-[200px]"
                            dir="ltr"
                          >
                            {formatPathname(path)}
                          </span>
                        </div>
                        <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                          {count} زيارة
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                شريط النشاط الحي
              </h3>

              <div className="space-y-3">
                {stats.recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-sm">لا توجد نشاطات مسجلة.</p>
                ) : (
                  stats.recentActivity.map((activity) => {
                    const isConversion = activity.event_type !== "page_view";
                    return (
                      <div
                        key={activity.id}
                        className={`flex flex-wrap md:flex-nowrap items-center justify-between p-3 rounded-xl transition-colors border gap-3 ${isConversion ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50 border-transparent hover:border-border/50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${isConversion ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                          >
                            {activity.event_type === "cta_click" ? (
                              <Heart size={14} />
                            ) : activity.event_type === "form_submitted" ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Users size={14} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {activity.event_type === "cta_click" ? (
                                'زائر ضغط على "ادعم البرنامج"'
                              ) : activity.event_type === "form_submitted" ? (
                                `زائر قام بتعبئة نموذج ${formatPathname(activity.path)}`
                              ) : (
                                <>
                                  زائر تصفح{" "}
                                  <span className="font-semibold text-primary">
                                    {formatPathname(activity.path)}
                                  </span>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                              <span>
                                المصدر: {(activity.details as Record<string, string>)?.source || "غير معروف"}
                              </span>
                              <span className="opacity-50">|</span>
                              <span className="font-mono text-[10px]">
                                {(activity.session_id || "").substring(0, 8)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(activity.created_at).toLocaleString("ar-JO")}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-muted-foreground font-semibold text-sm">{title}</div>
        <div className="text-primary/70 bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div className="font-display text-4xl text-foreground font-bold">{value}</div>
        {trend && (
          <div className="text-xs font-semibold text-emerald-500 mb-1.5 flex items-center gap-0.5">
            <ArrowUpRight size={14} /> {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}
