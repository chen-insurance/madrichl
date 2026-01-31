import { useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  FileText,
  Target,
  Save,
  Loader2,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source_url: string | null;
  utm_data: Record<string, unknown> | null;
  created_at: string;
  status: string | null;
  birth_year: number | null;
  current_status: string | null;
}

interface LeadDetailsModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveNotes?: (id: string, notes: string) => Promise<void>;
}

const UTM_LABELS: Record<string, string> = {
  utm_source: "מקור",
  utm_medium: "מדיום",
  utm_campaign: "קמפיין",
  utm_term: "מילת מפתח",
  utm_content: "תוכן",
  gclid: "Google Click ID",
  fbclid: "Facebook Click ID",
  referrer: "מפנה",
  landing_page: "דף נחיתה",
  captured_at: "נלכד בתאריך",
};

const INSURANCE_STATUS_LABELS: Record<string, string> = {
  yes: "כן, יש לי ביטוח",
  no: "לא, אין לי ביטוח",
  not_sure: "לא בטוח/ה",
};

const LeadDetailsModal = ({
  lead,
  open,
  onOpenChange,
  onSaveNotes,
}: LeadDetailsModalProps) => {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!lead) return null;

  const utmData = (lead.utm_data as Record<string, string>) || {};
  
  // Extract page_title and page_slug from utm_data if present
  const pageTitle = utmData.page_title || null;
  const pageSlug = utmData.page_slug || null;

  const handleSaveNotes = async () => {
    if (!onSaveNotes) return;
    setIsSaving(true);
    try {
      await onSaveNotes(lead.id, notes);
    } finally {
      setIsSaving(false);
    }
  };

  const renderUtmValue = (value: string | undefined) => {
    if (!value || value === "") return <span className="text-muted-foreground">—</span>;
    return <span className="font-medium text-foreground">{value}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                {lead.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4 inline ml-1" />
                {format(new Date(lead.created_at), "EEEE, d בMMMM yyyy 'בשעה' HH:mm", { locale: he })}
              </p>
            </div>
            <Badge variant={lead.status === "new" ? "default" : lead.status === "contacted" ? "secondary" : "outline"}>
              {lead.status === "new" ? "חדש" : lead.status === "contacted" ? "נוצר קשר" : "סגור"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Section A: Personal Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            פרטים אישיים
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">אימייל</p>
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                <Mail className="w-4 h-4" />
                {lead.email}
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">טלפון</p>
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-accent hover:underline" dir="ltr">
                  <Phone className="w-4 h-4" />
                  {lead.phone}
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">שנת לידה</p>
              <p className="text-sm font-medium">
                {lead.birth_year || <span className="text-muted-foreground">—</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">סטטוס ביטוח נוכחי</p>
              <p className="text-sm font-medium">
                {lead.current_status ? (
                  INSURANCE_STATUS_LABELS[lead.current_status] || lead.current_status
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section B: Context */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" />
            הקשר ההמרה
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            {pageTitle && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">כותרת הדף</p>
                <p className="text-sm font-medium">{pageTitle}</p>
              </div>
            )}
            {pageSlug && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Slug</p>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">{pageSlug}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">כתובת מלאה</p>
              {lead.source_url ? (
                <a
                  href={lead.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-accent hover:underline break-all"
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  {lead.source_url}
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Section C: Marketing Intelligence */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            נתוני שיווק (UTM)
          </h3>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">מקור (Source)</p>
                {renderUtmValue(utmData.utm_source)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">מדיום (Medium)</p>
                {renderUtmValue(utmData.utm_medium)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">קמפיין (Campaign)</p>
                {renderUtmValue(utmData.utm_campaign)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">מילת מפתח (Term)</p>
                {renderUtmValue(utmData.utm_term)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">תוכן (Content)</p>
                {renderUtmValue(utmData.utm_content)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">מפנה (Referrer)</p>
                {renderUtmValue(utmData.referrer)}
              </div>
            </div>
            
            {/* Click IDs */}
            {(utmData.gclid || utmData.fbclid) && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">מזהי קליק</p>
                <div className="flex flex-wrap gap-2">
                  {utmData.gclid && (
                    <Badge variant="outline" className="font-mono text-xs">
                      GCLID: {utmData.gclid.substring(0, 12)}...
                    </Badge>
                  )}
                  {utmData.fbclid && (
                    <Badge variant="outline" className="font-mono text-xs">
                      FBCLID: {utmData.fbclid.substring(0, 12)}...
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Section D: Sales Notes */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">הערות מכירה</h3>
          <Textarea
            placeholder="הוסף הערות על הליד..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
          {onSaveNotes && (
            <Button onClick={handleSaveNotes} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              שמור הערות
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsModal;
