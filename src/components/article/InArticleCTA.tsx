import { Calculator, ArrowLeft } from "lucide-react";

interface InArticleCTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

const InArticleCTA = ({
  title = "רוצים לבדוק כמה אתם משלמים?",
  description = "קבלו השוואת מחירים חינם ובדקו האם אתם משלמים יותר מדי על הביטוח שלכם",
  buttonText = "לבדיקה חינם — ללא התחייבות",
}: InArticleCTAProps) => {
  const scrollToForm = () => {
    const el = document.getElementById("lead-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="my-8 bg-accent/5 border border-accent/20 rounded-xl p-6 not-prose">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Calculator className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-bold text-lg text-foreground mb-1">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-2.5 px-5 rounded-lg transition-colors text-sm cursor-pointer"
          >
            {buttonText}
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InArticleCTA;
