
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { checkInFormSchema, type CheckInFormValues } from "@/lib/schemas";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { handleUserCheckIn } from "@/app/actions"; // Import the server action

interface CheckInFormProps {
  onCheckInSuccess: (values: CheckInFormValues) => void;
}

const CHECKINS_STORAGE_KEY = "smartserve_checkins_log";

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
    // when localStorage.setItem is called. No need to manually dispatch here.
  }
};

const lunchTimingOptions = [
  { value: "12-1", label: "12:00 PM - 01:00 PM" },
  { value: "1-2", label: "01:00 PM - 02:00 PM" },
  { value: "2-3", label: "02:00 PM - 03:00 PM" },
  { value: "3-4", label: "03:00 PM - 04:00 PM" },
];

export function CheckInForm({ onCheckInSuccess }: CheckInFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      name: "",
      email: "",
      dietPreference: undefined,
      preferredLunchTiming: undefined,
    },
  });

  async function onSubmit(data: CheckInFormValues) {
    setIsSubmitting(true);
    
    try {
      const result = await handleUserCheckIn(data); // Call the server action
      console.log("Server Action Result:", result);

      if (result.success && result.newCheckInEntry) {
        toast({
          title: "Check-in Successful!",
          description: `Welcome, ${data.name}! Your details are being processed.`,
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent",
        });

        // Client-side: Update localStorage for live feed simulation
        try {
          const currentCheckIns = getStoredItems(CHECKINS_STORAGE_KEY);
          const updatedCheckIns = [result.newCheckInEntry, ...currentCheckIns];
          setStoredItems(CHECKINS_STORAGE_KEY, updatedCheckIns.slice(0, 50)); // Keep last 50
          console.log("Client: Updated check-ins in localStorage:", updatedCheckIns.slice(0,5));
        } catch (e) {
          console.error("Client: Error updating localStorage for check-ins:", e);
        }
        
        onCheckInSuccess(data); // For client-side redirect and main user data localStorage
        form.reset();
      } else {
        throw new Error(result.message || "Server action reported failure.");
      }
    } catch (error) {
      console.error("Check-in failed:", error);
      toast({
        title: "Check-in Failed",
        description: (error as Error).message || "There was an issue with your check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g. jane.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dietPreference"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Dietary Preference</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="veg" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Vegetarian
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="non-veg" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Non-Vegetarian
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="vegan" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Vegan
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferredLunchTiming"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Lunch Timing</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred lunch slot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lunchTimingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Check In
        </Button>
      </form>
    </Form>
  );
}
