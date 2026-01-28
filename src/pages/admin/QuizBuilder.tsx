import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, GripVertical, Copy, Edit, ListChecks } from "lucide-react";

interface QuizStep {
  id: string;
  question: string;
  options: string[];
}

interface Quiz {
  id: string;
  name: string;
  steps_json: QuizStep[];
  is_active: boolean;
  created_at: string;
}

const QuizBuilder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  
  const [quizName, setQuizName] = useState("");
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Fetch quizzes
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["admin-quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data?.map((q) => ({
        ...q,
        steps_json: (q.steps_json as unknown as QuizStep[]) || [],
      })) as Quiz[];
    },
  });

  const resetForm = () => {
    setQuizName("");
    setSteps([]);
    setIsActive(true);
    setEditingQuiz(null);
  };

  const openEditDialog = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizName(quiz.name);
    setSteps(quiz.steps_json || []);
    setIsActive(quiz.is_active);
    setIsDialogOpen(true);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: crypto.randomUUID(),
        question: "",
        options: ["", ""],
      },
    ]);
  };

  const updateStep = (index: number, field: keyof QuizStep, value: string | string[]) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const addOption = (stepIndex: number) => {
    const updated = [...steps];
    updated[stepIndex].options = [...updated[stepIndex].options, ""];
    setSteps(updated);
  };

  const updateOption = (stepIndex: number, optionIndex: number, value: string) => {
    const updated = [...steps];
    updated[stepIndex].options[optionIndex] = value;
    setSteps(updated);
  };

  const removeOption = (stepIndex: number, optionIndex: number) => {
    const updated = [...steps];
    updated[stepIndex].options = updated[stepIndex].options.filter((_, i) => i !== optionIndex);
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Convert steps to JSON-compatible format
      const stepsJson = JSON.parse(JSON.stringify(steps));
      
      const payload = {
        name: quizName,
        steps_json: stepsJson,
        is_active: isActive,
      };

      if (editingQuiz) {
        const { error } = await supabase
          .from("quizzes")
          .update(payload)
          .eq("id", editingQuiz.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quizzes").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      toast({
        title: editingQuiz ? "השאלון עודכן" : "השאלון נוצר",
        description: "השינויים נשמרו בהצלחה",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את השאלון",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      toast({ title: "השאלון נמחק" });
    },
  });

  const copyShortcode = (id: string) => {
    navigator.clipboard.writeText(`{{quiz_${id}}}`);
    toast({ title: "הקוד הקצר הועתק", description: `{{quiz_${id}}}` });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              בונה שאלונים
            </h1>
            <p className="text-muted-foreground mt-1">
              צור שאלונים אינטראקטיביים להמרת גולשים
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="gold" className="gap-2">
                <Plus className="w-4 h-4" />
                שאלון חדש
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuiz ? "עריכת שאלון" : "שאלון חדש"}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם השאלון</Label>
                    <Input
                      value={quizName}
                      onChange={(e) => setQuizName(e.target.value)}
                      placeholder="בדיקת התאמה לביטוח..."
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <Label>פעיל</Label>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">שלבי השאלון</Label>
                    <Button variant="outline" size="sm" onClick={addStep} className="gap-2">
                      <Plus className="w-4 h-4" />
                      הוסף שלב
                    </Button>
                  </div>

                  {steps.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <ListChecks className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>לחץ "הוסף שלב" כדי להתחיל</p>
                    </div>
                  )}

                  {steps.map((step, stepIndex) => (
                    <Card key={step.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">שלב {stepIndex + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeStep(stepIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>שאלה</Label>
                          <Input
                            value={step.question}
                            onChange={(e) => updateStep(stepIndex, "question", e.target.value)}
                            placeholder="מהי השאלה?"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>אפשרויות</Label>
                          {step.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(stepIndex, optIndex, e.target.value)}
                                placeholder={`אפשרות ${optIndex + 1}`}
                              />
                              {step.options.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(stepIndex, optIndex)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(stepIndex)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            הוסף אפשרות
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="font-medium mb-1">💡 שים לב:</p>
                  <p>השלב האחרון תמיד יציג את טופס הלידים הסטנדרטי.</p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => saveMutation.mutate()}
                  disabled={!quizName || steps.length === 0 || saveMutation.isPending}
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                  {editingQuiz ? "שמור שינויים" : "צור שאלון"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quizzes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : quizzes && quizzes.length > 0 ? (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${quiz.is_active ? "bg-green-500" : "bg-muted"}`} />
                      <div>
                        <h3 className="font-semibold text-foreground">{quiz.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {quiz.steps_json?.length || 0} שלבים
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShortcode(quiz.id)}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        העתק קוד
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(quiz)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">אין שאלונים עדיין</p>
              <p className="text-sm">צור שאלון ראשון כדי להתחיל להמיר גולשים</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default QuizBuilder;
