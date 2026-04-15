import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, ArrowLeft } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  // Debounce search input by 300ms to avoid querying on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search articles
  const { data: results, isLoading, isError } = useQuery({
    queryKey: ["search-articles", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) return [];

      const searchQuery = debouncedQuery.toLowerCase();
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, category")
        .eq("is_published", true)
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
        .order("published_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data as Article[];
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = (slug: string) => {
    navigate(`/news/${slug}`);
    onOpenChange(false);
  };

  const handleViewAll = () => {
    navigate(`/blog?search=${encodeURIComponent(query)}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-right">חיפוש כתבות</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="text"
              placeholder="הקלידו מילות חיפוש..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10"
              autoFocus
              aria-label="חיפוש כתבות"
              aria-autocomplete="list"
            />
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto" role="listbox" aria-label="תוצאות חיפוש">
            {isError && (
              <div className="py-8 text-center text-muted-foreground">
                שגיאה בחיפוש. אנא נסה שוב.
              </div>
            )}
            {!isError && isLoading && query.length >= 2 && (
              <div className="py-8 text-center text-muted-foreground">
                מחפש...
              </div>
            )}

            {!isError && debouncedQuery.length >= 2 && results && results.length > 0 && (
              <div className="space-y-1">
                {results.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => handleSelect(article.slug)}
                    className="w-full text-right p-3 rounded-lg hover:bg-muted transition-colors flex items-start gap-3"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground line-clamp-1">
                        {article.title}
                      </p>
                      {article.category && (
                        <p className="text-xs text-muted-foreground">
                          {article.category}
                        </p>
                      )}
                    </div>
                    <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
                
                <button
                  onClick={handleViewAll}
                  className="w-full text-center py-3 text-sm text-accent hover:underline"
                >
                  צפה בכל התוצאות
                </button>
              </div>
            )}

            {!isError && debouncedQuery.length >= 2 && results && results.length === 0 && !isLoading && (
              <div className="py-8 text-center text-muted-foreground" role="status">
                לא נמצאו תוצאות עבור &quot;{debouncedQuery}&quot;
              </div>
            )}

            {query.length < 2 && (
              <div className="py-8 text-center text-muted-foreground">
                הקלידו לפחות 2 תווים לחיפוש
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
