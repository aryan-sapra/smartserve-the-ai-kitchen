
"use client"; // Make this a Client Component

import type { Metadata } from 'next'; // Still can have metadata if defined separately
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { SmartServeLogo } from "@/components/icons/smartserve-logo";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Metadata can be exported from a client component like this, or be in a parent layout
// For this prototype, we'll keep it simple and not redefine it here as it's not the primary focus.
// export const metadata: Metadata = {
//   title: 'SmartServe Admin Panel',
//   description: 'Admin dashboard for SmartServe facility operations',
// };

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure localStorage is accessed only on the client
  }, []);

  useEffect(() => {
    if (isClient) { // Only run this effect on the client
      const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
      if (isAdminLoggedIn !== 'true' && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [isClient, pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    router.push('/admin/login');
  };

  // Show a loading state or null until client-side checks are complete
  // to prevent flash of content if not logged in.
  if (isClient && localStorage.getItem('isAdminLoggedIn') !== 'true' && pathname !== '/admin/login') {
    // You could return a loading spinner here if preferred
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  // If on the login page, and successfully passed client checks (or isClient is false initially), render the login page content.
  if (pathname === '/admin/login') {
    return (
        <>
            {/* 
              The login page itself might not need the full sidebar layout.
              For this iteration, children (the login page) will be rendered directly.
              If login page needs a simpler layout, it can be handled within its own page.tsx
              or by returning a different structure here based on pathname.
              For now, to keep changes minimal on login page structure and focus on protection:
            */}
            {children}
        </>
    );
  }
  
  // For all other admin routes, render the full dashboard layout
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" side="left" className="border-r border-sidebar-border bg-card">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2 mb-4 focus:outline-none group">
            <SmartServeLogo className="h-8 w-8 text-primary group-hover:text-primary/90 transition-colors" />
            <h1 className="text-lg font-semibold text-primary group-hover:text-primary/90 transition-colors group-data-[state=collapsed]:hidden">
              SmartServe Admin
            </h1>
          </Link>
          <div className="group-data-[state=collapsed]:hidden">
            <UserProfile /> 
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <AdminSidebarNav />
          <div className="mt-auto pt-4 group-data-[state=collapsed]:hidden">
            <AdminCalendar />
          </div>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border group-data-[state=collapsed]:hidden">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
          </Button>
        </SidebarFooter>
         <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border group-data-[state=collapsed]:block hidden">
          <Button variant="ghost" size="icon" className="w-full" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-background sm:px-6 md:hidden">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
                 <SmartServeLogo className="h-7 w-7 text-primary" />
                 <span className="font-semibold text-lg text-primary">Admin</span>
            </Link>
            <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-muted/40">
          {children}
        </main>
        <footer className="p-4 text-center text-xs text-muted-foreground border-t bg-muted/40">
            &copy; {new Date().getFullYear()} SmartServe Admin Operations.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
