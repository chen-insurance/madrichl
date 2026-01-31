import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Users, TrendingUp, Loader2, UserPlus, BarChart3, Clock } from "lucide-react";
import { format, startOfToday } from "date-fns";
import { he } from "date-fns/locale";
import ContentPerformanceWidget from "@/components/admin/ContentPerformanceWidget";
import RecentLeadsWidget from "@/components/admin/RecentLeadsWidget";

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const todayStart = startOfToday().toISOString();
      
      const [articlesResult, leadsResult, viewsResult, publishedResult, leadsToday] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact" }),
        supabase.from("leads").select("id", { count: "exact" }),
        supabase.from("article_views").select("id", { count: "exact" }),
        supabase.from("articles").select("id", { count: "exact" }).eq("is_published", true),
        supabase.from("leads").select("id", { count: "exact" }).gte("created_at", todayStart),
      ]);

      return {
        totalArticles: articlesResult.count || 0,
        publishedArticles: publishedResult.count || 0,
        totalLeads: leadsResult.count || 0,
        totalViews: viewsResult.count || 0,
        leadsToday: leadsToday.count || 0,
      };
    },
  });

  const { data: recentArticles } = useQuery({
    queryKey: ["admin-recent-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, is_published, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const statCards = [
    {
      title: "לידים היום",
      value: stats?.leadsToday || 0,
      icon: UserPlus,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "מאמרים פעילים",
      value: stats?.publishedArticles || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "סה״כ לידים",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-violet-600",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "צפיות (7 ימים)",
      value: stats?.totalViews || 0,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              לוח בקרה
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              עודכן לאחרונה: {format(new Date(), "HH:mm", { locale: he })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card 
                key={stat.title} 
                className={`bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow ${index === 0 ? 'ring-2 ring-emerald-500/20' : ''}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value.toLocaleString()}
                        </p>
                        {stat.trend && (
                          <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stat.trend}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Articles */}
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                מאמרים אחרונים
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentArticles && recentArticles.length > 0 ? (
                <div className="space-y-1">
                  {recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors -mx-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">
                          {article.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(article.created_at), "d בMMM yyyy", { locale: he })}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 mr-3 ${
                          article.is_published
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {article.is_published ? "מפורסם" : "טיוטה"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">אין מאמרים עדיין</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads Widget */}
          <RecentLeadsWidget />
        </div>

        {/* Content Performance Widget */}
        <ContentPerformanceWidget />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
