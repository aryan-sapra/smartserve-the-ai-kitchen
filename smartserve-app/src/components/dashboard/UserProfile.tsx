
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CheckInFormValues } from '@/lib/schemas';

const USER_DATA_KEY = "smartserve_user";
const KITCHEN_LOGGED_IN_KEY = "isKitchenStaffLoggedIn";
const ADMIN_LOGGED_IN_KEY = "isAdminLoggedIn";

export function UserProfile() {
  const [userName, setUserName] = useState<string>("User");
  const [userRoleOrId, setUserRoleOrId] = useState<string>("Role/ID");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure localStorage is accessed only on the client
  }, []);

  useEffect(() => {
    if (isClient) {
      const employeeDataString = localStorage.getItem(USER_DATA_KEY);
      const isKitchenStaff = localStorage.getItem(KITCHEN_LOGGED_IN_KEY) === 'true';
      const isAdmin = localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';

      if (employeeDataString) {
        try {
          const employeeData: CheckInFormValues = JSON.parse(employeeDataString);
          setUserName(employeeData.name || "Employee");
          // Assuming email could serve as a unique ID or part of it for display
          setUserRoleOrId(employeeData.email || "Employee ID"); 
        } catch (e) {
          console.error("Failed to parse employee data for UserProfile", e);
          setUserName("Employee");
          setUserRoleOrId("Details N/A");
        }
      } else if (isKitchenStaff) {
        setUserName("Kitchen Staff");
        setUserRoleOrId("Operations Role");
      } else if (isAdmin) {
        setUserName("Admin User");
        setUserRoleOrId("System Administrator");
      } else {
        // Fallback if no specific login state is found (e.g., if directly on a login page)
        setUserName("Guest");
        setUserRoleOrId("Not Logged In");
      }
    }
  }, [isClient]);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean) 
      .slice(0, 2) 
      .join("")
      .toUpperCase() || 'U'; // Default to 'U' if name is empty
  };
  
  const initials = getInitials(userName);

  if (!isClient) {
    // Return a skeleton or simplified version during SSR or before client-side hydration
    return (
      <div className="flex flex-col items-start space-y-1 p-1">
        <div className="flex items-center space-x-3 w-full">
          <Avatar className="h-10 w-10 border-2 border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
              --
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-sidebar-foreground truncate">Loading...</p>
            <p className="text-xs text-muted-foreground truncate">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start space-y-1 p-1">
      <div className="flex items-center space-x-3 w-full">
        <Avatar className="h-10 w-10 border-2 border-sidebar-border">
          <AvatarImage src={`https://placehold.co/40x40.png?text=${initials}`} alt={userName} data-ai-hint="profile person" />
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="font-semibold text-sm text-sidebar-foreground truncate" title={userName}>{userName}</p>
          <p className="text-xs text-muted-foreground truncate" title={userRoleOrId}>{userRoleOrId}</p>
        </div>
      </div>
    </div>
  );
}
