
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlusCircle, MinusCircle, Check, AlertTriangle, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { Label } from "@/components/ui/label"; // Added Label

const MENU_STORAGE_KEY = "smartserve_todays_menu";
const USER_CONSUMPTION_LOG_KEY = "smartserve_user_consumption_log"; 

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  aiHint: string;
}

interface ConsumptionCounts {
  taken: number;
  wasted: number;
}

interface UserConsumptionLogEntry {
  id: string; 
  date: string;
  items: Array<{
    dishId: string;
    dishName: string;
    category: string;
    portionsTaken: number;
    portionsWasted: number;
    wastedWeightKg: number; 
  }>;
  actualMealTime?: string; // New field
  userId?: string; 
}

// Define meal time slot options
const mealTimeSlots = [
  "12:00 - 12:30 PM", "12:30 - 01:00 PM",
  "01:00 - 01:30 PM", "01:30 - 02:00 PM",
  "02:00 - 02:30 PM", "02:30 - 03:00 PM",
  "03:00 - 03:30 PM", "03:30 - 04:00 PM",
];

export default function MealConsumptionLogPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [consumptionCounts, setConsumptionCounts] = useState<{ [itemId: string]: ConsumptionCounts }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [actualMealTime, setActualMealTime] = useState<string | undefined>(undefined); // New state
  const { toast } = useToast();

  const loadMenuAndInitializeCounts = () => {
    setIsLoading(true);
    const storedMenuJson = localStorage.getItem(MENU_STORAGE_KEY);
    let currentMenuItems: MenuItem[] = [];
    if (storedMenuJson) {
      try {
        currentMenuItems = JSON.parse(storedMenuJson) as MenuItem[];
      } catch (e) {
        console.error("Failed to parse menu from localStorage", e);
        currentMenuItems = [];
      }
    }
    setMenuItems(currentMenuItems);
    setConsumptionCounts(
      currentMenuItems.reduce((acc, item) => {
        acc[item.id] = { taken: 0, wasted: 0 };
        return acc;
      }, {} as { [itemId: string]: ConsumptionCounts })
    );
    setActualMealTime(undefined); // Reset actual meal time when menu reloads
    setIsLoading(false);
  };

  useEffect(() => {
    loadMenuAndInitializeCounts();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === MENU_STORAGE_KEY || event.key === null) {
        loadMenuAndInitializeCounts();
        setIsSubmitted(false); 
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleCountChange = (itemId: string, type: keyof ConsumptionCounts, change: number) => {
    setConsumptionCounts(prevCounts => {
      const currentItemCounts = prevCounts[itemId] || { taken: 0, wasted: 0 };
      let newCount = Math.max(0, currentItemCounts[type] + change);
      
      let newTaken = currentItemCounts.taken;
      let newWasted = currentItemCounts.wasted;

      if (type === 'taken') {
        newTaken = newCount;
        if (newTaken < newWasted) { 
          newWasted = newTaken;
        }
      } else { 
        if (newCount > newTaken) {
             toast({
                title: "Invalid Input",
                description: "Wasted portions cannot exceed portions taken.",
                variant: "destructive",
            });
            newWasted = newTaken; 
        } else {
            newWasted = newCount;
        }
      }
      
      return {
        ...prevCounts,
        [itemId]: { taken: newTaken, wasted: newWasted },
      };
    });
  };

  const handleSubmitLog = () => {
    if (!actualMealTime) {
      toast({
        title: "Actual Meal Time Required",
        description: "Please select the time you had your meal.",
        variant: "destructive",
      });
      return;
    }

    const logItems = menuItems
      .map(item => {
        const counts = consumptionCounts[item.id] || { taken: 0, wasted: 0 };
        if (counts.taken > 0 || counts.wasted > 0) { 
          return {
            dishId: item.id,
            dishName: item.name,
            category: item.category,
            portionsTaken: counts.taken,
            portionsWasted: counts.wasted,
            wastedWeightKg: parseFloat((counts.wasted * 0.1).toFixed(2)), 
          };
        }
        return null;
      })
      .filter(item => item !== null) as UserConsumptionLogEntry['items'];

    if (logItems.length === 0) {
      toast({
        title: "No Consumption to Log",
        description: "Please log portions taken or wasted for at least one item.",
        variant: "destructive",
      });
      return;
    }
    
    const newLogEntry: UserConsumptionLogEntry = {
      id: `ucl-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      items: logItems,
      actualMealTime: actualMealTime, // Save actual meal time
    };

    try {
      const existingLogsJson = localStorage.getItem(USER_CONSUMPTION_LOG_KEY);
      const existingLogs: UserConsumptionLogEntry[] = existingLogsJson ? JSON.parse(existingLogsJson) : [];
      localStorage.setItem(USER_CONSUMPTION_LOG_KEY, JSON.stringify([newLogEntry, ...existingLogs].slice(0,100))); 
      window.dispatchEvent(new StorageEvent('storage', { key: USER_CONSUMPTION_LOG_KEY }));

      setIsSubmitted(true);
      toast({
          title: "Log Submitted!",
          description: "Your meal consumption has been recorded.",
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent",
      });

    } catch (error) {
        console.error("Error saving consumption log to localStorage:", error);
        toast({
            title: "Failed to Save Log",
            description: "Could not save your consumption log.",
            variant: "destructive",
        });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Log Your Meal Consumption</h1>
        <p className="text-muted-foreground">Loading menu for consumption logging...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden shadow-lg rounded-xl">
              <Skeleton className="h-56 w-full" />
              <CardHeader className="pt-4 pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-4 pt-0 space-y-3">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
     return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Log Your Meal Consumption</h1>
         <Card className="shadow-md rounded-xl border-dashed border-muted-foreground/50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-muted-foreground">Menu Not Available</p>
            <p className="text-sm text-muted-foreground">
              Today's menu has not been set by the kitchen staff yet, or is empty.
              Unable to log consumption.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Log Your Meal Consumption</h1>
      <p className="text-muted-foreground">
        Help us understand consumption patterns by logging what you took and what was wasted.
      </p>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" />Actual Meal Time</CardTitle>
          <CardDescription>Please select the approximate time you had your meal today.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="actual-meal-time">Meal Time Slot</Label>
            <Select
              value={actualMealTime}
              onValueChange={setActualMealTime}
              disabled={isSubmitted}
            >
              <SelectTrigger id="actual-meal-time">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {mealTimeSlots.map(slot => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden shadow-lg rounded-xl flex flex-col"
          >
            <div className="relative w-full h-48 sm:h-56">
              <Image
                src={item.image} 
                alt={item.name}
                fill
                sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 30vw"
                objectFit="cover"
                data-ai-hint={item.aiHint}
                unoptimized={item.image.startsWith('/')} 
              />
            </div>
            <CardHeader className="pt-4 pb-2">
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 pt-0 space-y-3 flex-grow">
              <p className="text-sm text-muted-foreground">{item.description || "Description not available"}</p>
              <Separator className="my-3" />
              <div>
                <h4 className="text-sm font-medium mb-1.5 text-foreground">Portions I Took</h4>
                <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-md shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => handleCountChange(item.id, "taken", -1)}
                    disabled={(consumptionCounts[item.id]?.taken || 0) <= 0 || isSubmitted}
                  >
                    <MinusCircle className="h-5 w-5" />
                    <span className="sr-only">Decrease taken portions</span>
                  </Button>
                  <span className="text-sm font-medium text-foreground w-8 text-center tabular-nums">
                    {consumptionCounts[item.id]?.taken || 0}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => handleCountChange(item.id, "taken", 1)}
                    disabled={isSubmitted}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Increase taken portions</span>
                  </Button>
                  <span className="text-xs text-muted-foreground ml-1">portions</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1.5 text-foreground">Portions I Wasted</h4>
                <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-md shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleCountChange(item.id, "wasted", -1)}
                    disabled={(consumptionCounts[item.id]?.wasted || 0) <= 0 || isSubmitted}
                  >
                    <MinusCircle className="h-5 w-5" />
                    <span className="sr-only">Decrease wasted portions</span>
                  </Button>
                  <span className="text-sm font-medium text-foreground w-8 text-center tabular-nums">
                    {consumptionCounts[item.id]?.wasted || 0}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleCountChange(item.id, "wasted", 1)}
                    disabled={isSubmitted || (consumptionCounts[item.id]?.taken || 0) <= (consumptionCounts[item.id]?.wasted || 0)}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Increase wasted portions</span>
                  </Button>
                  <span className="text-xs text-muted-foreground ml-1">portions</span>
                </div>
                 {(consumptionCounts[item.id]?.wasted || 0) > (consumptionCounts[item.id]?.taken || 0) && (
                    <p className="text-xs text-destructive mt-1">Wasted portions cannot exceed portions taken.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {menuItems.length > 0 && (
        <div className="flex justify-end mt-6">
            <Button onClick={handleSubmitLog} disabled={isSubmitted} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSubmitted ? (
                <>
                <Check className="mr-2 h-4 w-4" />
                Submitted
                </>
            ) : (
                "Submit Consumption Log"
            )}
            </Button>
        </div>
      )}
    </div>
  );
}
