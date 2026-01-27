import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";

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

const trackTypes = ["קרן השתלמות", "גמל", "פנסיה", "קופת גמל להשקעה"];
const providers = ["הראל", "מגדל", "מנורה", "כלל", "הפניקס", "אלטשולר", "מיטב"];

const emptyTrack = {
  name: "",
  provider: "",
  type: "",
  ytd_return: "",
  last_year_return: "",
  management_fee: "",
};

const FinancialTracks = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<FinancialTrack | null>(null);
  const [formData, setFormData] = useState(emptyTrack);

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["admin-financial-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_tracks")
        .select("*")
        .order("provider", { ascending: true });

      if (error) throw error;
      return data as FinancialTrack[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        name: data.name,
        provider: data.provider,
        type: data.type,
        ytd_return: data.ytd_return ? parseFloat(data.ytd_return) : null,
        last_year_return: data.last_year_return
          ? parseFloat(data.last_year_return)
          : null,
        management_fee: data.management_fee
          ? parseFloat(data.management_fee)
          : null,
        last_updated: new Date().toISOString(),
      };

      if (data.id) {
        const { error } = await supabase
          .from("financial_tracks")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("financial_tracks").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-financial-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["financial-tracks"] });
      toast.success(editingTrack ? "המסלול עודכן בהצלחה" : "המסלול נוסף בהצלחה");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("שגיאה בשמירת המסלול");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_tracks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-financial-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["financial-tracks"] });
      toast.success("המסלול נמחק בהצלחה");
    },
    onError: () => {
      toast.error("שגיאה במחיקת המסלול");
    },
  });

  const handleEdit = (track: FinancialTrack) => {
    setEditingTrack(track);
    setFormData({
      name: track.name,
      provider: track.provider,
      type: track.type,
      ytd_return: track.ytd_return?.toString() || "",
      last_year_return: track.last_year_return?.toString() || "",
      management_fee: track.management_fee?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTrack(null);
    setFormData(emptyTrack);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.provider || !formData.type) {
      toast.error("יש למלא את כל השדות הנדרשים");
      return;
    }
    saveMutation.mutate({
      ...formData,
      id: editingTrack?.id,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">ניהול מסלולי השקעה</h1>
            <p className="text-muted-foreground">
              עדכן את נתוני המסלולים שמוצגים בטבלת ההשוואה
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData(emptyTrack)}>
                <Plus className="w-4 h-4 ml-2" />
                הוסף מסלול
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right font-display">
                  {editingTrack ? "עריכת מסלול" : "הוספת מסלול חדש"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">שם המסלול *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="לדוגמה: S&P 500 מחקה"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ספק *</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) =>
                      setFormData({ ...formData, provider: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר ספק" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>סוג *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג" />
                    </SelectTrigger>
                    <SelectContent>
                      {trackTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="ytd">תשואה YTD %</Label>
                    <Input
                      id="ytd"
                      type="number"
                      step="0.01"
                      value={formData.ytd_return}
                      onChange={(e) =>
                        setFormData({ ...formData, ytd_return: e.target.value })
                      }
                      placeholder="18.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">12 חודשים %</Label>
                    <Input
                      id="year"
                      type="number"
                      step="0.01"
                      value={formData.last_year_return}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          last_year_return: e.target.value,
                        })
                      }
                      placeholder="24.3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee">דמי ניהול %</Label>
                    <Input
                      id="fee"
                      type="number"
                      step="0.01"
                      value={formData.management_fee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          management_fee: e.target.value,
                        })
                      }
                      placeholder="0.52"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={saveMutation.isPending}
                  >
                    <Save className="w-4 h-4 ml-2" />
                    {saveMutation.isPending ? "שומר..." : "שמור"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    <X className="w-4 h-4 ml-2" />
                    ביטול
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">ספק</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">YTD</TableHead>
                  <TableHead className="text-right">12 חודשים</TableHead>
                  <TableHead className="text-right">דמי ניהול</TableHead>
                  <TableHead className="text-center">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell className="font-medium">{track.name}</TableCell>
                    <TableCell>{track.provider}</TableCell>
                    <TableCell>{track.type}</TableCell>
                    <TableCell>
                      {track.ytd_return !== null
                        ? `${track.ytd_return.toFixed(2)}%`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {track.last_year_return !== null
                        ? `${track.last_year_return.toFixed(2)}%`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {track.management_fee !== null
                        ? `${track.management_fee.toFixed(2)}%`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(track)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("האם למחוק את המסלול?")) {
                              deleteMutation.mutate(track.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tracks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        אין מסלולים. לחץ על "הוסף מסלול" כדי להתחיל.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FinancialTracks;
