import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, GripVertical, Plus, Trash2, ExternalLink, Menu } from "lucide-react";

interface MenuItem {
  id: string;
  type: "category" | "page" | "custom";
  label: string;
  url: string;
  categoryId?: string;
  pageId?: string;
}

interface MenuData {
  id: string;
  location: string;
  items_json: MenuItem[];
}

const locationLabels: Record<string, string> = {
  header: "תפריט ראשי (Header)",
  footer_col_1: "פוטר - עמודה 1",
  footer_col_2: "פוטר - עמודה 2",
  footer_col_3: "פוטר - עמודה 3",
};

const Menus = () => {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<string>("header");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [newItemType, setNewItemType] = useState<"category" | "page" | "custom">("custom");
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemCategoryId, setNewItemCategoryId] = useState("");
  const [newItemPageId, setNewItemPageId] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch menus
  const { data: menus, isLoading: menusLoading } = useQuery({
    queryKey: ["admin-menus"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menus").select("*");
      if (error) throw error;
      return data.map((m) => ({
        ...m,
        items_json: (Array.isArray(m.items_json) ? m.items_json : []) as unknown as MenuItem[],
      }));
    },
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
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

  // Fetch pages for dropdown
  const { data: pages } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("id, title, slug")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  // Load items when location changes
  const loadItems = (location: string) => {
    const menu = menus?.find((m) => m.location === location);
    if (menu?.items_json) {
      setItems(Array.isArray(menu.items_json) ? menu.items_json : []);
    } else {
      setItems([]);
    }
  };

  // Update when menus or selected location changes
  useState(() => {
    if (menus) {
      loadItems(selectedLocation);
    }
  });

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    loadItems(location);
  };

  // Save menu mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("menus")
        .update({ items_json: JSON.parse(JSON.stringify(items)) })
        .eq("location", selectedLocation);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
      queryClient.invalidateQueries({ queryKey: ["public-menus"] });
      toast.success("התפריט נשמר בהצלחה");
    },
    onError: () => {
      toast.error("שגיאה בשמירת התפריט");
    },
  });

  const addItem = () => {
    let label = newItemLabel;
    let url = newItemUrl;

    if (newItemType === "category" && newItemCategoryId) {
      const category = categories?.find((c) => c.id === newItemCategoryId);
      if (category) {
        label = label || category.name;
        url = `/category/${category.slug}`;
      }
    } else if (newItemType === "page" && newItemPageId) {
      const page = pages?.find((p) => p.id === newItemPageId);
      if (page) {
        label = label || page.title;
        url = `/${page.slug}`;
      }
    }

    if (!label || !url) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      type: newItemType,
      label,
      url,
      categoryId: newItemType === "category" ? newItemCategoryId : undefined,
      pageId: newItemType === "page" ? newItemPageId : undefined,
    };

    setItems([...items, newItem]);
    setNewItemLabel("");
    setNewItemUrl("");
    setNewItemCategoryId("");
    setNewItemPageId("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (menusLoading) {
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
      <div className="p-6 md:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              ניהול תפריטים
            </h1>
            <p className="text-muted-foreground mt-1">
              ערוך את התפריט הראשי ותפריטי הפוטר
            </p>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            שמירה
          </Button>
        </div>

        {/* Location Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Menu className="w-5 h-5" />
              בחר מיקום
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(locationLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Current Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>פריטי תפריט</CardTitle>
            <CardDescription>גרור כדי לסדר מחדש</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                אין פריטים בתפריט זה. הוסף פריט למטה.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-move transition-opacity ${
                      draggedIndex === index ? "opacity-50" : ""
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {item.url}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      {item.type === "category" ? "קטגוריה" : item.type === "page" ? "עמוד" : "קישור"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Item */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              הוסף פריט
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>סוג פריט</Label>
              <Select
                value={newItemType}
                onValueChange={(v) => setNewItemType(v as "category" | "page" | "custom")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">קישור מותאם</SelectItem>
                  <SelectItem value="category">קטגוריה</SelectItem>
                  <SelectItem value="page">עמוד סטטי</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newItemType === "category" && (
              <div className="space-y-2">
                <Label>בחר קטגוריה</Label>
                <Select value={newItemCategoryId} onValueChange={setNewItemCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newItemType === "page" && (
              <div className="space-y-2">
                <Label>בחר עמוד</Label>
                <Select value={newItemPageId} onValueChange={setNewItemPageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עמוד" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages?.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>תווית (Label)</Label>
              <Input
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                placeholder={newItemType === "custom" ? "צור קשר" : "השאר ריק לשם ברירת מחדל"}
              />
            </div>

            {newItemType === "custom" && (
              <div className="space-y-2">
                <Label>כתובת URL</Label>
                <Input
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  placeholder="/contact או https://example.com"
                  dir="ltr"
                />
              </div>
            )}

            <Button onClick={addItem} className="w-full">
              <Plus className="w-4 h-4" />
              הוסף לתפריט
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Menus;
