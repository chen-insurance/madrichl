import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const RecentLeadsWidget = () => {
  const { toast } = useToast();

  const { data: recentLeads, isLoading } = useQuery({
    queryKey: ["admin-recent-leads-widget"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, email, phone, source_url, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const handleExportCSV = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("name, email, phone, source_url, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "אין נתונים",
          description: "אין לידים לייצוא",
          variant: "destructive",
        });
        return;
      }

      // Create CSV content with BOM for Hebrew support
      const headers = ["שם", "אימייל", "טלפון", "מקור", "תאריך"];
      const csvContent = [
        headers.join(","),
        ...data.map((lead) =>
          [
            `"${lead.name || ""}"`,
            `"${lead.email || ""}"`,
            `"${lead.phone || ""}"`,
            `"${lead.source_url || ""}"`,
            `"${format(new Date(lead.created_at), "yyyy-MM-dd HH:mm")}"`,
          ].join(",")
        ),
      ].join("\n");

      // Add BOM for UTF-8
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "הייצוא הצליח",
        description: `${data.length} לידים יוצאו בהצלחה`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בייצוא הלידים",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">לידים אחרונים</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            ייצוא CSV
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/leads" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              הכל
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : recentLeads && recentLeads.length > 0 ? (
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between py-3 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">
                    {lead.name || "ללא שם"}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="truncate">{lead.email}</span>
                    {lead.phone && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline" dir="ltr">{lead.phone}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-left shrink-0 mr-4">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(lead.created_at), "d בMMM", { locale: he })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(lead.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">אין לידים עדיין</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              לידים חדשים יופיעו כאן
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentLeadsWidget;
