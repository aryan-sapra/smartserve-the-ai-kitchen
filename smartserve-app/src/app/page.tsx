
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CheckInFormValues } from "@/lib/schemas"; // Import the type
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckInForm } from "@/components/check-in-form";
import { SmartServeLogo } from "@/components/icons/smartserve-logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ChefHat } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const USER_DATA_KEY = "smartserve_user";

export default function HomePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    // Clear admin/kitchen flags if user lands here to ensure clean state after logout
    // This also ensures if an admin/kitchen staff was "logged in" and revisits main page,
    // they don't automatically get redirected to employee dashboard.
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isKitchenStaffLoggedIn');
    
    const storedUserData = localStorage.getItem(USER_DATA_KEY);
    if (storedUserData) {
      setIsCheckedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isCheckedIn) {
      router.push('/dashboard');
    }
  }, [isCheckedIn, router]);

  const handleCheckInSuccess = (values: CheckInFormValues) => {
    // For this prototype, store basic user info. A real app would involve a proper backend.
    const userDataToStore = {
      name: values.name,
      email: values.email,
      dietPreference: values.dietPreference,
      preferredLunchTiming: values.preferredLunchTiming,
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userDataToStore));
    setIsCheckedIn(true);
  };

  if (isCheckedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-2 pt-2 sm:pt-4">
      <header className="mb-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
        <SmartServeLogo className="h-10 w-10 sm:h-12 sm:w-12" />
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          SmartServe CheckIn
        </h1>
      </header>

      <Card className="w-full max-w-md shadow-xl rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl sm:text-2xl text-center">
            Welcome to SmartServe!
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <p className="mb-6 text-center text-muted-foreground">
            Employees, please check in for today's meal service.
          </p>
          <CheckInForm onCheckInSuccess={handleCheckInSuccess} />
          
          <Separator className="my-4" />

          <div className="space-y-3 text-center">
            <h3 className="text-sm font-semibold text-foreground">Access Other Portals</h3>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" asChild className="flex-1 text-xs sm:text-sm">
                <Link href="/admin/login" target="_blank" rel="noopener noreferrer">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Portal
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 text-xs sm:text-sm">
                <Link href="/kitchen-dashboard/login" target="_blank" rel="noopener noreferrer">
                  <ChefHat className="mr-2 h-4 w-4" />
                  Kitchen Staff
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
        {currentYear !== null && (
           <CardFooter className="text-xs text-muted-foreground justify-center pt-0 pb-3">
             <p>&copy; {currentYear} SmartServe Solutions. All rights reserved.</p>
           </CardFooter>
        )}
      </Card>
      <div className="pb-8"></div>
    </div>
  );
}
