import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Code, Webhook } from "lucide-react";

const Settings = () => {
  const [headScripts, setHeadScripts] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const headScriptsSetting = settings.find((s) => s.key === "head_scripts");
      const webhookUrlSetting = settings.find((s) => s.key === "webhook_url");
      
      if (headScriptsSetting) {
        setHeadScripts(headScriptsSetting.value || "");
      }
      if (webhookUrlSetting) {
        setWebhookUrl(webhookUrlSetting.value || "");
      }
    }
  }, [settings]);

  // Save mutation for a specific key
  const saveSetting = async (key: string, value: string) => {
    const existingSetting = settings?.find((s) => s.key === key);
    
    if (existingSetting) {
      const { error } = await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("site_settings")
        .insert([{ key, value }]);
      if (error) throw error;
    }
  };

  // Save head scripts mutation
  const saveHeadScriptsMutation = useMutation({
    mutationFn: async (value: string) => saveSetting("head_scripts", value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "נשמר בהצלחה",
        description: "הגדרות הסקריפטים עודכנו",
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

  // Save webhook URL mutation
  const saveWebhookMutation = useMutation({
    mutationFn: async (value: string) => saveSetting("webhook_url", value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "נשמר בהצלחה",
        description: "כתובת ה-Webhook עודכנה",
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

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            הגדרות האתר
          </h1>
          <p className="text-muted-foreground mt-1">
            ניהול הגדרות כלליות של האתר
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Webhook URL */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Webhook className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Webhook URL</CardTitle>
                    <CardDescription>
                      כתובת לשליחת לידים בזמן אמת (CRM, Zapier, Make וכו׳)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">כתובת Webhook</Label>
                  <Input
                    id="webhook_url"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    dir="ltr"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p>
                    כאשר ליד חדש נשלח דרך הטופס, הנתונים יישלחו גם לכתובת הזו בפורמט JSON.
                  </p>
                </div>
                <Button
                  onClick={() => saveWebhookMutation.mutate(webhookUrl)}
                  disabled={saveWebhookMutation.isPending}
                >
                  {saveWebhookMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  שמירה
                </Button>
              </CardContent>
            </Card>

            {/* Head Scripts */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Code className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Head Scripts</CardTitle>
                    <CardDescription>
                      סקריפטים שיוזרקו לתוך ה-{"<head>"} של האתר הציבורי
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="head_scripts">קוד HTML / JavaScript</Label>
                  <Textarea
                    id="head_scripts"
                    value={headScripts}
                    onChange={(e) => setHeadScripts(e.target.value)}
                    placeholder={`<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){...})</script>
<!-- End Google Tag Manager -->

<!-- Google Search Console Verification -->
<meta name="google-site-verification" content="..." />`}
                    className="font-mono text-sm min-h-[300px]"
                    dir="ltr"
                  />
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="font-medium mb-2">שימושים נפוצים:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Google Tag Manager (GTM)</li>
                    <li>Google Analytics (GA4)</li>
                    <li>Google Search Console verification meta tag</li>
                    <li>Facebook Pixel</li>
                    <li>סקריפטים של צד שלישי אחרים</li>
                  </ul>
                </div>
                <Button
                  onClick={() => saveHeadScriptsMutation.mutate(headScripts)}
                  disabled={saveHeadScriptsMutation.isPending}
                >
                  {saveHeadScriptsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  שמירת הגדרות
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings;
