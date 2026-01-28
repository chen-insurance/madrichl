import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle, Search } from "lucide-react";

interface SEOScoreCardProps {
  title: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage: string;
  content: string;
}

interface SEOCheck {
  label: string;
  status: "success" | "warning" | "error";
  message: string;
}

const SEOScoreCard = ({
  title,
  seoTitle,
  seoDescription,
  featuredImage,
  content,
}: SEOScoreCardProps) => {
  const checks = useMemo<SEOCheck[]>(() => {
    const result: SEOCheck[] = [];

    // Title length check (use seoTitle if available, otherwise main title)
    const effectiveTitle = seoTitle || title;
    const titleLength = effectiveTitle.length;
    if (titleLength === 0) {
      result.push({
        label: "כותרת SEO",
        status: "error",
        message: "חסרה כותרת",
      });
    } else if (titleLength < 30) {
      result.push({
        label: "כותרת SEO",
        status: "warning",
        message: `קצרה מדי (${titleLength}/30-60)`,
      });
    } else if (titleLength > 60) {
      result.push({
        label: "כותרת SEO",
        status: "warning",
        message: `ארוכה מדי (${titleLength}/60)`,
      });
    } else {
      result.push({
        label: "כותרת SEO",
        status: "success",
        message: `אורך מושלם (${titleLength}/60)`,
      });
    }

    // Meta description check
    const descLength = seoDescription.length;
    if (descLength === 0) {
      result.push({
        label: "תיאור מטא",
        status: "error",
        message: "חסר תיאור",
      });
    } else if (descLength > 160) {
      result.push({
        label: "תיאור מטא",
        status: "warning",
        message: `ארוך מדי (${descLength}/160)`,
      });
    } else if (descLength < 70) {
      result.push({
        label: "תיאור מטא",
        status: "warning",
        message: `קצר מדי (${descLength}/160)`,
      });
    } else {
      result.push({
        label: "תיאור מטא",
        status: "success",
        message: `אורך מושלם (${descLength}/160)`,
      });
    }

    // Featured image check
    if (!featuredImage) {
      result.push({
        label: "תמונה ראשית",
        status: "warning",
        message: "לא הוגדרה תמונה",
      });
    } else {
      result.push({
        label: "תמונה ראשית",
        status: "success",
        message: "תמונה מוגדרת",
      });
    }

    // Content length check
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) {
      result.push({
        label: "תוכן",
        status: "error",
        message: "אין תוכן",
      });
    } else if (wordCount < 300) {
      result.push({
        label: "תוכן",
        status: "warning",
        message: `קצר (${wordCount} מילים)`,
      });
    } else {
      result.push({
        label: "תוכן",
        status: "success",
        message: `${wordCount} מילים`,
      });
    }

    return result;
  }, [title, seoTitle, seoDescription, featuredImage, content]);

  const overallScore = useMemo(() => {
    const errorCount = checks.filter((c) => c.status === "error").length;
    const warningCount = checks.filter((c) => c.status === "warning").length;

    if (errorCount > 0) return "error";
    if (warningCount > 1) return "warning";
    return "success";
  }, [checks]);

  const getScoreBadge = () => {
    switch (overallScore) {
      case "success":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            מוכן לפרסום
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            דורש שיפור
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            לא מוכן
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: SEOCheck["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4" />
            ציון SEO
          </CardTitle>
          {getScoreBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(check.status)}
              <span className="text-sm font-medium">{check.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{check.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SEOScoreCard;
