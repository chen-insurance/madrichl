import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft, Link2 } from "lucide-react";
import { format } from "date-fns";

interface Redirect {
  id: string;
  old_slug: string;
  new_slug: string;
  is_active: boolean;
  created_at: string;
}

const Redirects = () => {
  const queryClient = useQueryClient();
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");

  const { data: redirects, isLoading } = useQuery({
    queryKey: ["redirects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("redirects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Redirect[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("redirects").insert({
        old_slug: newFrom.startsWith("/") ? newFrom.slice(1) : newFrom,
        new_slug: newTo.startsWith("/") ? newTo.slice(1) : newTo,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
      toast.success("הפנייה נוספה בהצלחה");
      setNewFrom("");
      setNewTo("");
    },
    onError: () => {
      toast.error("שגיאה בהוספת ההפנייה");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("redirects")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("redirects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
      toast.success("ההפנייה נמחקה");
    },
    onError: () => {
      toast.error("שגיאה במחיקת ההפנייה");
    },
  });

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            ניהול הפניות (301 Redirects)
          </h1>
          <p className="text-muted-foreground mt-1">
            הגן על ה-SEO בעזרת הפניות אוטומטיות מכתובות ישנות לחדשות
          </p>
        </div>

        {/* Add New Redirect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              הוסף הפנייה חדשה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>מכתובת (From)</Label>
                <Input
                  value={newFrom}
                  onChange={(e) => setNewFrom(e.target.value)}
                  placeholder="/old-page-slug"
                  dir="ltr"
                />
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground hidden sm:block" />
              <div className="flex-1 space-y-2">
                <Label>לכתובת (To)</Label>
                <Input
                  value={newTo}
                  onChange={(e) => setNewTo(e.target.value)}
                  placeholder="/new-page-slug"
                  dir="ltr"
                />
              </div>
              <Button
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isPending || !newFrom || !newTo}
              >
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                הוסף
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Redirects List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : redirects && redirects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">פעיל</TableHead>
                    <TableHead className="text-right">מכתובת</TableHead>
                    <TableHead className="text-right">לכתובת</TableHead>
                    <TableHead className="text-right">תאריך</TableHead>
                    <TableHead className="text-right w-16">מחק</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redirects.map((redirect) => (
                    <TableRow key={redirect.id}>
                      <TableCell>
                        <Switch
                          checked={redirect.is_active}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: redirect.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        /{redirect.old_slug}
                      </TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        /{redirect.new_slug}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(redirect.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("למחוק את ההפנייה?")) {
                              deleteMutation.mutate(redirect.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">אין הפניות עדיין</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Redirects;
