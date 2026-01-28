import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Copy, Check, Megaphone } from "lucide-react";

interface CTABlock {
  id: string;
  name: string;
  shortcut_code: string;
  headline: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  background_color: string;
  is_active: boolean;
  created_at: string;
}

const defaultFormData = {
  name: "",
  shortcut_code: "",
  headline: "",
  description: "",
  button_text: "",
  button_link: "",
  background_color: "#f59e0b",
  is_active: true,
};

const CTABlocks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<CTABlock | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch CTA blocks
  const { data: ctaBlocks, isLoading } = useQuery({
    queryKey: ["cta-blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cta_blocks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CTABlock[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("cta_blocks")
          .update({
            name: data.name,
            shortcut_code: data.shortcut_code,
            headline: data.headline || null,
            description: data.description || null,
            button_text: data.button_text || null,
            button_link: data.button_link || null,
            background_color: data.background_color,
            is_active: data.is_active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cta_blocks").insert({
          name: data.name,
          shortcut_code: data.shortcut_code,
          headline: data.headline || null,
          description: data.description || null,
          button_text: data.button_text || null,
          button_link: data.button_link || null,
          background_color: data.background_color,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cta-blocks"] });
      toast({ title: editingBlock ? "עודכן בהצלחה" : "נוצר בהצלחה" });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cta_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cta-blocks"] });
      toast({ title: "נמחק בהצלחה" });
    },
    onError: () => {
      toast({ title: "שגיאה במחיקה", variant: "destructive" });
    },
  });

  const handleEdit = (block: CTABlock) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      shortcut_code: block.shortcut_code,
      headline: block.headline || "",
      description: block.description || "",
      button_text: block.button_text || "",
      button_link: block.button_link || "",
      background_color: block.background_color,
      is_active: block.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBlock(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortcut_code.trim()) {
      toast({ title: "שם וקוד קיצור נדרשים", variant: "destructive" });
      return;
    }
    saveMutation.mutate(
      editingBlock ? { ...formData, id: editingBlock.id } : formData
    );
  };

  const handleCopyShortcode = (code: string) => {
    navigator.clipboard.writeText(`{{${code}}}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({ title: "הקוד הועתק" });
  };

  const generateShortcutCode = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[\u0590-\u05FF]+/g, "") // Remove Hebrew
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/_+/g, "_")
      .trim();
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
              <Megaphone className="w-7 h-7 text-accent" />
              פרסומות ו-CTA
            </h1>
            <p className="text-muted-foreground mt-1">
              צרו בלוקים שיווקיים לשימוש חוזר במאמרים
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={() => setFormData(defaultFormData)}>
                <Plus className="w-4 h-4" />
                CTA חדש
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingBlock ? "עריכת CTA" : "יצירת CTA חדש"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם הבלוק</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name,
                          shortcut_code: prev.shortcut_code || generateShortcutCode(name),
                        }));
                      }}
                      placeholder="מבצע רכב"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>קוד קיצור</Label>
                    <Input
                      value={formData.shortcut_code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shortcut_code: e.target.value,
                        }))
                      }
                      placeholder="car_deal"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>כותרת</Label>
                  <Input
                    value={formData.headline}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, headline: e.target.value }))
                    }
                    placeholder="חסכו עד 30% בביטוח רכב!"
                  />
                </div>

                <div className="space-y-2">
                  <Label>תיאור</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="השאירו פרטים וקבלו הצעת מחיר מותאמת אישית"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>טקסט כפתור</Label>
                    <Input
                      value={formData.button_text}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, button_text: e.target.value }))
                      }
                      placeholder="לפרטים נוספים"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>קישור כפתור</Label>
                    <Input
                      value={formData.button_link}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, button_link: e.target.value }))
                      }
                      placeholder="/contact"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>צבע רקע</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            background_color: e.target.value,
                          }))
                        }
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            background_color: e.target.value,
                          }))
                        }
                        dir="ltr"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>סטטוס</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, is_active: checked }))
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.is_active ? "פעיל" : "לא פעיל"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>תצוגה מקדימה</Label>
                  <div
                    className="rounded-lg p-6 text-white text-center"
                    style={{ backgroundColor: formData.background_color }}
                  >
                    {formData.headline && (
                      <h3 className="text-xl font-bold mb-2">{formData.headline}</h3>
                    )}
                    {formData.description && (
                      <p className="text-sm opacity-90 mb-4">{formData.description}</p>
                    )}
                    {formData.button_text && (
                      <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-medium">
                        {formData.button_text}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {editingBlock ? "שמירה" : "יצירה"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    ביטול
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : ctaBlocks?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>אין בלוקים שיווקיים עדיין</p>
                <p className="text-sm">צרו את הבלוק הראשון שלכם</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>קוד קיצור</TableHead>
                    <TableHead>כותרת</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead className="w-32">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ctaBlocks?.map((block) => (
                    <TableRow key={block.id}>
                      <TableCell className="font-medium">{block.name}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleCopyShortcode(block.shortcut_code)}
                          className="flex items-center gap-1 text-sm font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                        >
                          {copiedCode === block.shortcut_code ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {`{{${block.shortcut_code}}}`}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {block.headline || "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            block.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {block.is_active ? "פעיל" : "לא פעיל"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(block)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("האם למחוק את הבלוק?")) {
                                deleteMutation.mutate(block.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>איך להשתמש?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              1. צרו בלוק CTA חדש עם הטקסט והעיצוב הרצוי
            </p>
            <p>
              2. העתיקו את קוד הקיצור (לחצו על הקוד בטבלה)
            </p>
            <p>
              3. הדביקו את הקוד בתוכן המאמר במקום הרצוי
            </p>
            <p>
              4. הבלוק יוצג אוטומטית בעמוד המאמר הפומבי
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CTABlocks;
