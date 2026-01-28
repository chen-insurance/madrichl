import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, HelpCircle } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQBuilderProps {
  items: FAQItem[];
  onChange: (items: FAQItem[]) => void;
}

const FAQBuilder = ({ items, onChange }: FAQBuilderProps) => {
  const handleAddItem = () => {
    onChange([...items, { question: "", answer: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof FAQItem, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-accent" />
          שאלות נפוצות (FAQ)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          הוסיפו שאלות ותשובות שיוצגו בתחתית המאמר וב-Schema מובנה לגוגל
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-3">עדיין לא הוספתם שאלות נפוצות</p>
            <Button variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="w-4 h-4" />
              הוספת שאלה ראשונה
            </Button>
          </div>
        ) : (
          <>
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg space-y-3 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                    שאלה {index + 1}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>שאלה</Label>
                  <Input
                    value={item.question}
                    onChange={(e) => handleUpdateItem(index, "question", e.target.value)}
                    placeholder="מהי שאלה נפוצה?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>תשובה</Label>
                  <Textarea
                    value={item.answer}
                    onChange={(e) => handleUpdateItem(index, "answer", e.target.value)}
                    placeholder="התשובה לשאלה..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddItem} className="w-full">
              <Plus className="w-4 h-4" />
              הוספת שאלה נוספת
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FAQBuilder;
