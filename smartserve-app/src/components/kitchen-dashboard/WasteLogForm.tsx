
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { wasteLogFormSchema, type WasteLogFormValues } from "@/lib/schemas";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { logKitchenWaste } from "@/app/actions"; // Import the server action

const WASTELOGS_STORAGE_KEY = "smartserve_wastelogs_log";

// Client-side helper functions for localStorage
const getStoredItems = (key: string): any[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

const setStoredItems = (key: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, JSON.stringify(items));
    // The browser automatically dispatches the 'storage' event to other tabs/windows
  }
};

export function WasteLogForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const form = useForm<WasteLogFormValues>({
    resolver: zodResolver(wasteLogFormSchema),
    defaultValues: {
      category: undefined,
      amount: 0,
    },
  });

  async function onSubmit(data: WasteLogFormValues) {
    setIsSubmitting(true);
    try {
      const result = await logKitchenWaste(data); // Call server action
      console.log("Server Action Result (Waste Log):", result);

      if (result.success && result.newWasteEntry) {
        toast({
          title: "Waste Logged Successfully!",
          description: `${data.amount} ${data.category === 'food' ? 'kg' : 'liters'} of ${data.category} waste recorded.`,
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent",
        });

        // Client-side: Update localStorage for live feed simulation
        try {
          const currentWasteLogs = getStoredItems(WASTELOGS_STORAGE_KEY);
          const updatedWasteLogs = [result.newWasteEntry, ...currentWasteLogs];
          setStoredItems(WASTELOGS_STORAGE_KEY, updatedWasteLogs.slice(0, 50)); // Keep last 50
          console.log("Client: Updated waste logs in localStorage:", updatedWasteLogs.slice(0,5));
        } catch (e) {
            console.error("Client: Error updating localStorage for waste logs:", e);
        }
        
        form.reset({category: undefined, amount: 0}); 
        setSelectedCategory(undefined); 
      } else {
        throw new Error(result.message || "Server action for waste log reported failure.");
      }
    } catch (error) {
       console.error("Waste logging failed:", error);
       toast({
        title: "Waste Logging Failed",
        description: (error as Error).message || "There was an issue logging waste. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setValue("category", value as "food" | "water"); 
    form.clearErrors("category"); 
  };
  
  const getUnit = () => {
    if (selectedCategory === "food") return "kg";
    if (selectedCategory === "water") return "liters";
    return "";
  };

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle>Log Waste</CardTitle>
        <CardDescription>Record food or water waste.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value); 
                      handleCategoryChange(value); 
                    }} 
                    value={field.value || ""} 
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount {getUnit() && `(${getUnit()})`}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 2.5" 
                      {...field} 
                      step="0.1" 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Waste
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
