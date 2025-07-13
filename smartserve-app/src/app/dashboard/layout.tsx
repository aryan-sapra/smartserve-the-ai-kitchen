import type { Metadata } from 'next';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
// Removed TodaysHighlight import
import { SmartServeLogo } from "@/components/icons/smartserve-logo";
import Link from 'next/link';


export const metadata: Metadata = {
  title: 'SmartServe Dashboard',
  description: 'Employee meal management dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" side="left" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2 mb-6 focus:outline-none group">
            <SmartServeLogo className="h-8 w-8 text-primary group-hover:text-primary/90 transition-colors" />
            <h1 className="text-xl font-semibold text-primary group-hover:text-primary/90 transition-colors">
              SmartServe
            </h1>
          </Link>
          <UserProfile />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border group-data-[state=collapsed]:hidden">
          {/* Removed TodaysHighlight component usage */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SmartServe
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-background sm:px-6 md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
                 <SmartServeLogo className="h-7 w-7 text-primary" />
                 <span className="font-semibold text-lg text-primary">SmartServe</span>
            </Link>
            <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
        <footer className="p-4 text-center text-xs text-muted-foreground border-t">
            &copy; {new Date().getFullYear()} SmartServe Solutions. All rights reserved.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
