
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";

const CHECKINS_STORAGE_KEY = "smartserve_checkins_log";

interface UserAttendanceEntry {
  id: string;
  name: string;
  email: string;
  date: string;
  status: string;
  dietPreference: 'veg' | 'non-veg' | 'vegan' | string; // Allow string for flexibility from localStorage
}

// Initial mock data - will be overridden/augmented by localStorage
const initialUserAttendance: UserAttendanceEntry[] = [
  { id: "u1", name: "Rahul Sharma (Initial)", email:"rahul.initial@example.com", date: "2024-07-22", status: "Checked-in", dietPreference: "veg" },
  { id: "u2", name: "Priya Patel (Initial)", email: "priya.initial@example.com", date: "2024-07-22", status: "Checked-in", dietPreference: "non-veg" },
];

export default function UserManagementPage() {
  const [userAttendance, setUserAttendance] = useState<UserAttendanceEntry[]>(initialUserAttendance);
  const [isClient, setIsClient] = useState(false);

  const loadAttendanceFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedCheckIns = localStorage.getItem(CHECKINS_STORAGE_KEY);
      if (storedCheckIns) {
        try {
          const parsedCheckIns = JSON.parse(storedCheckIns) as UserAttendanceEntry[];
          // Filter out any potential malformed entries if necessary
          const validEntries = parsedCheckIns.filter(entry => entry.id && entry.name && entry.date && entry.status && entry.dietPreference);
          setUserAttendance(validEntries);
        } catch (error) {
          console.error("Error parsing check-ins from localStorage:", error);
          setUserAttendance(initialUserAttendance); // Fallback to initial if parsing fails
        }
      } else {
        setUserAttendance(initialUserAttendance); // Fallback if nothing in storage
      }
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    loadAttendanceFromStorage(); // Load on initial mount

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHECKINS_STORAGE_KEY) {
        console.log("Storage event detected for check-ins. Reloading...");
        loadAttendanceFromStorage();
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
        <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Loading user attendance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">View and manage user attendance and details. (Updates pseudo-live from check-ins)</p>
        </div>
        <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export User Data (CSV)
        </Button>
      </div>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <DateRangePicker 
                onDateChange={(range) => console.log("Selected range for users:", range)}
            />
            <Input placeholder="Search by name or email..." />
            <Button><Filter className="mr-2 h-4 w-4" /> Apply Filters</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>User Attendance History</CardTitle>
          <CardDescription>Detailed log of user check-ins and meal preferences. Updates when new check-ins occur in the same browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of user attendance records. Last 50 entries shown for demo.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Diet Preference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userAttendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No attendance data recorded yet.</TableCell>
                </TableRow>
              )}
              {userAttendance.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === "Checked-in" ? "default" : "outline"}
                           className={entry.status === "Checked-in" ? "bg-green-600/20 text-green-700 border-green-400" : ""}
                    >
                        {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={
                        entry.dietPreference === "veg" ? "secondary" :
                        entry.dietPreference === "non-veg" ? "destructive" :
                        entry.dietPreference === "vegan" ? "default" : "outline"
                    }
                    className={
                        entry.dietPreference === "veg" ? "bg-accent text-accent-foreground" :
                        entry.dietPreference === "vegan" ? "bg-purple-600/20 text-purple-700 border-purple-400" :
                        entry.dietPreference === "non-veg" ? "" : "" // Destructive variant handles its own common styling
                    }
                    >
                        {entry.dietPreference}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
