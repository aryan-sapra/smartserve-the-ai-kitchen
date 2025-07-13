
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Download, Settings2, Users, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, DatabaseZap, Clock } from "lucide-react";
import { DailyCheckInsChart } from "@/components/admin/charts/DailyCheckInsChart";
import { DietTrendsChart } from "@/components/admin/charts/DietTrendsChart";
import { WasteDataChart } from "@/components/admin/charts/WasteDataChart";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import type { StoredCheckInEntry } from "@/lib/schemas"; // Updated import
import { useToast } from "@/hooks/use-toast";

const CHECKINS_STORAGE_KEY = "smartserve_checkins_log";
const GENERAL_WASTELOGS_STORAGE_KEY = "smartserve_wastelogs_log";
const USER_CONSUMPTION_LOG_KEY = "smartserve_user_consumption_log";
const KITCHEN_DISH_WASTE_LOG_KEY = "smartserve_kitchen_dish_waste_log";

// StoredCheckInEntry is now imported from schemas

interface GeneralWasteLogEntry {
  id: string;
  date: string;
  category: 'food' | 'water' | string;
  amount: string; 
  loggedBy: string;
  notes: string;
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

interface KitchenDishWasteLogEntry {
  id: string;
  date: string;
  items: Array<{
    dishId: string;
    dishName: string;
    category: string;
    amountWastedKg: number;
  }>;
}

const lunchTimingOptionsMap: { [key: string]: string } = {
  "12-1": "12 PM - 1 PM",
  "1-2": "1 PM - 2 PM",
  "2-3": "2 PM - 3 PM",
  "3-4": "3 PM - 4 PM",
};


const initialQuickStats = [
  { title: "Total Check-ins (Today)", value: "0", icon: Users, trend: "Loading..." },
  { title: "Most Popular Diet", value: "Loading...", icon: PieChartIcon, trend: "Loading..." },
  { title: "Total Logged Waste", value: "Loading...", icon: BarChart3, trend: "Loading..." },
  { title: "Peak Check-in Time", value: "Loading...", icon: Clock, trend: "Loading..." },
];

let mockUserCounter = 0; 

export default function AdminDashboardPage() {
  const [quickStats, setQuickStats] = useState(initialQuickStats);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const calculateQuickStats = useCallback(() => {
    if (typeof window === 'undefined') return;

    let totalMealAttendees = 0; // For meal service, excluding skipped
    const dietCounts: { [key: string]: number } = { veg: 0, 'non-veg': 0, vegan: 0 };
    const timingCounts: { [key: string]: number } = { "12-1": 0, "1-2": 0, "2-3": 0, "3-4": 0 };
    
    const storedCheckIns = localStorage.getItem(CHECKINS_STORAGE_KEY);
    let parsedCheckIns: StoredCheckInEntry[] = [];
    if (storedCheckIns) {
      try {
        parsedCheckIns = JSON.parse(storedCheckIns) as StoredCheckInEntry[];
        
        parsedCheckIns.forEach(entry => {
          if (!entry.skipMealToday) { // Only count if not skipping meal
            totalMealAttendees++;
            const actualDiet = entry.todaysActualDiet || entry.dietPreference;
            if (actualDiet) {
              dietCounts[actualDiet] = (dietCounts[actualDiet] || 0) + 1;
            }
            if (entry.preferredLunchTiming) {
              timingCounts[entry.preferredLunchTiming] = (timingCounts[entry.preferredLunchTiming] || 0) + 1;
            }
          }
        });
      } catch (e) { console.error("Error parsing check-ins for stats:", e); }
    }

    let mostPopularDiet = "N/A";
    let maxDietCount = 0;
    let popularDietPercentage = "0%";
    if (totalMealAttendees > 0) {
        for (const diet in dietCounts) {
            if (dietCounts[diet] > maxDietCount) {
                maxDietCount = dietCounts[diet];
                mostPopularDiet = diet.charAt(0).toUpperCase() + diet.slice(1).replace('-',' ');
            }
        }
        popularDietPercentage = `${((maxDietCount / totalMealAttendees) * 100).toFixed(0)}% of meal attendees`;
    } else {
        popularDietPercentage = "No meal attendees";
    }

    let peakTimeValue = "N/A";
    let peakTimeTrend = "No meal attendees";
    if (totalMealAttendees > 0) { // Base peak time on those attending meal
        let maxTimingCount = 0;
        let peakSlot = "";
        for (const slot in timingCounts) {
            if (timingCounts[slot] > maxTimingCount) {
                maxTimingCount = timingCounts[slot];
                peakSlot = slot;
            }
        }
        if(peakSlot && timingCounts[peakSlot] > 0) { // Ensure peakSlot has actual counts
            peakTimeValue = lunchTimingOptionsMap[peakSlot] || "N/A";
            const percentageOfAttendees = totalMealAttendees > 0 ? ((maxTimingCount / totalMealAttendees) * 100).toFixed(0) : "0";
            peakTimeTrend = `${percentageOfAttendees}% prefer this slot`;
        } else if (parsedCheckIns.length > 0 && totalMealAttendees === 0) {
            peakTimeValue = "All Skipped";
            peakTimeTrend = "No one opted for meal.";
        }
         else {
            peakTimeTrend = "Timings not specified or no attendees";
        }
    }


    let totalFoodWasteKg = 0;
    const generalWaste = localStorage.getItem(GENERAL_WASTELOGS_STORAGE_KEY);
    if (generalWaste) {
        try {
            const parsed = JSON.parse(generalWaste) as GeneralWasteLogEntry[];
            parsed.forEach(log => {
                if (log.category === 'food' && log.amount) {
                    const amountMatch = log.amount.match(/([\d.]+)/);
                    if (amountMatch && amountMatch[1]) {
                        totalFoodWasteKg += parseFloat(amountMatch[1]);
                    }
                }
            });
        } catch (e) { console.error("Error parsing general waste for stats:", e); }
    }
    const userConsumption = localStorage.getItem(USER_CONSUMPTION_LOG_KEY);
    if (userConsumption) {
        try {
            const parsed = JSON.parse(userConsumption) as UserConsumptionLogEntry[];
            parsed.forEach(log => {
                log.items.forEach(item => {
                    totalFoodWasteKg += item.wastedWeightKg;
                });
            });
        } catch (e) { console.error("Error parsing user consumption waste for stats:", e); }
    }
    const kitchenDishWaste = localStorage.getItem(KITCHEN_DISH_WASTE_LOG_KEY);
    if (kitchenDishWaste) {
        try {
            const parsed = JSON.parse(kitchenDishWaste) as KitchenDishWasteLogEntry[];
            parsed.forEach(log => {
                log.items.forEach(item => {
                    totalFoodWasteKg += item.amountWastedKg;
                });
            });
        } catch (e) { console.error("Error parsing kitchen dish waste for stats:", e); }
    }
    
    setQuickStats(prevStats => prevStats.map(stat => {
      if (stat.title === "Total Check-ins (Today)") {
        return { ...stat, value: totalMealAttendees.toString(), trend: `${totalMealAttendees} meal attendees today` };
      }
      if (stat.title === "Most Popular Diet") {
        return { ...stat, value: mostPopularDiet, trend: popularDietPercentage };
      }
      if (stat.title === "Total Logged Waste") {
        return { ...stat, value: `${totalFoodWasteKg.toFixed(1)} kg`, trend: "Aggregated food waste" };
      }
      if (stat.title === "Peak Check-in Time") {
        return { ...stat, value: peakTimeValue, trend: peakTimeTrend, icon: Clock };
      }
      return stat;
    }));
  }, []);


  useEffect(() => {
    setIsClient(true);
    calculateQuickStats();

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === CHECKINS_STORAGE_KEY ||
        event.key === GENERAL_WASTELOGS_STORAGE_KEY ||
        event.key === USER_CONSUMPTION_LOG_KEY ||
        event.key === KITCHEN_DISH_WASTE_LOG_KEY
      ) {
        calculateQuickStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [calculateQuickStats]);

  const seedMockData = () => {
    if (typeof window === 'undefined') return;

    const today = new Date().toISOString().split('T')[0];
    const dietPreferences: Array<'veg' | 'non-veg' | 'vegan'> = ['veg', 'non-veg', 'vegan'];
    const lunchTimings: Array<'12-1' | '1-2' | '2-3' | '3-4'> = ['12-1', '1-2', '2-3', '3-4'];
    const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Ananya", "Diya", "Pari", "Saanvi", "Myra", "Aadhya", "Angel", "Navya", "Siya", "Kyra"];
    const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Patel", "Kumar", "Shah", "Mehta", "Joshi", "Reddy"];

    const newMockCheckIns: StoredCheckInEntry[] = [];
    const numberOfNewUsers = Math.floor(Math.random() * 3) + 3; 

    for (let i = 0; i < numberOfNewUsers; i++) {
        mockUserCounter++;
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${randomFirstName} ${randomLastName} ${mockUserCounter}`;
        const dietPref = dietPreferences[Math.floor(Math.random() * dietPreferences.length)];
        const skipMeal = Math.random() < 0.1; // 10% chance of skipping

        newMockCheckIns.push({
            id: `u${Date.now()}-${mockUserCounter}`,
            name: name,
            email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${mockUserCounter}@example.com`,
            dietPreference: dietPref,
            preferredLunchTiming: lunchTimings[Math.floor(Math.random() * lunchTimings.length)],
            date: today,
            status: "Checked-in",
            todaysActualDiet: skipMeal ? dietPref : dietPref, // if skipping, actual diet might not matter for counting
            skipMealToday: skipMeal
        });
    }
    
    const existingCheckInsRaw = localStorage.getItem(CHECKINS_STORAGE_KEY);
    let existingCheckIns: StoredCheckInEntry[] = [];
    if (existingCheckInsRaw) {
        try {
            existingCheckIns = JSON.parse(existingCheckInsRaw);
        } catch (e) { console.error("Error parsing existing check-ins during mock seed:", e); }
    }
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify([...existingCheckIns, ...newMockCheckIns]));


    const mockGeneralWaste: GeneralWasteLogEntry[] = [
      { id: `gw${Date.now()}-1`, date: today, category: 'food', amount: `${(Math.random() * 2 + 0.5).toFixed(1)} kg`, loggedBy: 'Kitchen Staff', notes: 'Excess vegetable peelings' },
      { id: `gw${Date.now()}-2`, date: today, category: 'water', amount: `${(Math.random() * 10 + 5).toFixed(0)} liters`, loggedBy: 'Kitchen Staff', notes: 'Tap left running' },
    ];
    const existingGeneralWasteRaw = localStorage.getItem(GENERAL_WASTELOGS_STORAGE_KEY);
    let existingGeneralWaste: GeneralWasteLogEntry[] = [];
    if(existingGeneralWasteRaw) { try { existingGeneralWaste = JSON.parse(existingGeneralWasteRaw); } catch(e){}}
    localStorage.setItem(GENERAL_WASTELOGS_STORAGE_KEY, JSON.stringify([...existingGeneralWaste, ...mockGeneralWaste].slice(-20))); 
    
    const mockUserConsumption: UserConsumptionLogEntry[] = [
        { id: `uc${Date.now()}-1`, date: today, items: [
            { dishId: "mc_veg_1", dishName: "Dal Makhani", category: "Main Course - Vegetarian", portionsTaken: Math.floor(Math.random() * 2) + 1, portionsWasted: Math.floor(Math.random() * 2), wastedWeightKg: Math.random() * 0.2 },
            { dishId: "r_1", dishName: "Vegetable Pulao", category: "Rice", portionsTaken: 1, portionsWasted: 0, wastedWeightKg: 0 },
        ]},
    ];
    const existingUserConsumptionRaw = localStorage.getItem(USER_CONSUMPTION_LOG_KEY);
    let existingUserConsumption: UserConsumptionLogEntry[] = [];
    if(existingUserConsumptionRaw) { try { existingUserConsumption = JSON.parse(existingUserConsumptionRaw); } catch(e){}}
    localStorage.setItem(USER_CONSUMPTION_LOG_KEY, JSON.stringify([...existingUserConsumption, ...mockUserConsumption].slice(-20)));


    const mockKitchenDishWaste: KitchenDishWasteLogEntry[] = [
        { id: `kdw${Date.now()}-1`, date: today, items: [
            { dishId: "mc_veg_2", dishName: "Shahi Paneer", category: "Main Course - Vegetarian", amountWastedKg: Math.random() * 0.5 },
        ]}
    ];
    const existingKitchenWasteRaw = localStorage.getItem(KITCHEN_DISH_WASTE_LOG_KEY);
    let existingKitchenWaste: KitchenDishWasteLogEntry[] = [];
    if(existingKitchenWasteRaw) { try { existingKitchenWaste = JSON.parse(existingKitchenWasteRaw); } catch(e){}}
    localStorage.setItem(KITCHEN_DISH_WASTE_LOG_KEY, JSON.stringify([...existingKitchenWaste, ...mockKitchenDishWaste].slice(-20)));


    window.dispatchEvent(new StorageEvent('storage', { key: CHECKINS_STORAGE_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: GENERAL_WASTELOGS_STORAGE_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: USER_CONSUMPTION_LOG_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: KITCHEN_DISH_WASTE_LOG_KEY }));


    toast({
      title: `${newMockCheckIns.length} New Mock Users Added!`,
      description: "LocalStorage has been updated with additional sample data.",
      variant: "default",
      className: "bg-accent text-accent-foreground border-accent",
    });
    calculateQuickStats(); 
  };

  if (!isClient) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Loading operational overview...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of facility operations.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={seedMockData}>
                <DatabaseZap className="mr-2 h-4 w-4" />
                Seed More Mock Data
            </Button>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Summary (CSV)
            </Button>
        </div>
      </div>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <Label htmlFor="date-range">Date Range</Label>
                <DateRangePicker 
                    onDateChange={(range) => console.log("Selected range:", range)} 
                />
            </div>
            <div>
                <Label htmlFor="department-filter">Department (Optional)</Label>
                 <Select>
                    <SelectTrigger id="department-filter">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                 <Button className="w-full lg:w-auto">Apply Filters</Button>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
            <Card key={stat.title} className="shadow-md rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon && <stat.icon className="h-5 w-5 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <DailyCheckInsChart />
        </div>
        <div className="lg:col-span-1">
            <DietTrendsChart />
        </div>
      </div>
       <div className="grid grid-cols-1 gap-6">
          <WasteDataChart />
      </div>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Quick look at user attendance and waste logs. More details in respective sections.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tables for User Attendance History and Waste Logs will be displayed here or in their dedicated sections.
            (Placeholder for combined quick view or links)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
