import { User } from "lucide-react";

interface AuthorBoxProps {
  authorName?: string | null;
  authorBio?: string | null;
}

const AuthorBox = ({ authorName, authorBio }: AuthorBoxProps) => {
  const name = authorName || "מערכת המדריך";
  const bio =
    authorBio ||
    "צוות המומחים של המדריך לצרכן מביא לכם מידע מקצועי ואובייקטיבי בתחום הביטוח והפיננסים.";

  return (
    <div className="bg-muted/50 rounded-xl p-6 mt-8 border border-border">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">נכתב על ידי</p>
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {bio}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorBox;
