
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Filter, PlusCircle, Utensils } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const GENERAL_WASTELOGS_STORAGE_KEY = "smartserve_wastelogs_log"; // General waste from kitchen
const KITCHEN_DISH_WASTE_LOG_KEY = "smartserve_kitchen_dish_waste_log"; // Specific dish waste from kitchen

interface GeneralWasteLogEntry {
  id: string;
  date: string;
  category: 'food' | 'water' | string;
  amount: string; // e.g., "2.5 kg" or "5 liters"
  loggedBy: string;
  notes: string;
}

interface KitchenDishWasteLogEntry {
  id: string; // log entry id
  date: string;
  items: Array<{
    dishId: string;
    dishName: string;
    category: string; // dish category
    amountWastedKg: number;
  }>;
}


export default function WasteManagementPage() {
  const [generalWasteLogs, setGeneralWasteLogs] = useState<GeneralWasteLogEntry[]>([]);
  const [kitchenDishWasteLogs, setKitchenDishWasteLogs] = useState<KitchenDishWasteLogEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  const loadGeneralWasteLogs = () => {
    if (typeof window !== 'undefined') {
      const storedLogs = localStorage.getItem(GENERAL_WASTELOGS_STORAGE_KEY);
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs) as GeneralWasteLogEntry[];
          const validEntries = parsedLogs.filter(entry => entry.id && entry.date && entry.category && entry.amount);
          setGeneralWasteLogs(validEntries);
        } catch (error) {
          console.error("Error parsing general waste logs:", error);
          setGeneralWasteLogs([]);
        }
      } else {
        setGeneralWasteLogs([]);
      }
    }
  };

  const loadKitchenDishWasteLogs = () => {
    if (typeof window !== 'undefined') {
        const storedLogs = localStorage.getItem(KITCHEN_DISH_WASTE_LOG_KEY);
        if (storedLogs) {
            try {
                const parsedLogs = JSON.parse(storedLogs) as KitchenDishWasteLogEntry[];
                setKitchenDishWasteLogs(parsedLogs.filter(log => log.id && log.date && Array.isArray(log.items)));
            } catch (error) {
                console.error("Error parsing kitchen dish waste logs:", error);
                setKitchenDishWasteLogs([]);
            }
        } else {
            setKitchenDishWasteLogs([]);
        }
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadGeneralWasteLogs();
    loadKitchenDishWasteLogs();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === GENERAL_WASTELOGS_STORAGE_KEY) {
        loadGeneralWasteLogs();
      }
      if (event.key === KITCHEN_DISH_WASTE_LOG_KEY) {
        loadKitchenDishWasteLogs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  if (!isClient) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Waste Management</h1>
        <p className="text-muted-foreground">Loading waste log data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Waste Management</h1>
            <p className="text-muted-foreground">Track and analyze various waste sources. (Updates pseudo-live)</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" disabled> 
                <PlusCircle className="mr-2 h-4 w-4" />
                Log New Waste (Admin)
            </Button>
             <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Waste Data (CSV)
            </Button>
        </div>
      </div>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <DateRangePicker onDateChange={(range) => console.log("Selected range for waste:", range)} />
            <Select>
                <SelectTrigger id="waste-category-filter">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food">Food Waste (General)</SelectItem>
                    <SelectItem value="water">Water Waste</SelectItem>
                    <SelectItem value="dish_specific">Dish Specific Waste</SelectItem>
                </SelectContent>
            </Select>
            <Button><Filter className="mr-2 h-4 w-4" /> Apply Filters</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>General Waste Log History</CardTitle>
          <CardDescription>Records of general food and water waste logged by kitchen staff.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>General waste log entries. Last 50 shown.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Logged By</TableHead>
                <TableHead className="text-right">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generalWasteLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No general waste data recorded yet.</TableCell>
                </TableRow>
              )}
              {generalWasteLogs.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.date}</TableCell>
                  <TableCell>
                     <Badge variant={entry.category === "food" ? "destructive" : "default"}
                            className={
                                entry.category === "food" ? "bg-orange-600/20 text-orange-700 border-orange-400" : 
                                entry.category === "water" ? "bg-blue-600/20 text-blue-700 border-blue-400" : ""
                            }
                     >
                        {entry.category}
                     </Badge>
                  </TableCell>
                  <TableCell>{entry.amount}</TableCell>
                  <TableCell>{entry.loggedBy}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{entry.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><Utensils className="mr-2 h-5 w-5 text-primary"/> Kitchen-Reported Specific Dish Waste</CardTitle>
          <CardDescription>Waste amounts for specific dishes logged by kitchen staff.</CardDescription>
        </CardHeader>
        <CardContent>
          {kitchenDishWasteLogs.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-4">No specific dish waste logged by kitchen yet.</p>
          ) : (
            <Table>
                <TableCaption>Kitchen-reported specific dish waste entries.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Dish Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount Wasted (kg)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {kitchenDishWasteLogs.map(logEntry => 
                        logEntry.items.map(item => (
                            <TableRow key={`${logEntry.id}-${item.dishId}`}>
                                <TableCell className="font-medium">{logEntry.date}</TableCell>
                                <TableCell>{item.dishName}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell className="text-right">{item.amountWastedKg.toFixed(2)} kg</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
