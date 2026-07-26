import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, MousePointerClick, Activity, Loader2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [{ title: "الإحصائيات · إدارة ناس إربد" }],
  }),
});

function AnalyticsPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["site-analytics"],
    queryFn: async () => {
      // Get all page views
      const { data: views, error: viewsError } = await supabase
        .from("site_analytics")
        .select("*")
        .eq("event_type", "page_view")
        .order("created_at", { ascending: false });

      if (viewsError) throw viewsError;

      const totalViews = views.length;
      
      // Calculate unique visitors (by session_id)
      const uniqueSessions = new Set(views.map(v => v.session_id)).size;

      // Calculate top pages
      const pageCounts: Record<string, number> = {};
      views.forEach(v => {
        pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Recent activity (last 20)
      const recentActivity = views.slice(0, 20);

      return {
        totalViews,
        uniqueSessions,
        topPages,
        recentActivity
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display text-foreground">إحصائيات الموقع</h1>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin ml-2" size={24} /> جاري جلب الإحصائيات...
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
              title="إجمالي الزيارات (مرات فتح الصفحات)" 
              value={stats.totalViews.toString()} 
              icon={<MousePointerClick size={22} />} 
              trend="+ مستمر"
            />
            <StatCard 
              title="الزوار الفريدين (أجهزة مختلفة)" 
              value={stats.uniqueSessions.toString()} 
              icon={<Users size={22} />}
              trend="الفعلي"
            />
            <StatCard 
              title="الصفحات النشطة" 
              value={stats.topPages.length.toString()} 
              icon={<Activity size={22} />}
            />
            <StatCard 
              title="معدل الزيارات للزائر" 
              value={stats.uniqueSessions ? (stats.totalViews / stats.uniqueSessions).toFixed(1) : "0"} 
              icon={<BarChart3 size={22} />}
              trend="صفحة / زائر"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 pt-4">
            {/* Top Pages */}
            <div className="lg:col-span-1 bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
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
                        <span className="text-muted-foreground font-mono text-sm w-4">{i + 1}.</span>
                        <span className="text-sm font-medium text-foreground truncate max-w-[150px] md:max-w-[200px]" dir="ltr">{path === '/' ? '/ (الرئيسية)' : path}</span>
                      </div>
                      <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-xs">{count} زيارة</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                سجل النشاط الأخير
              </h3>
              
              <div className="space-y-3">
                {stats.recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-sm">لا توجد بيانات بعد.</p>
                ) : (
                  stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex flex-wrap md:flex-nowrap items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors border border-transparent hover:border-border/50 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            زائر تصفح <span className="font-mono text-xs text-primary" dir="ltr">{activity.path}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            الجلسة: <span className="font-mono text-[10px]">{activity.session_id.substring(0, 8)}...</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(activity.created_at).toLocaleString('ar-JO')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
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
