import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HomepageSettingsData {
  hero_article_id: string;
  pinned_categories: string[];
  homepage_headline: string;
}

const HomepageSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [heroArticleId, setHeroArticleId] = useState<string>("");
  const [pinnedCategories, setPinnedCategories] = useState<string[]>([]);
  const [homepageHeadline, setHomepageHeadline] = useState<string>("המדריך לצרכן | מגזין ביטוח ופיננסים");

  // Fetch published articles for hero selection
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["published-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch categories for pinned selection
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch current homepage settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["homepage-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_article_id", "pinned_categories", "homepage_headline"]);

      if (error) throw error;

      const settingsMap: Record<string, string | null> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value;
      });

      return settingsMap;
    },
  });

  // Initialize form with current settings
  useEffect(() => {
    if (settings) {
      setHeroArticleId(settings.hero_article_id || "");
      setHomepageHeadline(settings.homepage_headline || "המדריך לצרכן | מגזין ביטוח ופיננסים");
      try {
        const parsed = settings.pinned_categories ? JSON.parse(settings.pinned_categories) : [];
        setPinnedCategories(Array.isArray(parsed) ? parsed : []);
      } catch {
        setPinnedCategories([]);
      }
    }
  }, [settings]);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (data: HomepageSettingsData) => {
      const upserts = [
        { key: "hero_article_id", value: data.hero_article_id },
        { key: "pinned_categories", value: JSON.stringify(data.pinned_categories) },
        { key: "homepage_headline", value: data.homepage_headline },
      ];

      for (const setting of upserts) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(
            { key: setting.key, value: setting.value },
            { onConflict: "key" }
          );

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-settings"] });
      toast({
        title: "נשמר בהצלחה",
        description: "הגדרות עמוד הבית עודכנו",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההגדרות",
        variant: "destructive",
      });
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    setPinnedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      if (prev.length >= 3) {
        toast({
          title: "מקסימום 3 קטגוריות",
          description: "ניתן לבחור עד 3 קטגוריות מוצמדות",
          variant: "destructive",
        });
        return prev;
      }
      return [...prev, categoryId];
    });
  };

  const handleSave = () => {
    saveMutation.mutate({
      hero_article_id: heroArticleId,
      pinned_categories: pinnedCategories,
      homepage_headline: homepageHeadline,
    });
  };

  const isLoading = articlesLoading || categoriesLoading || settingsLoading;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                הגדרות עמוד הבית
              </h1>
              <p className="text-muted-foreground mt-1">
                ניהול תוכן ומבנה עמוד הבית
              </p>
            </div>
          </div>
          <Button
            variant="gold"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            שמור שינויים
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* SEO Headline */}
            <Card>
              <CardHeader>
                <CardTitle>כותרת ראשית (SEO)</CardTitle>
                <CardDescription>
                  כותרת H1 של עמוד הבית - חשובה לקידום אורגני
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="headline">כותרת</Label>
                  <Input
                    id="headline"
                    value={homepageHeadline}
                    onChange={(e) => setHomepageHeadline(e.target.value)}
                    placeholder="הזינו כותרת ראשית..."
                    className="max-w-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    מומלץ עד 60 תווים. כותרת נוכחית: {homepageHeadline.length} תווים
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Hero Article */}
            <Card>
              <CardHeader>
                <CardTitle>כתבה ראשית (Hero)</CardTitle>
                <CardDescription>
                  הכתבה המודגשת בראש עמוד הבית
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>בחרו כתבה</Label>
                  <Select value={heroArticleId} onValueChange={setHeroArticleId}>
                    <SelectTrigger className="max-w-xl">
                      <SelectValue placeholder="בחרו כתבה ראשית..." />
                    </SelectTrigger>
                    <SelectContent>
                      {articles?.map((article) => (
                        <SelectItem key={article.id} value={article.id}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!articles?.length && (
                    <p className="text-xs text-muted-foreground">
                      אין כתבות מפורסמות. פרסמו כתבה כדי להציג אותה כאן.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pinned Categories */}
            <Card>
              <CardHeader>
                <CardTitle>קטגוריות מוצמדות</CardTitle>
                <CardDescription>
                  בחרו עד 3 קטגוריות להצגה בסקציית החדשות האחרונות
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories?.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2 space-x-reverse"
                        >
                          <Checkbox
                            id={category.id}
                            checked={pinnedCategories.includes(category.id)}
                            onCheckedChange={() => handleCategoryToggle(category.id)}
                          />
                          <Label
                            htmlFor={category.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      אין קטגוריות. צרו קטגוריות דרך תפריט "מאמרים &gt; קטגוריות".
                    </p>
                  )}
                  {pinnedCategories.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      נבחרו {pinnedCategories.length}/3 קטגוריות
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default HomepageSettings;
