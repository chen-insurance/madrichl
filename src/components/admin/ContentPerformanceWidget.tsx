import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, Clock, Percent } from "lucide-react";

interface ArticlePerformance {
  id: string;
  title: string;
  total_views: number;
  avg_time_on_page: number;
  finish_rate: number;
}

const ContentPerformanceWidget = () => {
  const { data: performance, isLoading } = useQuery({
    queryKey: ["content-performance"],
    queryFn: async () => {
      // Get all articles with their view counts
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("id, title, view_count")
        .eq("is_published", true)
        .order("view_count", { ascending: false })
        .limit(10);

      if (articlesError) throw articlesError;
      if (!articles || articles.length === 0) return [];

      // Get analytics events for these articles
      const articleIds = articles.map(a => a.id);
      const { data: events, error: eventsError } = await supabase
        .from("analytics_events")
        .select("article_id, event_type, value")
        .in("article_id", articleIds);

      if (eventsError) throw eventsError;

      // Process analytics data per article
      const performanceData: ArticlePerformance[] = articles.map(article => {
        const articleEvents = events?.filter(e => e.article_id === article.id) || [];
        
        // Calculate average time on page
        const timeEvents = articleEvents.filter(e => e.event_type === "time_on_page");
        const avgTime = timeEvents.length > 0
          ? timeEvents.reduce((sum, e) => sum + (e.value || 0), 0) / timeEvents.length
          : 0;

        // Calculate finish rate (scroll depth >= 80%)
        const scrollEvents = articleEvents.filter(e => e.event_type === "scroll_depth");
        const uniqueSessions = new Set(scrollEvents.map(e => e.article_id)).size || 1;
        const finishedCount = scrollEvents.filter(e => (e.value || 0) >= 80).length;
        const finishRate = uniqueSessions > 0 ? (finishedCount / uniqueSessions) * 100 : 0;

        return {
          id: article.id,
          title: article.title,
          total_views: article.view_count || 0,
          avg_time_on_page: Math.round(avgTime),
          finish_rate: Math.min(100, Math.round(finishRate)),
        };
      });

      return performanceData;
    },
  });

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} שניות`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")} דק׳`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          ביצועי תוכן
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : performance && performance.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">כותרת</TableHead>
                  <TableHead className="text-center">צפיות</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      זמן ממוצע
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Percent className="w-4 h-4" />
                      שיעור סיום
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {article.title}
                    </TableCell>
                    <TableCell className="text-center">
                      {article.total_views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {article.avg_time_on_page > 0 
                        ? formatTime(article.avg_time_on_page)
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      {article.finish_rate > 0 ? (
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          article.finish_rate >= 70 
                            ? "bg-green-500/10 text-green-500"
                            : article.finish_rate >= 40
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {article.finish_rate}%
                        </span>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            אין נתוני ביצועים עדיין
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentPerformanceWidget;
