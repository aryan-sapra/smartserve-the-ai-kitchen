
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { suggestDishQuantities, type SuggestDishQuantitiesInput, type SuggestDishQuantitiesOutput } from "@/ai/flows/suggest-dish-quantities-flow";
import type { StoredCheckInEntry } from '@/lib/schemas';

const CHECKINS_STORAGE_KEY = "smartserve_checkins_log";
const EVENT_MULTIPLIER_STORAGE_KEY = "smartserve_current_event_multiplier";


interface CurrentCounts {
  totalCheckIns: number;
  vegCount: number;
  nonVegCount: number;
  veganCount: number;
}

interface Suggestion {
  dishName: string;
  quantity: string;
  note: string;
}

export function DishPreparationSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCounts, setCurrentCounts] = useState<CurrentCounts>({
    totalCheckIns: 0,
    vegCount: 0,
    nonVegCount: 0,
    veganCount: 0,
  });
  const [currentEventMultiplier, setCurrentEventMultiplier] = useState<number>(1.0);
  const [isClient, setIsClient] = useState(false);

  const loadCurrentCountsAndMultiplier = useCallback(() => {
    let newTotalCheckIns = 0;
    let newVegCount = 0;
    let newNonVegCount = 0;
    let newVeganCount = 0;
    let eventMultiplier = 1.0;

    if (typeof window !== 'undefined') {
      const storedCheckIns = localStorage.getItem(CHECKINS_STORAGE_KEY);
      if (storedCheckIns) {
        try {
          const parsedCheckIns = JSON.parse(storedCheckIns) as StoredCheckInEntry[];
          parsedCheckIns.forEach(entry => {
            if (!entry.skipMealToday) {
              newTotalCheckIns++;
              const actualDiet = entry.todaysActualDiet || entry.dietPreference;
              if (actualDiet === 'veg') newVegCount++;
              else if (actualDiet === 'non-veg') newNonVegCount++;
              else if (actualDiet === 'vegan') newVeganCount++;
            }
          });
        } catch (error) {
          console.error("Error parsing check-ins from localStorage for suggestions:", error);
        }
      }
      
      const storedMultiplier = localStorage.getItem(EVENT_MULTIPLIER_STORAGE_KEY);
      if (storedMultiplier) {
        const parsedMultiplier = parseFloat(storedMultiplier);
        if (!isNaN(parsedMultiplier)) {
          eventMultiplier = parsedMultiplier;
        }
      }
    }
    
    setCurrentCounts({
      totalCheckIns: newTotalCheckIns,
      vegCount: newVegCount,
      nonVegCount: newNonVegCount,
      veganCount: newVeganCount,
    });
    setCurrentEventMultiplier(eventMultiplier);

    return { // Return the counts for immediate use in fetchSuggestions
      counts: {
        totalCheckIns: newTotalCheckIns,
        vegCount: newVegCount,
        nonVegCount: newNonVegCount,
        veganCount: newVeganCount,
      },
      multiplier: eventMultiplier,
    };
  }, []);


  const fetchSuggestions = useCallback(async (counts: CurrentCounts, multiplier: number) => {
    setIsLoading(true);
    setError(null);

    if (counts.totalCheckIns === 0 && isClient) {
      setSuggestions([]);
      setError("No check-ins yet. Suggestions will appear once users check in.");
      setIsLoading(false);
      return;
    }
    
    try {
      const input: SuggestDishQuantitiesInput = {
        totalCheckIns: counts.totalCheckIns,
        vegCount: counts.vegCount,
        nonVegCount: counts.nonVegCount,
        veganCount: counts.veganCount,
        historicalWastePercentage: 0.08, 
        specialEventMultiplier: multiplier, // Use the dynamic multiplier
        dayOfWeekFactor: "Mid-week: standard demand, consider overall counts."
      };
      const response = await suggestDishQuantities(input);
      if (response && response.suggestions) {
        setSuggestions(response.suggestions);
      } else {
        setSuggestions([]); 
        setError("Received no suggestions from the AI. The model might be adjusting or input counts are very low.");
      }
    } catch (err) {
      console.error("Error fetching dish suggestions:", err);
      setError("Failed to load suggestions. Please ensure Genkit is running and check console for errors.");
      setSuggestions([]); 
    } finally {
      setIsLoading(false);
    }
  }, [isClient]); // isClient is stable after mount

  useEffect(() => {
    setIsClient(true);
    const { counts, multiplier } = loadCurrentCountsAndMultiplier();
    if (counts.totalCheckIns > 0 || multiplier !== 1.0) {
        fetchSuggestions(counts, multiplier);
    } else {
        setIsLoading(false);
        setError("No check-ins yet or no special event multiplier set. Suggestions will appear once users check in.");
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHECKINS_STORAGE_KEY || event.key === EVENT_MULTIPLIER_STORAGE_KEY || event.key === null) { // null for clear all
        const { counts: updatedCounts, multiplier: updatedMultiplier } = loadCurrentCountsAndMultiplier();
        fetchSuggestions(updatedCounts, updatedMultiplier);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadCurrentCountsAndMultiplier, fetchSuggestions]);


  if (!isClient) {
    return (
        <Card className="shadow-lg rounded-xl">
             <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />
                        AI Dish Preparation Suggestions
                    </div>
                </CardTitle>
                <CardDescription>Loading current check-in data...</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3">Initializing...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />
            AI Dish Preparation Suggestions
          </div>
          <Button variant="ghost" size="sm" onClick={() => fetchSuggestions(currentCounts, currentEventMultiplier)} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
            AI-powered suggestions based on {currentCounts.totalCheckIns} current meal attendees (Veg: {currentCounts.vegCount}, Non-Veg: {currentCounts.nonVegCount}, Vegan: {currentCounts.veganCount}).
            {currentEventMultiplier !== 1.0 && <span className="font-semibold text-primary"> Special Event Multiplier: {currentEventMultiplier.toFixed(1)}x applied.</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3">Loading intelligent suggestions...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="text-destructive p-4 bg-destructive/10 rounded-md border border-destructive/30">
            <p className="font-medium">Suggestion Status</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!isLoading && !error && suggestions.length === 0 && (
          <p className="text-muted-foreground p-4 text-center">No suggestions generated. This may be due to very low check-in counts or specific preferences. Try refreshing if counts increase or event multiplier is set.</p>
        )}
        {!isLoading && !error && suggestions.length > 0 &&
          suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 bg-muted/60 rounded-lg border border-border shadow-sm">
              <h4 className="font-semibold text-foreground text-base">{suggestion.dishName} - <span className="text-primary font-bold">{suggestion.quantity}</span></h4>
              <p className="text-sm text-muted-foreground mt-1">{suggestion.note}</p>
            </div>
          ))
        }
      </CardContent>
    </Card>
  );
}
