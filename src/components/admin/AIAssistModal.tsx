import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, FileText, CheckCircle, Lightbulb, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAssistModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

const AIAssistModal = ({ open, onClose, onInsert }: AIAssistModalProps) => {
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const placeholderActions = [
    { label: "סיכום", icon: FileText, description: "סכמו את הטקסט" },
    { label: "תיקון דקדוק", icon: CheckCircle, description: "תקנו שגיאות כתיב ודקדוק" },
    { label: "צרו כותרות", icon: Lightbulb, description: "הציעו כותרות למאמר" },
  ];

  const handleAction = (action: string) => {
    if (!inputText.trim()) {
      toast({
        title: "אין טקסט",
        description: "הזינו טקסט לפני הפעלת הפעולה",
        variant: "destructive",
      });
      return;
    }

    // Placeholder - will be connected to AI API later
    setIsLoading(true);
    setTimeout(() => {
      setOutputText(
        `[תוצאת AI עבור פעולת "${action}" תופיע כאן לאחר חיבור ל-API]\n\nטקסט קלט:\n${inputText.substring(0, 100)}...`
      );
      setIsLoading(false);
    }, 1000);
  };

  const handleInsert = () => {
    if (outputText) {
      onInsert(outputText);
      handleClose();
      toast({ title: "הטקסט הוכנס למאמר" });
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast({ title: "הועתק ללוח" });
    }
  };

  const handleClose = () => {
    setInputText("");
    setOutputText("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-accent" />
            עוזר תוכן AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Input Area */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              הדביקו טקסט לעריכה/סיכום, או תארו מה תרצו לכתוב:
            </Label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="הזינו או הדביקו את הטקסט כאן..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {placeholderActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleAction(action.label)}
                disabled={isLoading}
                className="gap-2"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </Button>
            ))}
          </div>

          {/* Output Area */}
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center justify-between">
              תוצאה:
              {outputText && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                  העתקה
                </Button>
              )}
            </Label>
            <div className="relative">
              <Textarea
                value={outputText}
                readOnly
                placeholder="תוצאת ה-AI תופיע כאן לאחר חיבור API..."
                rows={6}
                className="resize-none bg-muted/50"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              )}
            </div>
          </div>

          {/* Insert Button */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleInsert}
              disabled={!outputText || isLoading}
              className="flex-1"
              variant="gold"
            >
              <Sparkles className="w-4 h-4" />
              הכנסה למאמר
            </Button>
            <Button variant="outline" onClick={handleClose}>
              סגירה
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-accent/10 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground mb-1">
              <Sparkles className="w-4 h-4 text-accent" />
              הערה
            </p>
            <p>
              זוהי תצוגה מקדימה של הממשק. הפעולות יהיו זמינות לאחר חיבור ל-API של AI.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistModal;
