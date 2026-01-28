import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Eye, EyeOff, ArrowRight, Plus, Layout } from "lucide-react";

const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    seo_title: "",
    seo_description: "",
  });
  const [isPublished, setIsPublished] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(false);

  // Fetch existing page
  const { data: page, isLoading } = useQuery({
    queryKey: ["admin-page", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || "",
        slug: page.slug || "",
        content: page.content || "",
        seo_title: page.seo_title || "",
        seo_description: page.seo_description || "",
      });
      setIsPublished(page.is_published);
      setIsLandingPage(page.is_landing_page || false);
    }
  }, [page]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[\u0590-\u05FF]+/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content || null,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        is_published: publish,
        is_landing_page: isLandingPage,
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("pages")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("pages")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, publish) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success(isNew ? "העמוד נוצר בהצלחה" : "העמוד עודכן בהצלחה");
      setIsPublished(publish);
      if (isNew) {
        navigate(`/admin/pages/${data.id}`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "שגיאה בשמירת העמוד");
    },
  });

  if (!isNew && isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/pages")}>
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isNew ? "עמוד חדש" : "עריכת עמוד"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => saveMutation.mutate(isPublished)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              שמירה
            </Button>
            {isPublished ? (
              <Button
                variant="secondary"
                onClick={() => saveMutation.mutate(false)}
                disabled={saveMutation.isPending}
              >
                <EyeOff className="w-4 h-4" />
                הסרה מפרסום
              </Button>
            ) : (
              <Button
                variant="gold"
                onClick={() => saveMutation.mutate(true)}
                disabled={saveMutation.isPending}
              >
                <Eye className="w-4 h-4" />
                פרסום
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>תוכן העמוד</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="שם העמוד"
                  className="text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">כתובת URL</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="about"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">יופיע בכתובת: /{formData.slug || "slug"}</p>
              </div>

              <div className="space-y-2">
                <Label>תוכן</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Landing Page Mode */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Layout className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle>מצב דף נחיתה</CardTitle>
                  <CardDescription>
                    הסתר את הניווט והפוטר לחוויית המרה ממוקדת
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="landing_page_mode">הפעל מצב דף נחיתה</Label>
                <Switch
                  id="landing_page_mode"
                  checked={isLandingPage}
                  onCheckedChange={setIsLandingPage}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>הגדרות SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">כותרת SEO</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                  placeholder={formData.title || "כותרת לתוצאות חיפוש"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">תיאור SEO</Label>
                <Input
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seo_description: e.target.value }))}
                  placeholder="תיאור קצר לתוצאות חיפוש"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PageEditor;
