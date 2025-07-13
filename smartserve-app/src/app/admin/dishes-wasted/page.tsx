
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

const USER_CONSUMPTION_LOG_KEY = "smartserve_user_consumption_log";

interface UserReportedWasteItem {
  dishId: string;
  dishName: string;
  category: string;
  totalPortionsWasted: number;
  totalWeightWastedKg: number;
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
}

export default function DishesWastedPage() {
  const [userWastedDishes, setUserWastedDishes] = useState<UserReportedWasteItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  const aggregateWastedDishes = (logs: UserConsumptionLogEntry[]): UserReportedWasteItem[] => {
    const aggregated: { [dishId: string]: UserReportedWasteItem } = {};

    logs.forEach(log => {
      log.items.forEach(item => {
        if (item.portionsWasted > 0) {
          if (!aggregated[item.dishId]) {
            aggregated[item.dishId] = {
              dishId: item.dishId,
              dishName: item.dishName,
              category: item.category,
              totalPortionsWasted: 0,
              totalWeightWastedKg: 0,
            };
          }
          aggregated[item.dishId].totalPortionsWasted += item.portionsWasted;
          aggregated[item.dishId].totalWeightWastedKg += item.wastedWeightKg;
        }
      });
    });
    return Object.values(aggregated).map(item => ({
        ...item,
        totalWeightWastedKg: parseFloat(item.totalWeightWastedKg.toFixed(2))
    }));
  };

  const loadUserWastedDishes = () => {
    if (typeof window !== 'undefined') {
      const storedLogsJson = localStorage.getItem(USER_CONSUMPTION_LOG_KEY);
      if (storedLogsJson) {
        try {
          const parsedLogs = JSON.parse(storedLogsJson) as UserConsumptionLogEntry[];
          setUserWastedDishes(aggregateWastedDishes(parsedLogs));
        } catch (error) {
          console.error("Error parsing user consumption logs:", error);
          setUserWastedDishes([]);
        }
      } else {
        setUserWastedDishes([]);
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadUserWastedDishes();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === USER_CONSUMPTION_LOG_KEY) {
        loadUserWastedDishes();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">User-Reported Dish Waste</h1>
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">User-Reported Dish Waste</h1>
        <p className="text-muted-foreground">
          Summary of dishes reported as wasted by employees through the meal consumption log. Updates pseudo-live.
        </p>
      </div>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>Aggregated User-Reported Waste</CardTitle>
          <CardDescription>
            Total portions and weight (1 portion = 100g) of specific dishes reported as wasted by users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userWastedDishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed rounded-lg">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium text-muted-foreground">No User-Reported Dish Waste Yet</p>
                <p className="text-sm text-muted-foreground">
                    Data will appear here once employees log their meal consumption and report wasted portions.
                </p>
            </div>

          ) : (
            <Table>
              <TableCaption>List of dishes wasted by users (aggregated).</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Dish Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total Portions Wasted</TableHead>
                  <TableHead className="text-right">Total Weight Wasted (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userWastedDishes.map((item) => (
                  <TableRow key={item.dishId}>
                    <TableCell className="font-medium">{item.dishName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.totalPortionsWasted}</TableCell>
                    <TableCell className="text-right">{item.totalWeightWastedKg.toFixed(2)} kg</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
