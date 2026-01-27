import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const Media = () => {
  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              ספריית מדיה
            </h1>
            <p className="text-muted-foreground mt-1">
              ניהול תמונות וקבצי מדיה
            </p>
          </div>
          <Button variant="gold" disabled>
            <Upload className="w-4 h-4" />
            העלאת קובץ
          </Button>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                ספריית המדיה בקרוב
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                פיצ׳ר זה יאפשר לכם להעלות, לנהל ולארגן תמונות וקבצי מדיה ישירות מממשק הניהול.
                בינתיים, ניתן להשתמש בכתובות URL של תמונות חיצוניות.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Media;
