
"use client";

import { useState, useEffect, useCallback } from 'react'; 
import { MealPreferenceCard, type TodaysChoice } from "@/components/dashboard/MealPreferenceCard";
import { NotificationsCard } from "@/components/dashboard/NotificationsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Lightbulb, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CheckInFormValues, StoredCheckInEntry } from '@/lib/schemas';
import { suggestSmartSlot, type SuggestSmartSlotInput, type SuggestSmartSlotOutput } from "@/ai/flows/suggest-smart-slot-flow";
import { cn } from '@/lib/utils';

const USER_DATA_KEY = "smartserve_user";
const CHECKINS_STORAGE_KEY = "smartserve_checkins_log";

type DietPreference = 'veg' | 'non-veg' | 'vegan';
type PreferredLunchTimingSlot = "12-1" | "1-2" | "2-3" | "3-4";


const lunchTimingOptions = [
  { value: "12-1", label: "12:00 PM - 01:00 PM" },
  { value: "1-2", label: "01:00 PM - 02:00 PM" },
  { value: "2-3", label: "02:00 PM - 03:00 PM" },
  { value: "3-4", label: "03:00 PM - 04:00 PM" },
];

const getTimingLabel = (value: string | undefined) => {
  if (!value) return "Not set";
  return lunchTimingOptions.find(opt => opt.value === value)?.label || "Not set";
};

interface SmartSlotSuggestion {
  slotDescription: string;
  reasoning: string;
  congestionLevel: "Low" | "Medium" | "High" | "Very High";
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [preferredTiming, setPreferredTiming] = useState<PreferredLunchTimingSlot | undefined>(undefined);
  const [defaultDietPreference, setDefaultDietPreference] = useState<DietPreference>('veg');
  const [todaysChoice, setTodaysChoice] = useState<TodaysChoice>('veg'); 
  const [isClient, setIsClient] = useState(false);

  const [smartSlotSuggestions, setSmartSlotSuggestions] = useState<SmartSlotSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [selectedSmartSlot, setSelectedSmartSlot] = useState<SmartSlotSuggestion | null>(null);


  const updateCheckInLog = useCallback((fieldsToUpdate: Partial<StoredCheckInEntry>) => {
    if (!userEmail || typeof window === 'undefined') return;

    const storedCheckInsString = localStorage.getItem(CHECKINS_STORAGE_KEY);
    if (storedCheckInsString) {
      try {
        let storedCheckIns: StoredCheckInEntry[] = JSON.parse(storedCheckInsString);
        let updated = false;
        // Find the most recent entry for the user to update
        // Assuming entries are prepended, the first match is the latest for that user.
        const userEntryIndex = storedCheckIns.findIndex(entry => entry.email === userEmail);
        
        if (userEntryIndex !== -1) {
            storedCheckIns[userEntryIndex] = { 
                ...storedCheckIns[userEntryIndex], 
                ...fieldsToUpdate 
            };
            updated = true;
        }

        if (updated) {
          localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(storedCheckIns));
          // Dispatch storage event so other tabs (admin/kitchen) can update
          window.dispatchEvent(new StorageEvent('storage', { key: CHECKINS_STORAGE_KEY }));
          console.log("Updated check-in log for", userEmail, "with", fieldsToUpdate);
        } else {
          // This case should ideally not happen if user is checked-in and on dashboard
          console.warn("Could not find user's check-in entry to update for dashboard changes.");
        }
      } catch (error) {
        console.error("Error updating check-in log from dashboard:", error);
      }
    }
  }, [userEmail]);

  const loadUserData = useCallback(() => {
    const storedUserDataString = localStorage.getItem(USER_DATA_KEY);
    let currentEmail: string | undefined;
    let currentDefaultDiet: DietPreference = 'veg';
    let currentPreferredTiming: PreferredLunchTimingSlot | undefined = undefined;

    if (storedUserDataString) {
      try {
        const storedUserData: CheckInFormValues = JSON.parse(storedUserDataString);
        setUserName(storedUserData.name || "User");
        currentEmail = storedUserData.email;
        setUserEmail(currentEmail);
        currentPreferredTiming = storedUserData.preferredLunchTiming as PreferredLunchTimingSlot;
        setPreferredTiming(currentPreferredTiming);
        currentDefaultDiet = storedUserData.dietPreference || 'veg';
        setDefaultDietPreference(currentDefaultDiet);
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem(USER_DATA_KEY); 
      }
    }

    // Load today's choice and skip status from the check-in log
    if (currentEmail) {
      const storedCheckInsString = localStorage.getItem(CHECKINS_STORAGE_KEY);
      if (storedCheckInsString) {
        try {
          const storedCheckIns: StoredCheckInEntry[] = JSON.parse(storedCheckInsString);
          // Find the most recent check-in for the user
          const userLatestCheckIn = storedCheckIns.find(entry => entry.email === currentEmail); 
          if (userLatestCheckIn) {
            if (userLatestCheckIn.skipMealToday) {
              setTodaysChoice('skip');
            } else {
              setTodaysChoice(userLatestCheckIn.todaysActualDiet || userLatestCheckIn.dietPreference || currentDefaultDiet);
            }
            // Ensure preferredTiming is also updated from the latest check-in if different
            if(userLatestCheckIn.preferredLunchTiming && userLatestCheckIn.preferredLunchTiming !== currentPreferredTiming) {
                setPreferredTiming(userLatestCheckIn.preferredLunchTiming as PreferredLunchTimingSlot);
            }
          } else {
             setTodaysChoice(currentDefaultDiet); // Fallback if no check-in found
          }
        } catch (e) { console.error("Error parsing check-ins for today's choice", e); setTodaysChoice(currentDefaultDiet); }
      } else {
         setTodaysChoice(currentDefaultDiet); // Fallback if no check-ins log
      }
    } else {
        setTodaysChoice(currentDefaultDiet); // Fallback if no user email (user not checked in)
    }
  }, [updateCheckInLog]); // updateCheckInLog is stable due to its own useCallback


  useEffect(() => {
    setIsClient(true);
    loadUserData();
  }, [loadUserData]);


  const handleTimingChange = (newTimingValue: string) => {
    const newTiming = newTimingValue as PreferredLunchTimingSlot;
    setPreferredTiming(newTiming);
    // Update USER_DATA_KEY for future check-ins or profile persistence
    const storedUserDataString = localStorage.getItem(USER_DATA_KEY);
    let updatedUserData: Partial<CheckInFormValues> = {};
    if (storedUserDataString) {
      try {
        updatedUserData = JSON.parse(storedUserDataString);
      } catch (error) {
        // Initialize if parsing fails or not present
        updatedUserData = { name: userName, email: userEmail, dietPreference: defaultDietPreference }; 
      }
    } else {
        updatedUserData = { name: userName, email: userEmail, dietPreference: defaultDietPreference };
    }
    localStorage.setItem(USER_DATA_KEY, JSON.stringify({ ...updatedUserData, preferredLunchTiming: newTiming }));
    // Update the current day's check-in log
    updateCheckInLog({ preferredLunchTiming: newTiming });
  };

  const handleDefaultDietChange = (newDiet: DietPreference) => {
    setDefaultDietPreference(newDiet);
    const storedUserDataString = localStorage.getItem(USER_DATA_KEY);
    let updatedUserData: Partial<CheckInFormValues> = {};
     if (storedUserDataString) {
      try {
        updatedUserData = JSON.parse(storedUserDataString);
      } catch (error) {
        updatedUserData = { name: userName, email: userEmail, preferredLunchTiming: preferredTiming };
      }
    } else {
        updatedUserData = { name: userName, email: userEmail, preferredLunchTiming: preferredTiming };
    }
    localStorage.setItem(USER_DATA_KEY, JSON.stringify({ ...updatedUserData, dietPreference: newDiet }));
    
    // Update the check-in log with new default, and also today's actual if not skipping
    const fieldsToUpdate: Partial<StoredCheckInEntry> = { dietPreference: newDiet };
    if (todaysChoice !== 'skip') {
        fieldsToUpdate.todaysActualDiet = newDiet;
    }
    updateCheckInLog(fieldsToUpdate);
  };

  const handleTodaysChoiceChange = (choice: TodaysChoice) => {
    setTodaysChoiceDisplay(choice); 
    if (choice === "skip") {
      updateCheckInLog({ skipMealToday: true });
    } else {
      // If changing from 'skip' or to a different diet, update 'todaysActualDiet' and ensure 'skipMealToday' is false.
      updateCheckInLog({ skipMealToday: false, todaysActualDiet: choice as DietPreference });
    }
  };
  
  // Separate state for display to avoid immediate re-triggering from MealPreferenceCard
  const [todaysChoiceDisplay, setTodaysChoiceDisplay] = useState<TodaysChoice>(todaysChoice);
  useEffect(() => {
    setTodaysChoiceDisplay(todaysChoice);
  }, [todaysChoice]);


  const fetchSmartSlotSuggestions = async () => {
    if (!preferredTiming) {
      setSuggestionError("Please set your preferred lunch timing first.");
      setSelectedSmartSlot(null);
      return;
    }
    setIsFetchingSuggestions(true);
    setSuggestionError(null);
    setSmartSlotSuggestions([]);
    setSelectedSmartSlot(null);

    try {
      const storedCheckInsString = localStorage.getItem(CHECKINS_STORAGE_KEY);
      const preferredSlotDistribution: Record<PreferredLunchTimingSlot, number> = { "12-1": 0, "1-2": 0, "2-3": 0, "3-4": 0 };
      
      if (storedCheckInsString) {
        const storedCheckIns: StoredCheckInEntry[] = JSON.parse(storedCheckInsString);
        storedCheckIns.forEach(entry => {
          if (!entry.skipMealToday && entry.preferredLunchTiming) {
            const slot = entry.preferredLunchTiming as PreferredLunchTimingSlot;
            if (preferredSlotDistribution.hasOwnProperty(slot)) {
              preferredSlotDistribution[slot]++;
            }
          }
        });
      }

      const input: SuggestSmartSlotInput = {
        userPreferredSlot: preferredTiming,
        preferredSlotDistribution: preferredSlotDistribution,
        userHistoricalAdherenceFactor: "Moderately flexible", // Mocked for now
      };

      const response = await suggestSmartSlot(input);
      if (response && response.suggestions) {
        setSmartSlotSuggestions(response.suggestions);
      } else {
        setSuggestionError("No suggestions available at the moment.");
      }
    } catch (err) {
      console.error("Error fetching smart slot suggestions:", err);
      setSuggestionError("Failed to load suggestions. Please try again.");
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const mapDescriptionToSlotValue = (description: string): PreferredLunchTimingSlot | undefined => {
    const descLower = description.toLowerCase();
    if (descLower.includes("12")) return "12-1";
    if (descLower.includes("1 pm") || descLower.includes("01:") || descLower.includes("1-2") || descLower.includes("1:")) return "1-2";
    if (descLower.includes("2 pm") || descLower.includes("02:") || descLower.includes("2-3") || descLower.includes("2:")) return "2-3";
    if (descLower.includes("3 pm") || descLower.includes("03:") || descLower.includes("3-4") || descLower.includes("3:")) return "3-4";
    return undefined; // Fallback
  };

  const handleConfirmSmartSlot = () => {
    if (selectedSmartSlot) {
      const newTimingValue = mapDescriptionToSlotValue(selectedSmartSlot.slotDescription);
      if (newTimingValue) {
        handleTimingChange(newTimingValue);
        // Optionally reset suggestions
        setSmartSlotSuggestions([]);
        setSelectedSmartSlot(null);
      } else {
        setSuggestionError("Could not map suggestion to a standard time slot. Please select manually.");
      }
    }
  };

  
  if (!isClient) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Loading SmartServe Dashboard...
            </h1>
         </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
        Today's SmartServe Dashboard, {userName}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MealPreferenceCard 
            initialDefaultPreference={defaultDietPreference}
            onDefaultPreferenceChange={handleDefaultDietChange}
            initialTodaysChoice={todaysChoiceDisplay}
            onTodaysChoiceChange={handleTodaysChoiceChange}
          />
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Preferred Lunch Timings
              </CardTitle>
              <CardDescription>Your registered preferred time for lunch. You can change it here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg font-semibold text-foreground">
                Current: {getTimingLabel(preferredTiming)}
              </p>
              <div>
                <Select onValueChange={handleTimingChange} value={preferredTiming}>
                  <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Change preferred lunch slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {lunchTimingOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This is your general preference. Actual service times may vary.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                Smart Lunch Slot Suggestions
              </CardTitle>
              <CardDescription>Get AI-powered suggestions for less crowded lunch times. Click a suggestion to select it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchSmartSlotSuggestions} disabled={isFetchingSuggestions}>
                {isFetchingSuggestions ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-4 w-4" /> 
                )}
                Get Smart Slot Suggestion
              </Button>
              {isFetchingSuggestions && <p className="text-sm text-muted-foreground">Fetching suggestions...</p>}
              {suggestionError && (
                <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> {suggestionError}
                </div>
              )}
              {!isFetchingSuggestions && smartSlotSuggestions.length > 0 && (
                <div className="space-y-3 mt-3">
                  {smartSlotSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-3 border rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedSmartSlot?.slotDescription === suggestion.slotDescription && "ring-2 ring-primary border-primary bg-primary/10"
                      )}
                      onClick={() => setSelectedSmartSlot(suggestion)}
                    >
                      <p className={cn("font-semibold", selectedSmartSlot?.slotDescription === suggestion.slotDescription ? "text-primary" : "text-foreground")}>{suggestion.slotDescription}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                      <p className="text-xs mt-1">Congestion: <span className="font-medium">{suggestion.congestionLevel}</span></p>
                    </div>
                  ))}
                   {selectedSmartSlot && (
                    <Button onClick={handleConfirmSmartSlot} className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Set "{selectedSmartSlot.slotDescription.substring(0,25)}{selectedSmartSlot.slotDescription.length > 25 ? '...' : ''}" as My Preferred Time
                    </Button>
                  )}
                </div>
              )}
              {!isFetchingSuggestions && !suggestionError && smartSlotSuggestions.length === 0 && !preferredTiming && (
                 <p className="text-sm text-muted-foreground">Set your preferred lunch timing above to get suggestions.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Last 3 Meals Feedback</CardTitle>
              <CardDescription>Review feedback from your recent meals.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Feedback for previous meals will be displayed here. (Placeholder)
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <NotificationsCard />
        </div>
      </div>
    </div>
  );
}
