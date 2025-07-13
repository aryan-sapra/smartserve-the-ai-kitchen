
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { dishDatabase, type DishOption } from "@/lib/menu-data"; // Import from centralized location

const MENU_STORAGE_KEY = "smartserve_todays_menu";

interface MenuItemFromKitchen extends DishOption {
  category: string; // This will be set based on the section
}

export default function LogTodaysMenuPage() {
  const [selectedDishes, setSelectedDishes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleDishSelectionChange = (dishId: string, category: string) => {
    setSelectedDishes((prev) => ({
      ...prev,
      [`${category}__${dishId}`]: !prev[`${category}__${dishId}`],
    }));
  };

  const handleSaveMenu = () => {
    const menuToSave: MenuItemFromKitchen[] = [];
    Object.entries(dishDatabase).forEach(([categoryName, dishes]) => {
      dishes.forEach(dish => {
        if (selectedDishes[`${categoryName}__${dish.id}`]) {
          menuToSave.push({ ...dish, category: categoryName });
        }
      });
    });

    if (menuToSave.length === 0) {
      toast({
        title: "No Dishes Selected",
        description: "Please select at least one dish to save the menu.",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuToSave));
      toast({
        title: "Menu Saved Successfully!",
        description: `Today's menu with ${menuToSave.length} items has been set.`,
        className: "bg-green-500 text-white",
      });
       // Optionally, trigger a custom event for other tabs if needed, though localStorage 'storage' event should handle it.
      window.dispatchEvent(new StorageEvent('storage', { key: MENU_STORAGE_KEY }));

    } catch (error) {
      console.error("Error saving menu to localStorage:", error);
      toast({
        title: "Failed to Save Menu",
        description: "Could not save the menu to local storage.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Log Today's Menu</h1>
      <p className="text-muted-foreground">
        Select the dishes that will be available for employees today.
        This will update the "Today's Menu" view for employees.
      </p>

      {Object.entries(dishDatabase).map(([category, dishes], catIndex) => (
        <Card key={category} className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {dishes.map((dish) => (
              <div key={dish.id} className="flex items-center space-x-3 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`${category}__${dish.id}`}
                  checked={!!selectedDishes[`${category}__${dish.id}`]}
                  onCheckedChange={() => handleDishSelectionChange(dish.id, category)}
                />
                <Label htmlFor={`${category}__${dish.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                  {dish.name}
                </Label>
              </div>
            ))}
          </CardContent>
          {catIndex < Object.keys(dishDatabase).length -1 && <Separator className="my-0" />}
        </Card>
      ))}

      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveMenu} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Today's Menu
        </Button>
      </div>
    </div>
  );
}
