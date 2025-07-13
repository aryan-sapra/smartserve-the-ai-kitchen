
"use client"; 

import type { Metadata } from 'next';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfile } from "@/components/dashboard/UserProfile"; 
import { KitchenSidebarNav } from "@/components/kitchen-dashboard/KitchenSidebarNav";
import { SmartServeLogo } from "@/components/icons/smartserve-logo";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react'; // Added LogOut
import { useEffect, useState } from 'react'; // Added useEffect, useState
import { useRouter, usePathname } from 'next/navigation'; // Added useRouter, usePathname

// export const metadata: Metadata = { // Metadata for client components should be handled differently or in parent
//   title: 'SmartServe Kitchen Dashboard',
//   description: 'Kitchen operations and meal management dashboard',
// };

export default function KitchenDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 
  }, []);

  useEffect(() => {
    if (isClient) { 
      const isKitchenStaffLoggedIn = localStorage.getItem('isKitchenStaffLoggedIn');
      if (isKitchenStaffLoggedIn !== 'true' && pathname !== '/kitchen-dashboard/login') {
        router.push('/kitchen-dashboard/login');
      }
    }
  }, [isClient, pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('isKitchenStaffLoggedIn');
    router.push('/kitchen-dashboard/login');
  };
  
  if (isClient && localStorage.getItem('isKitchenStaffLoggedIn') !== 'true' && pathname !== '/kitchen-dashboard/login') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  if (pathname === '/kitchen-dashboard/login') {
    return <>{children}</>;
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" side="left" className="border-r border-sidebar-border bg-card">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-2">
             <Link href="/kitchen-dashboard" className="flex items-center gap-2 group focus:outline-none">
                <SmartServeLogo className="h-8 w-8 text-primary group-hover:text-primary/90 transition-colors" />
                <h1 className="text-xl font-semibold text-primary group-hover:text-primary/90 transition-colors group-data-[state=collapsed]:hidden">
                  SmartServe
                </h1>
            </Link>
          </div>
          {/* Removed "Back to Employee" button */}
          <div className="group-data-[state=collapsed]:hidden">
            <p className="text-xs text-muted-foreground mb-2 ">KITCHEN STAFF VIEW</p>
            <UserProfile /> {/* UserProfile will show hardcoded name for now */}
          </div>
           {/* Removed "Back to Employee" icon button for collapsed state */}
        </SidebarHeader>
        <SidebarContent className="p-2">
          <KitchenSidebarNav />
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
            <Link href="/kitchen-dashboard" className="flex items-center gap-2">
                 <SmartServeLogo className="h-7 w-7 text-primary" />
                 <span className="font-semibold text-lg text-primary">Kitchen View</span>
            </Link>
            <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-muted/40">
          {children}
        </main>
        <footer className="p-4 text-center text-xs text-muted-foreground border-t bg-muted/40">
            &copy; {new Date().getFullYear()} SmartServe Kitchen Operations.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
