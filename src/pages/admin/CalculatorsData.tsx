import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, Calculator, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InsuranceRate {
  age: number;
  price_per_100k_male_smoker: number;
  price_per_100k_male_nonsmoker: number;
  price_per_100k_female_smoker: number;
  price_per_100k_female_nonsmoker: number;
}

// Default rates for reset functionality
const getDefaultRates = (): InsuranceRate[] => {
  const rates: InsuranceRate[] = [];
  for (let age = 18; age <= 75; age++) {
    const baseMultiplier = Math.pow(1.08, age - 25);
    rates.push({
      age,
      price_per_100k_male_smoker: Math.round(10 * baseMultiplier * 100) / 100,
      price_per_100k_male_nonsmoker: Math.round(5 * baseMultiplier * 100) / 100,
      price_per_100k_female_smoker: Math.round(8 * baseMultiplier * 100) / 100,
      price_per_100k_female_nonsmoker: Math.round(4 * baseMultiplier * 100) / 100,
    });
  }
  return rates;
};

const CalculatorsData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedRates, setEditedRates] = useState<Record<number, Partial<InsuranceRate>>>({});

  const { data: rates, isLoading } = useQuery({
    queryKey: ["life-insurance-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("life_insurance_rates")
        .select("*")
        .order("age", { ascending: true });
      if (error) throw error;
      return data as InsuranceRate[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: InsuranceRate[]) => {
      for (const rate of updates) {
        const { error } = await supabase
          .from("life_insurance_rates")
          .update({
            price_per_100k_male_smoker: rate.price_per_100k_male_smoker,
            price_per_100k_male_nonsmoker: rate.price_per_100k_male_nonsmoker,
            price_per_100k_female_smoker: rate.price_per_100k_female_smoker,
            price_per_100k_female_nonsmoker: rate.price_per_100k_female_nonsmoker,
          })
          .eq("age", rate.age);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["life-insurance-rates"] });
      setEditedRates({});
      toast({ title: "נשמר בהצלחה", description: "המחירים עודכנו" });
    },
    onError: () => {
      toast({ title: "שגיאה בשמירה", variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const defaults = getDefaultRates();
      for (const rate of defaults) {
        const { error } = await supabase
          .from("life_insurance_rates")
          .upsert(rate, { onConflict: "age" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["life-insurance-rates"] });
      setEditedRates({});
      toast({ title: "אופס לברירת מחדל", description: "כל המחירים חזרו לערכי ברירת המחדל" });
    },
    onError: () => {
      toast({ title: "שגיאה באיפוס", variant: "destructive" });
    },
  });

  const handleInputChange = (age: number, field: keyof InsuranceRate, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedRates((prev) => ({
      ...prev,
      [age]: {
        ...prev[age],
        [field]: numValue,
      },
    }));
  };

  const getValue = (rate: InsuranceRate, field: keyof InsuranceRate): number => {
    if (editedRates[rate.age]?.[field] !== undefined) {
      return editedRates[rate.age][field] as number;
    }
    return rate[field] as number;
  };

  const handleSave = () => {
    if (!rates) return;
    const updates = rates.map((rate) => ({
      ...rate,
      ...editedRates[rate.age],
    }));
    updateMutation.mutate(updates);
  };

  const hasChanges = Object.keys(editedRates).length > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                נתוני מחשבונים
              </h1>
              <p className="text-muted-foreground">
                ניהול טבלאות מחירים למחשבוני ביטוח
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
            >
              <RotateCcw className="w-4 h-4 ml-2" />
              איפוס לברירת מחדל
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              שמור שינויים
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ביטוח חיים - מחיר ל-100,000 ₪ כיסוי (לחודש)</CardTitle>
            <CardDescription>
              ערוך את המחירים לפי גיל, מין ומצב עישון. המחירים בש"ח לחודש עבור כל 100,000 ₪ סכום ביטוח.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right w-20">גיל</TableHead>
                      <TableHead className="text-right">גבר מעשן</TableHead>
                      <TableHead className="text-right">גבר לא מעשן</TableHead>
                      <TableHead className="text-right">אישה מעשנת</TableHead>
                      <TableHead className="text-right">אישה לא מעשנת</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates?.map((rate) => (
                      <TableRow key={rate.age}>
                        <TableCell className="font-medium">{rate.age}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={getValue(rate, "price_per_100k_male_smoker")}
                            onChange={(e) =>
                              handleInputChange(rate.age, "price_per_100k_male_smoker", e.target.value)
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={getValue(rate, "price_per_100k_male_nonsmoker")}
                            onChange={(e) =>
                              handleInputChange(rate.age, "price_per_100k_male_nonsmoker", e.target.value)
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={getValue(rate, "price_per_100k_female_smoker")}
                            onChange={(e) =>
                              handleInputChange(rate.age, "price_per_100k_female_smoker", e.target.value)
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={getValue(rate, "price_per_100k_female_nonsmoker")}
                            onChange={(e) =>
                              handleInputChange(rate.age, "price_per_100k_female_nonsmoker", e.target.value)
                            }
                            className="w-24"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CalculatorsData;
