import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Users, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [articlesResult, leadsResult, viewsResult, publishedResult] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact" }),
        supabase.from("leads").select("id", { count: "exact" }),
        supabase.from("article_views").select("id", { count: "exact" }),
        supabase.from("articles").select("id", { count: "exact" }).eq("is_published", true),
      ]);

      return {
        totalArticles: articlesResult.count || 0,
        publishedArticles: publishedResult.count || 0,
        totalLeads: leadsResult.count || 0,
        totalViews: viewsResult.count || 0,
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

  const { data: recentLeads } = useQuery({
    queryKey: ["admin-recent-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const statCards = [
    {
      title: "סה״כ מאמרים",
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "מאמרים מפורסמים",
      value: stats?.publishedArticles || 0,
      icon: Eye,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "לידים",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "צפיות",
      value: stats?.totalViews || 0,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            לוח בקרה
          </h1>
          <p className="text-muted-foreground mt-1">
            סקירה כללית של האתר והפעילות
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">מאמרים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              {recentArticles && recentArticles.length > 0 ? (
                <div className="space-y-4">
                  {recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground truncate max-w-xs">
                          {article.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(article.created_at), "d בMMM yyyy", { locale: he })}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          article.is_published
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {article.is_published ? "מפורסם" : "טיוטה"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">אין מאמרים עדיין</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">לידים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLeads && recentLeads.length > 0 ? (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(lead.created_at), "d בMMM", { locale: he })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">אין לידים עדיין</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
