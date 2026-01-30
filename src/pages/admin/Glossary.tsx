import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GlossaryTerm {
  id: string;
  term_name: string;
  slug: string;
  definition_rich_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const Glossary = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [formData, setFormData] = useState({
    term_name: "",
    slug: "",
    definition_rich_text: "",
    seo_title: "",
    seo_description: "",
  });

  const { data: terms, isLoading } = useQuery({
    queryKey: ["glossary-terms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("*")
        .order("term_name");
      if (error) throw error;
      return data as GlossaryTerm[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingTerm) {
        const { error } = await supabase
          .from("glossary_terms")
          .update(data)
          .eq("id", editingTerm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("glossary_terms").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["glossary-terms"] });
      toast.success(editingTerm ? "המונח עודכן בהצלחה" : "המונח נוסף בהצלחה");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error("שגיאה בשמירה: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("glossary_terms")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["glossary-terms"] });
      toast.success("המונח נמחק בהצלחה");
    },
    onError: (error: Error) => {
      toast.error("שגיאה במחיקה: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      term_name: "",
      slug: "",
      definition_rich_text: "",
      seo_title: "",
      seo_description: "",
    });
    setEditingTerm(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (term: GlossaryTerm) => {
    setEditingTerm(term);
    setFormData({
      term_name: term.term_name,
      slug: term.slug,
      definition_rich_text: term.definition_rich_text || "",
      seo_title: term.seo_title || "",
      seo_description: term.seo_description || "",
    });
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\u0590-\u05FF\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      term_name: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.term_name.trim() || !formData.slug.trim()) {
      toast.error("שם המונח וה-Slug הם שדות חובה");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              מילון מונחים
            </h1>
            <p className="text-muted-foreground">
              ניהול מונחי המילון הפיננסי
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 ml-2" />
                מונח חדש
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTerm ? "עריכת מונח" : "הוספת מונח חדש"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="term_name">שם המונח *</Label>
                    <Input
                      id="term_name"
                      value={formData.term_name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="לדוגמא: מקדם קיצבה"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="mekadem-kizba"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="definition">הגדרה</Label>
                  <Textarea
                    id="definition"
                    value={formData.definition_rich_text}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        definition_rich_text: e.target.value,
                      }))
                    }
                    placeholder="הכנס הגדרה מלאה של המונח..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title">כותרת SEO</Label>
                    <Input
                      id="seo_title"
                      value={formData.seo_title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          seo_title: e.target.value,
                        }))
                      }
                      placeholder="כותרת לגוגל"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo_description">תיאור SEO</Label>
                    <Input
                      id="seo_description"
                      value={formData.seo_description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          seo_description: e.target.value,
                        }))
                      }
                      placeholder="תיאור קצר לגוגל"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    ביטול
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    )}
                    {editingTerm ? "עדכון" : "הוספה"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם המונח</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>הגדרה (תקציר)</TableHead>
                  <TableHead className="w-[100px]">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terms?.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">
                      {term.term_name}
                    </TableCell>
                    <TableCell dir="ltr" className="text-muted-foreground">
                      {term.slug}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {term.definition_rich_text?.slice(0, 80)}
                      {(term.definition_rich_text?.length || 0) > 80 && "..."}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(term)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("למחוק את המונח?")) {
                              deleteMutation.mutate(term.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {terms?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      אין מונחים במילון. הוסף את המונח הראשון.
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

export default Glossary;
