import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LeadForm from "@/components/LeadForm";
import { CheckCircle, ArrowRight } from "lucide-react";

interface QuizStep {
  id: string;
  question: string;
  options: string[];
}

interface QuizWidgetProps {
  quizId: string;
}

const QuizWidget = ({ quizId }: QuizWidgetProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!quizId,
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-soft animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4" />
        <div className="h-8 bg-muted rounded w-3/4 mb-6" />
        <div className="space-y-3">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const stepsData = quiz.steps_json as unknown as QuizStep[] | null;
  
  if (!stepsData || stepsData.length === 0) {
    return null;
  }

  const steps = stepsData;
  const totalSteps = steps.length + 1; // +1 for lead form
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastQuestionStep = currentStep >= steps.length;

  const handleOptionClick = (option: string) => {
    setAnswers({ ...answers, [currentStep]: option });
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Move to lead form step
      setCurrentStep(steps.length);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLeadFormSuccess = () => {
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="bg-gradient-navy rounded-xl p-8 text-center text-cream">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-accent" />
        <h3 className="font-display text-2xl font-bold mb-2">תודה!</h3>
        <p className="text-cream/80">
          קיבלנו את הפרטים שלך וניצור איתך קשר בהקדם.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden">
      {/* Progress Bar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>שלב {currentStep + 1} מתוך {totalSteps}</span>
          <span>{Math.round(progress)}% הושלם</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="p-6">
        {isLastQuestionStep ? (
          // Lead Form Step
          <div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              שלב אחרון - השאירו פרטים
            </h3>
            <p className="text-muted-foreground mb-6">
              מלאו את הפרטים ונחזור אליכם עם הצעה מותאמת
            </p>
            <LeadForm
              title=""
              subtitle=""
              variant="inline"
              onSuccess={handleLeadFormSuccess}
              extraData={{ quiz_answers: answers, quiz_id: quizId }}
            />
          </div>
        ) : (
          // Question Step
          <div>
            <h3 className="font-display text-xl font-bold text-foreground mb-6">
              {steps[currentStep].question}
            </h3>
            <div className="space-y-3">
              {steps[currentStep].options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-right h-auto py-4 px-6 text-base hover:bg-accent/10 hover:border-accent hover:text-accent transition-all"
                  onClick={() => handleOptionClick(option)}
                >
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium ml-4">
                    {String.fromCharCode(1488 + index)}
                  </span>
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        {currentStep > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mt-4 gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizWidget;
