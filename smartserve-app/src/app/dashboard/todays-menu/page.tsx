
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlusCircle, MinusCircle, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const MENU_STORAGE_KEY = "smartserve_todays_menu";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  aiHint: string;
}

export default function TodaysMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [portionCounts, setPortionCounts] = useState<{ [itemId: string]: number }>({});
  const [preferences, setPreferences] = useState<Set<string>>(new Set());

  const loadMenu = () => {
    setIsLoading(true);
    const storedMenuJson = localStorage.getItem(MENU_STORAGE_KEY);
    if (storedMenuJson) {
      try {
        const parsedMenu = JSON.parse(storedMenuJson) as MenuItem[];
        setMenuItems(parsedMenu);
        // Reset selections and counts when menu changes
        setSelectedItemId(null);
        setPortionCounts(parsedMenu.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {}));
        setPreferences(new Set());
      } catch (e) {
        console.error("Failed to parse menu from localStorage", e);
        setMenuItems([]); // Set to empty if parsing fails
      }
    } else {
      setMenuItems([]); // No menu set by kitchen
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMenu(); // Initial load

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === MENU_STORAGE_KEY || event.key === null) { // null for direct dispatch
        loadMenu();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  useEffect(() => {
    // Initialize portion counts for currently loaded menu items
    setPortionCounts(menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {}));
  }, [menuItems]);


  const handleSelectItem = (itemId: string) => {
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      // If a selected item is deselected by clicking the card, remove from preferences
      if (preferences.has(itemId)) {
        const newPreferences = new Set(preferences);
        newPreferences.delete(itemId);
        setPreferences(newPreferences);
      }
    } else {
      setSelectedItemId(itemId);
    }
  };

  const handlePortionChange = (itemId: string, change: number) => {
    setPortionCounts(prevCounts => {
      const newCount = Math.max(1, (prevCounts[itemId] || 1) + change);
      return { ...prevCounts, [itemId]: newCount };
    });
  };

  const handleTogglePreference = (itemId: string) => {
    const newPreferences = new Set(preferences);
    if (newPreferences.has(itemId)) {
      newPreferences.delete(itemId);
    } else {
      newPreferences.add(itemId);
    }
    setPreferences(newPreferences);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Today's Menu</h1>
        <p className="text-muted-foreground">Loading today's menu from the kitchen...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden shadow-lg rounded-xl">
              <Skeleton className="h-56 w-full" />
              <CardHeader className="pt-4 pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
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
        <h1 className="text-2xl sm:text-3xl font-bold">Today's Menu</h1>
        <Card className="shadow-md rounded-xl border-dashed border-muted-foreground/50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-muted-foreground">Menu Not Set</p>
            <p className="text-sm text-muted-foreground">
              Today's menu has not been set by the kitchen staff yet. Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Today's Menu</h1>
      <p className="text-muted-foreground">
        Here's what's cooking today. Select an item to see more details or adjust portions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "overflow-hidden shadow-lg rounded-xl cursor-pointer transition-all duration-200 ease-in-out flex flex-col",
              selectedItemId === item.id ? "border-2 border-accent ring-2 ring-accent/50" : "border-border"
            )}
            onClick={() => handleSelectItem(item.id)}
          >
            <div className="relative w-full h-56">
              <Image
                src={item.image} // Use local path
                alt={item.name}
                layout="fill"
                objectFit="cover"
                data-ai-hint={item.aiHint}
                unoptimized={item.image.startsWith('/')} // Important for local images
              />
              {selectedItemId === item.id && (
                <div className="absolute bottom-2 right-2 flex items-center gap-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-md shadow">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); handlePortionChange(item.id, -1); }}
                    disabled={(portionCounts[item.id] || 1) <= 1}
                  >
                    <MinusCircle className="h-5 w-5" />
                    <span className="sr-only">Decrease portions</span>
                  </Button>
                  <span className="text-sm font-medium text-foreground w-6 text-center tabular-nums">
                    {portionCounts[item.id] || 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); handlePortionChange(item.id, 1); }}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Increase portions</span>
                  </Button>
                  <span className="text-xs text-muted-foreground ml-1">portions</span>
                </div>
              )}
            </div>
            <CardHeader className="pt-4 pb-2">
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 pt-0 flex-grow">
              <p className="text-sm text-muted-foreground">{item.description || "Description not available."}</p>
            </CardContent>
             {selectedItemId === item.id && (
                <CardFooter className="p-4 border-t mt-auto">
                    <Button
                        className="w-full"
                        variant={preferences.has(item.id) ? "secondary" : "default"}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePreference(item.id);
                        }}
                    >
                        {preferences.has(item.id) ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Added to Preferences
                            </>
                        ) : (
                            "Add to My Preferences"
                        )}
                    </Button>
                </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
