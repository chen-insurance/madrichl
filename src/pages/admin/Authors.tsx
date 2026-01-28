import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Users } from "lucide-react";

interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
  slug: string | null;
}

const Authors = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar_url: "",
    role: "כותב",
    slug: "",
  });

  const { data: authors, isLoading } = useQuery({
    queryKey: ["authors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("authors")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Author[];
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[\u0590-\u05FF]+/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formData.name,
        bio: formData.bio || null,
        avatar_url: formData.avatar_url || null,
        role: formData.role || null,
        slug: formData.slug || generateSlug(formData.name),
      };

      if (editingAuthor) {
        const { error } = await supabase
          .from("authors")
          .update(payload)
          .eq("id", editingAuthor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("authors").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      toast.success(editingAuthor ? "הכותב עודכן" : "הכותב נוסף בהצלחה");
      resetForm();
    },
    onError: () => {
      toast.error("שגיאה בשמירת הכותב");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("authors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      toast.success("הכותב נמחק");
    },
    onError: () => {
      toast.error("שגיאה במחיקת הכותב");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", bio: "", avatar_url: "", role: "כותב", slug: "" });
    setEditingAuthor(null);
    setIsDialogOpen(false);
  };

  const openEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      bio: author.bio || "",
      avatar_url: author.avatar_url || "",
      role: author.role || "כותב",
      slug: author.slug || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              ניהול כותבים
            </h1>
            <p className="text-muted-foreground mt-1">
              נהל את צוות הכותבים לצורך E-E-A-T
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4" />
                כותב חדש
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAuthor ? "עריכת כותב" : "כותב חדש"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>שם</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="שם הכותב"
                  />
                </div>
                <div className="space-y-2">
                  <Label>תפקיד</Label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                    placeholder="כותב / עורך / מומחה"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ביוגרפיה</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="תיאור קצר של הכותב"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>תמונה (URL)</Label>
                  <Input
                    value={formData.avatar_url}
                    onChange={(e) => setFormData((p) => ({ ...p, avatar_url: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (לכתובת URL)</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="author-name"
                    dir="ltr"
                  />
                </div>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !formData.name}
                  className="w-full"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingAuthor ? "עדכון" : "הוספה"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : authors && authors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">כותב</TableHead>
                    <TableHead className="text-right">תפקיד</TableHead>
                    <TableHead className="text-right w-24">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authors.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={author.avatar_url || undefined} />
                            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{author.name}</p>
                            {author.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {author.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{author.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(author)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("למחוק את הכותב?")) {
                                deleteMutation.mutate(author.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">אין כותבים עדיין</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Authors;
