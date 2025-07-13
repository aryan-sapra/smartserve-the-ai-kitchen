
"use client";

import React, { useState, useEffect } from "react"; // Added React for React.Fragment
import Link from "next/link"; // Added Link for the button
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Utensils, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton import

const MENU_STORAGE_KEY = "smartserve_todays_menu";
const KITCHEN_DISH_WASTE_LOG_KEY = "smartserve_kitchen_dish_waste_log";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  image: string; 
  aiHint: string; 
}

interface DishWasteInput {
  [dishId: string]: number; // amount in kg
}

interface KitchenDishWasteLogEntry {
  id: string; // log entry id
  date: string;
  items: Array<{
    dishId: string;
    dishName: string;
    category: string;
    amountWastedKg: number;
  }>;
}

export default function LogDishWastePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [dishWasteAmounts, setDishWasteAmounts] = useState<DishWasteInput>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const loadMenu = () => {
    setIsLoadingMenu(true);
    const storedMenuJson = localStorage.getItem(MENU_STORAGE_KEY);
    if (storedMenuJson) {
      try {
        const parsedMenu = JSON.parse(storedMenuJson) as MenuItem[];
        setMenuItems(parsedMenu);
        // Initialize waste amounts for loaded menu
        setDishWasteAmounts(parsedMenu.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
      } catch (e) {
        console.error("Failed to parse menu from localStorage", e);
        setMenuItems([]);
      }
    } else {
      setMenuItems([]);
    }
    setIsLoadingMenu(false);
  };

  useEffect(() => {
    loadMenu();
    // No storage event listener needed for menu here, as it's a one-time load for form setup
  }, []);

  const handleWasteAmountChange = (dishId: string, amount: string) => {
    const numericAmount = parseFloat(amount);
    setDishWasteAmounts(prev => ({
      ...prev,
      [dishId]: isNaN(numericAmount) || numericAmount < 0 ? 0 : numericAmount,
    }));
  };

  const handleSubmitDishWaste = () => {
    setIsSubmitting(true);
    const wasteLogItems = menuItems
      .map(item => {
        const amountWastedKg = dishWasteAmounts[item.id] || 0;
        if (amountWastedKg > 0) {
          return {
            dishId: item.id,
            dishName: item.name,
            category: item.category,
            amountWastedKg: amountWastedKg,
          };
        }
        return null;
      })
      .filter(item => item !== null) as KitchenDishWasteLogEntry['items'];

    if (wasteLogItems.length === 0) {
      toast({
        title: "No Waste to Log",
        description: "Please enter waste amounts for at least one dish.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const newLogEntry: KitchenDishWasteLogEntry = {
      id: `kdw-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      items: wasteLogItems,
    };

    try {
      const existingLogsJson = localStorage.getItem(KITCHEN_DISH_WASTE_LOG_KEY);
      const existingLogs: KitchenDishWasteLogEntry[] = existingLogsJson ? JSON.parse(existingLogsJson) : [];
      localStorage.setItem(KITCHEN_DISH_WASTE_LOG_KEY, JSON.stringify([newLogEntry, ...existingLogs].slice(0,50)));
      window.dispatchEvent(new StorageEvent('storage', { key: KITCHEN_DISH_WASTE_LOG_KEY }));


      toast({
        title: "Dish Waste Logged!",
        description: `${wasteLogItems.length} dish(es) waste recorded successfully.`,
        className: "bg-accent text-accent-foreground border-accent",
      });
      // Reset form
      setDishWasteAmounts(menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
    } catch (error) {
      console.error("Error saving kitchen dish waste to localStorage:", error);
      toast({
        title: "Failed to Log Waste",
        description: "Could not save the dish waste log.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoadingMenu) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Log Specific Dish Waste</h1>
        <p className="text-muted-foreground">Loading today's menu...</p>
        <Card className="shadow-lg rounded-xl">
            <CardHeader><CardTitle>Today's Dishes</CardTitle></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Log Specific Dish Waste</h1>
        <Card className="shadow-md rounded-xl border-dashed border-muted-foreground/50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-muted-foreground">Menu Not Set</p>
            <p className="text-sm text-muted-foreground">
              "Today's Menu" must be set first before logging specific dish waste.
            </p>
             <Button variant="link" asChild className="mt-2"><Link href="/kitchen-dashboard/log-todays-menu">Set Today's Menu</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Log Specific Dish Waste</h1>
      <p className="text-muted-foreground">
        Enter the amount (in kg) of prepared food wasted for each specific dish from today's menu.
      </p>
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><Utensils className="mr-2 h-5 w-5 text-primary" /> Today's Menu Items</CardTitle>
          <CardDescription>Input waste for each item that was prepared and had leftovers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border rounded-md bg-muted/30">
                <div className="md:col-span-2">
                  <Label htmlFor={`waste-${item.id}`} className="font-medium text-foreground">{item.name}</Label>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id={`waste-${item.id}`}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={dishWasteAmounts[item.id] || ""}
                    onChange={(e) => handleWasteAmountChange(item.id, e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
              {index < menuItems.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSubmitDishWaste} disabled={isSubmitting} className="ml-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Submit Dish Waste Log
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
