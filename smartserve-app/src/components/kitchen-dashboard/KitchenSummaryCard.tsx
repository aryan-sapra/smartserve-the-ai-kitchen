
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Leaf, Drumstick, Vegan } from "lucide-react";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import type { StoredCheckInEntry } from "@/lib/schemas"; // Updated import

const CHECKINS_STORAGE_KEY = "smartserve_checkins_log";

interface SummaryData {
  totalMealAttendees: number; // Changed from totalCheckIns
  vegCount: number;
  nonVegCount: number;
  veganCount: number;
}

const initialSummaryData: SummaryData = {
  totalMealAttendees: 0,
  vegCount: 0,
  nonVegCount: 0,
  veganCount: 0,
};

export function KitchenSummaryCard() {
  const [summaryData, setSummaryData] = useState<SummaryData>(initialSummaryData);
  const [isClient, setIsClient] = useState(false);

  const loadSummaryDataFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedCheckIns = localStorage.getItem(CHECKINS_STORAGE_KEY);
      let newTotalMealAttendees = 0;
      let newVegCount = 0;
      let newNonVegCount = 0;
      let newVeganCount = 0;

      if (storedCheckIns) {
        try {
          const parsedCheckIns = JSON.parse(storedCheckIns) as StoredCheckInEntry[];
          parsedCheckIns.forEach(entry => {
            if (!entry.skipMealToday) { // Only count if not skipping meal
              newTotalMealAttendees++;
              const actualDiet = entry.todaysActualDiet || entry.dietPreference; // Use today's actual diet for counting
              if (actualDiet === 'veg') newVegCount++;
              else if (actualDiet === 'non-veg') newNonVegCount++;
              else if (actualDiet === 'vegan') newVeganCount++;
            }
          });
        } catch (error) {
          console.error("Error parsing check-ins from localStorage for kitchen summary:", error);
        }
      }
      setSummaryData({
        totalMealAttendees: newTotalMealAttendees,
        vegCount: newVegCount,
        nonVegCount: newNonVegCount,
        veganCount: newVeganCount,
      });
    }
  }, []); // Empty dependency array for useCallback as it doesn't depend on props/state outside its scope
  
  useEffect(() => {
    setIsClient(true);
    loadSummaryDataFromStorage();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHECKINS_STORAGE_KEY) {
        loadSummaryDataFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSummaryDataFromStorage]); // Added loadSummaryDataFromStorage to dependency array

  if (!isClient) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Today's Meal Summary</CardTitle>
          <CardDescription>Loading overview of meal preferences...</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                <Users className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Total Meal Attendees</p>
            </div>
            {/* Other placeholders */}
             <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                <Leaf className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Vegetarian</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                <Drumstick className="h-8 w-8 text-red-600 mb-2" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Non-Vegetarian</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                <Vegan className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Vegan</p>
            </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle>Today's Meal Summary</CardTitle>
        <CardDescription>Overview of meal preferences for today. (Updates pseudo-live)</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
          <Users className="h-8 w-8 text-primary mb-2" />
          <p className="text-2xl font-bold">{summaryData.totalMealAttendees}</p>
          <p className="text-xs text-muted-foreground">Total Meal Attendees</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
          <Leaf className="h-8 w-8 text-green-600 mb-2" />
          <p className="text-2xl font-bold">{summaryData.vegCount}</p>
          <p className="text-xs text-muted-foreground">Vegetarian</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
          <Drumstick className="h-8 w-8 text-red-600 mb-2" />
          <p className="text-2xl font-bold">{summaryData.nonVegCount}</p>
          <p className="text-xs text-muted-foreground">Non-Vegetarian</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
          <Vegan className="h-8 w-8 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">{summaryData.veganCount}</p>
          <p className="text-xs text-muted-foreground">Vegan</p>
        </div>
      </CardContent>
    </Card>
  );
}
