import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff, ArrowRight } from "lucide-react";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().trim().min(1, "כותרת נדרשת"),
  slug: z.string().trim().min(1, "כתובת URL נדרשת").regex(/^[a-z0-9-]+$/, "כתובת URL יכולה להכיל רק אותיות באנגלית קטנות, מספרים ומקפים"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featured_image: z.string().url().optional().or(z.literal("")),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  author_name: z.string().optional(),
  author_bio: z.string().optional(),
  category: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

// Available categories for articles
const CATEGORIES = [
  { value: "כללי", label: "כללי" },
  { value: "ביטוח חיים", label: "ביטוח חיים" },
  { value: "ביטוח בריאות", label: "ביטוח בריאות" },
  { value: "ביטוח רכב", label: "ביטוח רכב" },
  { value: "ביטוח רכוש", label: "ביטוח רכוש" },
  { value: "פנסיה", label: "פנסיה" },
  { value: "ביטוח מעסיקים", label: "ביטוח מעסיקים" },
  { value: "פיננסים", label: "פיננסים" },
];

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    seo_title: "",
    seo_description: "",
    author_name: "מערכת המדריך",
    author_bio: "צוות המומחים של המדריך לצרכן מביא לכם מידע מקצועי ואובייקטיבי בתחום הביטוח והפיננסים.",
    category: "כללי",
  });
  const [isPublished, setIsPublished] = useState(false);

  // Fetch existing article
  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        slug: article.slug || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        featured_image: article.featured_image || "",
        seo_title: article.seo_title || "",
        seo_description: article.seo_description || "",
        author_name: article.author_name || "מערכת המדריך",
        author_bio: article.author_bio || "צוות המומחים של המדריך לצרכן מביא לכם מידע מקצועי ואובייקטיבי בתחום הביטוח והפיננסים.",
        category: article.category || "כללי",
      });
      setIsPublished(article.is_published);
    }
  }, [article]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[\u0590-\u05FF]+/g, "") // Remove Hebrew characters
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/-+/g, "-") // Replace multiple dashes with single dash
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ArticleFormData & { is_published: boolean }) => {
      if (isNew) {
        const { data: newArticle, error } = await supabase
          .from("articles")
          .insert({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || null,
            content: data.content || null,
            featured_image: data.featured_image || null,
            seo_title: data.seo_title || null,
            seo_description: data.seo_description || null,
            author_name: data.author_name || null,
            author_bio: data.author_bio || null,
            category: data.category || null,
            is_published: data.is_published,
            published_at: data.is_published ? new Date().toISOString() : null,
          })
          .select()
          .single();
        if (error) throw error;
        return newArticle;
      } else {
        const { data: updatedArticle, error } = await supabase
          .from("articles")
          .update({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || null,
            content: data.content || null,
            featured_image: data.featured_image || null,
            seo_title: data.seo_title || null,
            seo_description: data.seo_description || null,
            author_name: data.author_name || null,
            author_bio: data.author_bio || null,
            category: data.category || null,
            is_published: data.is_published,
            published_at: data.is_published ? new Date().toISOString() : null,
          })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return updatedArticle;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", id] });
      toast({
        title: isNew ? "נשמר בהצלחה" : "עודכן בהצלחה",
        description: isNew ? "המאמר נוצר בהצלחה" : "השינויים נשמרו",
      });
      if (isNew) {
        navigate(`/admin/articles/${data.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "לא ניתן לשמור את המאמר",
        variant: "destructive",
      });
    },
  });

  const handleSave = (publish = false) => {
    const validation = articleSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "שגיאה",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const shouldPublish = publish ? true : isPublished;
    saveMutation.mutate({ ...validation.data, is_published: shouldPublish });
    if (publish) setIsPublished(true);
  };

  const handleUnpublish = () => {
    saveMutation.mutate({ ...formData, is_published: false });
    setIsPublished(false);
  };

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isNew ? "מאמר חדש" : "עריכת מאמר"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              שמירה
            </Button>
            {isPublished ? (
              <Button
                variant="secondary"
                onClick={handleUnpublish}
                disabled={saveMutation.isPending}
              >
                <EyeOff className="w-4 h-4" />
                הסרה מפרסום
              </Button>
            ) : (
              <Button
                variant="gold"
                onClick={() => handleSave(true)}
                disabled={saveMutation.isPending}
              >
                <Eye className="w-4 h-4" />
                פרסום עכשיו
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>תוכן המאמר</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="כותרת המאמר"
                  className="text-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">כתובת URL</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="article-url-slug"
                    dir="ltr"
                    className="text-left"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">קטגוריה</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">תקציר</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="תקציר קצר של המאמר (מוצג ברשימות ובתוצאות חיפוש)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>תוכן</Label>
                <RichTextEditor
                  content={formData.content || ""}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, content }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>מדיה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="featured_image">תמונה ראשית (URL)</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, featured_image: e.target.value }))
                  }
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                  className="text-left"
                />
                {formData.featured_image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border max-w-sm">
                    <img
                      src={formData.featured_image}
                      alt="תצוגה מקדימה"
                      className="w-full h-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Author (E-E-A-T) */}
          <Card>
            <CardHeader>
              <CardTitle>מחבר (E-E-A-T)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author_name">שם המחבר</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author_name: e.target.value }))
                  }
                  placeholder="מערכת המדריך"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_bio">ביוגרפיה קצרה</Label>
                <Textarea
                  id="author_bio"
                  value={formData.author_bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author_bio: e.target.value }))
                  }
                  placeholder="תיאור קצר של המחבר וניסיונו המקצועי..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  ביוגרפיה קצרה המציגה את המומחיות והניסיון של המחבר (חשוב ל-Google E-E-A-T)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">כותרת SEO</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seo_title: e.target.value }))
                  }
                  placeholder="כותרת לתוצאות חיפוש (עד 60 תווים)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.seo_title?.length || 0}/60 תווים
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">תיאור SEO</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seo_description: e.target.value }))
                  }
                  placeholder="תיאור לתוצאות חיפוש (עד 160 תווים)"
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.seo_description?.length || 0}/160 תווים
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ArticleEditor;
