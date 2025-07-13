
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Preference = "veg" | "non-veg" | "vegan";
export type TodaysChoice = Preference | "skip";

interface MealPreferenceCardProps {
  initialDefaultPreference: Preference;
  onDefaultPreferenceChange: (newPreference: Preference) => void;
  initialTodaysChoice: TodaysChoice;
  onTodaysChoiceChange: (newChoice: TodaysChoice) => void;
}

export function MealPreferenceCard({ 
  initialDefaultPreference, 
  onDefaultPreferenceChange,
  initialTodaysChoice,
  onTodaysChoiceChange
}: MealPreferenceCardProps) {
  const [defaultPreference, setDefaultPreference] = useState<Preference>(initialDefaultPreference);
  const [todaysChoiceDisplay, setTodaysChoiceDisplay] = useState<TodaysChoice>(initialTodaysChoice);

  useEffect(() => {
    setDefaultPreference(initialDefaultPreference);
  }, [initialDefaultPreference]);

  useEffect(() => {
    setTodaysChoiceDisplay(initialTodaysChoice);
  }, [initialTodaysChoice]);

  const preferenceOptions: Preference[] = ["veg", "non-veg", "vegan"];
  const todayOptions: TodaysChoice[] = ["veg", "non-veg", "vegan", "skip"];

  const getDisplayLabel = (pref: Preference | TodaysChoice | null) => {
    if (!pref) return "Not set";
    switch(pref) {
      case "veg": return "Vegetarian";
      case "non-veg": return "Non-Vegetarian";
      case "vegan": return "Vegan";
      case "skip": return "Skip Meal";
      default: return "Not set";
    }
  };

  const handleTodaysPreferenceSelect = (pref: TodaysChoice) => {
    setTodaysChoiceDisplay(pref);
    onTodaysChoiceChange(pref);
  };

  const handleDefaultPreferenceSelect = (pref: Preference) => {
    setDefaultPreference(pref);
    onDefaultPreferenceChange(pref);
  };


  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle>Meal Preference</CardTitle>
        <CardDescription>Manage your default and daily meal choices.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Your Default Preference</h3>
          <div className="flex space-x-1 rounded-md bg-muted p-1">
            {preferenceOptions.map((pref) => (
              <Button
                key={`default-${pref}`}
                variant={defaultPreference === pref ? "default" : "ghost"}
                onClick={() => handleDefaultPreferenceSelect(pref)}
                className={cn(
                  "flex-1 transition-all duration-150 ease-in-out",
                  defaultPreference === pref 
                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                  "text-xs sm:text-sm h-9"
                )}
                size="sm"
              >
                {getDisplayLabel(pref)}
              </Button>
            ))}
          </div>
           <p className="text-xs text-muted-foreground mt-2">
            This is your general preference saved in your profile.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Today's Meal Choice</h3>
           <div className="flex space-x-1 rounded-md bg-muted p-1">
            {todayOptions.map((pref) => (
              <Button
                key={`today-${pref}`}
                variant={todaysChoiceDisplay === pref ? "secondary" : "ghost"}
                onClick={() => handleTodaysPreferenceSelect(pref)}
                 className={cn(
                  "flex-1 transition-all duration-150 ease-in-out",
                  todaysChoiceDisplay === pref
                    ? "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80" 
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                  "text-xs sm:text-sm h-9"
                )}
                size="sm"
              >
                {getDisplayLabel(pref)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Your selection for today is: {getDisplayLabel(todaysChoiceDisplay)}. This will be used for kitchen planning.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
