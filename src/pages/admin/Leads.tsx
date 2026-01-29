import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  Users,
  Calendar,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const LEADS_PER_PAGE = 20;

type LeadStatus = "new" | "contacted" | "closed";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source_url: string | null;
  utm_data: Record<string, string> | null;
  created_at: string;
  status: LeadStatus | null;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "חדש",
  contacted: "נוצר קשר",
  closed: "סגור",
};

const STATUS_COLORS: Record<LeadStatus, "default" | "secondary" | "outline"> = {
  new: "default",
  contacted: "secondary",
  closed: "outline",
};

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case "today":
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case "week":
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case "year":
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      default:
        return null;
    }
  };

  // Fetch total count
  const { data: totalCount } = useQuery({
    queryKey: ["leads-count", searchQuery, dateFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("id", { count: "exact", head: true });

      const dateRange = getDateRange();
      if (dateRange) {
        query = query.gte("created_at", dateRange);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch leads with pagination
  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", searchQuery, dateFilter, statusFilter, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * LEADS_PER_PAGE;
      const to = from + LEADS_PER_PAGE - 1;

      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      const dateRange = getDateRange();
      if (dateRange) {
        query = query.gte("created_at", dateRange);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-count"] });
      toast.success("הסטטוס עודכן בהצלחה");
    },
    onError: () => {
      toast.error("שגיאה בעדכון הסטטוס");
    },
  });


  // Fetch all leads for export
  const exportToCSV = async () => {
    try {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      const dateRange = getDateRange();
      if (dateRange) {
        query = query.gte("created_at", dateRange);
      }

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("אין נתונים לייצוא");
        return;
      }

      // Create CSV content
      const headers = ["שם", "מייל", "טלפון", "סטטוס", "מקור", "UTM Source", "UTM Medium", "UTM Campaign", "תאריך"];
      const rows = data.map((lead: Lead) => {
        const utmData = lead.utm_data || {};
        return [
          lead.name,
          lead.email,
          lead.phone || "",
          STATUS_LABELS[(lead.status as LeadStatus) || "new"],
          lead.source_url || "",
          utmData.utm_source || "",
          utmData.utm_medium || "",
          utmData.utm_campaign || "",
          format(new Date(lead.created_at), "dd/MM/yyyy HH:mm"),
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Add BOM for Hebrew support in Excel
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`יוצאו ${data.length} לידים בהצלחה`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("שגיאה בייצוא הנתונים");
    }
  };

  const totalPages = totalCount ? Math.ceil(totalCount / LEADS_PER_PAGE) : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to page 1 when filters change
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              ניהול לידים
            </h1>
            <p className="text-muted-foreground mt-1">
              צפייה וניהול כל הפניות שהתקבלו
            </p>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" />
            ייצוא ל-CSV
          </Button>
        </div>

        {/* Stats Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">סה״כ לידים</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalCount ?? "..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">סינון וחיפוש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש לפי שם, מייל או טלפון..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <Calendar className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="תקופה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הזמנים</SelectItem>
                  <SelectItem value="today">היום</SelectItem>
                  <SelectItem value="week">שבוע אחרון</SelectItem>
                  <SelectItem value="month">חודש אחרון</SelectItem>
                  <SelectItem value="year">שנה אחרונה</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="new">חדש</SelectItem>
                  <SelectItem value="contacted">נוצר קשר</SelectItem>
                  <SelectItem value="closed">סגור</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : leads && leads.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">שם</TableHead>
                        <TableHead className="text-right">מייל</TableHead>
                        <TableHead className="text-right">טלפון</TableHead>
                        <TableHead className="text-right">סטטוס</TableHead>
                        <TableHead className="text-right">מקור</TableHead>
                        <TableHead className="text-right">UTM</TableHead>
                        <TableHead className="text-right">תאריך</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.name}
                          </TableCell>
                          <TableCell>
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex items-center gap-2 text-accent hover:underline"
                            >
                              <Mail className="w-4 h-4" />
                              {lead.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-2 text-accent hover:underline"
                              >
                                <Phone className="w-4 h-4" />
                                {lead.phone}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={lead.status || "new"}
                              onValueChange={(value) =>
                                updateStatusMutation.mutate({
                                  id: lead.id,
                                  status: value as LeadStatus,
                                })
                              }
                            >
                              <SelectTrigger className="w-28 h-8">
                                <Badge variant={STATUS_COLORS[(lead.status as LeadStatus) || "new"]}>
                                  {STATUS_LABELS[(lead.status as LeadStatus) || "new"]}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">חדש</SelectItem>
                                <SelectItem value="contacted">נוצר קשר</SelectItem>
                                <SelectItem value="closed">סגור</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {lead.source_url ? (
                              <a
                                href={lead.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent truncate max-w-[200px]"
                                title={lead.source_url}
                              >
                                <Globe className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {new URL(lead.source_url).pathname}
                                </span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.utm_data && Object.keys(lead.utm_data).length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {lead.utm_data.utm_source && (
                                  <Badge variant="secondary" className="text-xs">
                                    {lead.utm_data.utm_source}
                                  </Badge>
                                )}
                                {lead.utm_data.utm_medium && (
                                  <Badge variant="outline" className="text-xs">
                                    {lead.utm_data.utm_medium}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                            {format(new Date(lead.created_at), "dd/MM/yyyy")}
                            <br />
                            <span className="text-xs">
                              {format(new Date(lead.created_at), "HH:mm")}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <span className="text-sm text-muted-foreground px-4">
                      עמוד {currentPage} מתוך {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronLeft className="h-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  {searchQuery || dateFilter !== "all"
                    ? "לא נמצאו לידים התואמים לחיפוש"
                    : "עדיין אין לידים במערכת"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Leads;
