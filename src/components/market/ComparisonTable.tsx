import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LeadForm from "@/components/LeadForm";

type SortField = "ytd_return" | "last_year_return" | "management_fee" | "name";
type SortDirection = "asc" | "desc";

interface FinancialTrack {
  id: string;
  name: string;
  provider: string;
  type: string;
  ytd_return: number | null;
  last_year_return: number | null;
  management_fee: number | null;
  last_updated: string;
}

const providerColors: Record<string, string> = {
  "הראל": "bg-blue-100 text-blue-800 border-blue-200",
  "מגדל": "bg-purple-100 text-purple-800 border-purple-200",
  "מנורה": "bg-orange-100 text-orange-800 border-orange-200",
  "כלל": "bg-green-100 text-green-800 border-green-200",
  "הפניקס": "bg-red-100 text-red-800 border-red-200",
  "אלטשולר": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "מיטב": "bg-indigo-100 text-indigo-800 border-indigo-200",
};

const ComparisonTable = () => {
  const [sortField, setSortField] = useState<SortField>("ytd_return");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["financial-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_tracks")
        .select("*")
        .order("ytd_return", { ascending: false });

      if (error) throw error;
      return data as FinancialTrack[];
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleCheckEligibility = (trackName: string) => {
    setSelectedTrack(trackName);
    setIsDialogOpen(true);
  };

  const uniqueTypes = [...new Set(tracks.map((t) => t.type))];

  const filteredTracks = tracks.filter(
    (track) => filterType === "all" || track.type === filterType
  );

  const sortedTracks = [...filteredTracks].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal, "he")
        : bVal.localeCompare(aVal, "he");
    }

    return sortDirection === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const formatReturn = (value: number | null) => {
    if (value === null) return "—";
    const isPositive = value >= 0;
    return (
      <span
        className={`font-semibold flex items-center gap-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        {isPositive ? "+" : ""}
        {value.toFixed(2)}%
      </span>
    );
  };

  const getProviderBadgeClass = (provider: string) => {
    return providerColors[provider] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown
        className={`w-4 h-4 ${
          sortField === field ? "text-accent" : "text-muted-foreground"
        }`}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <section className="py-10">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            השוואת מסלולי השקעה
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            השוו בין מסלולי ההשקעה המובילים וגלו איזה מסלול מתאים לכם
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            הכל
          </Button>
          {uniqueTypes.map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              {type}
            </Button>
          ))}
        </div>

        <div className="bg-card rounded-xl shadow-medium overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">
                    <SortButton field="name">שם המסלול</SortButton>
                  </TableHead>
                  <TableHead className="text-right">ספק</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">
                    <SortButton field="ytd_return">תשואה שנתית</SortButton>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="last_year_return">12 חודשים</SortButton>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="management_fee">דמי ניהול</SortButton>
                  </TableHead>
                  <TableHead className="text-center">פעולה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTracks.map((track, index) => (
                  <TableRow
                    key={track.id}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                  >
                    <TableCell className="font-medium">{track.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getProviderBadgeClass(track.provider)}
                      >
                        {track.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {track.type}
                    </TableCell>
                    <TableCell>{formatReturn(track.ytd_return)}</TableCell>
                    <TableCell>{formatReturn(track.last_year_return)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {track.management_fee !== null
                        ? `${track.management_fee.toFixed(2)}%`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() =>
                          handleCheckEligibility(
                            `${track.name} - ${track.provider}`
                          )
                        }
                      >
                        בדוק זכאות
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="px-4 py-3 bg-muted/30 border-t border-border text-xs text-muted-foreground text-center">
            עודכן לאחרונה:{" "}
            {tracks[0]?.last_updated
              ? new Date(tracks[0].last_updated).toLocaleDateString("he-IL")
              : "—"}
          </div>
        </div>

        {/* Lead Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right font-display">
                בדיקת זכאות - {selectedTrack}
              </DialogTitle>
            </DialogHeader>
            <LeadForm
              prefilledContext={selectedTrack || undefined}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ComparisonTable;
