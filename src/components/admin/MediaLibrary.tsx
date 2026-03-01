import { useState } from "react";
import { optimizeImageUrl } from "@/lib/image-utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload, Trash2, Copy, Check, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  isModal?: boolean;
}

const MediaLibrary = ({ onSelect, isModal = false }: MediaLibraryProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: files, isLoading } = useQuery({
    queryKey: ["media-files"],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("media")
        .list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      const mediaFiles: MediaFile[] = (data || [])
        .filter(file => !file.name.startsWith("."))
        .map(file => ({
          id: file.id || file.name,
          name: file.name,
          url: supabase.storage.from("media").getPublicUrl(file.name).data.publicUrl,
          created_at: file.created_at || "",
        }));

      return mediaFiles;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage.from("media").remove([fileName]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      toast({ title: "הקובץ נמחק בהצלחה" });
    },
    onError: () => {
      toast({ title: "שגיאה במחיקת הקובץ", variant: "destructive" });
    },
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("media")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      toast({ title: "הקובץ הועלה בהצלחה" });
    } catch (error) {
      toast({ title: "שגיאה בהעלאת הקובץ", variant: "destructive" });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSelect = (url: string) => {
    if (onSelect) {
      onSelect(url);
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload">
          <Button variant="gold" disabled={uploading} asChild>
            <span className="cursor-pointer">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              העלאת קובץ
            </span>
          </Button>
        </label>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : files && files.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted cursor-pointer hover:ring-2 hover:ring-accent transition-all"
              onClick={() => isModal && handleSelect(file.url)}
            >
              <img
                src={optimizeImageUrl(file.url, 400)}
                alt={file.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(file.url);
                  }}
                >
                  {copiedUrl === file.url ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                {!isModal && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(file.name);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            אין קבצים בספרייה עדיין
          </p>
        </div>
      )}
    </div>
  );

  return content;
};

// Modal wrapper for article editor integration
interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export const MediaLibraryModal = ({ open, onClose, onSelect }: MediaLibraryModalProps) => {
  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>בחירה מספריית המדיה</DialogTitle>
        </DialogHeader>
        <MediaLibrary onSelect={handleSelect} isModal />
      </DialogContent>
    </Dialog>
  );
};

export default MediaLibrary;
