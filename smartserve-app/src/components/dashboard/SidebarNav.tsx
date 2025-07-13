
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, ListCollapse, History, Bell, Settings, Edit3, LogOut, Gift, type LucideIcon } from "lucide-react"; // Added LogOut, Gift

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  exactMatch?: boolean;
  target?: string;
  action?: () => void; // For logout
}

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smartserve_user');
      localStorage.removeItem('isAdminLoggedIn'); // Also clear admin/kitchen "session"
      localStorage.removeItem('isKitchenStaffLoggedIn');
    }
    router.push('/'); // Redirect to main check-in page
  };

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Employee Dashboard", icon: LayoutDashboard, exactMatch: true },
    { href: "/dashboard/todays-menu", label: "Today's Menu", icon: ListCollapse },
    { href: "/dashboard/meal-consumption-log", label: "Log Consumption", icon: Edit3 },
    { href: "/dashboard/rewards", label: "Rewards", icon: Gift },
    { href: "/dashboard/meal-history", label: "Meal History", icon: History },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: 3 }, // Badge is static for now
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    // { href: "/kitchen-dashboard/login", label: "Kitchen View", icon: ChefHat, target: "_blank" }, // Removed
    // { href: "/admin/login", label: "Admin Panel", icon: ShieldAlert, target: "_blank" }, // Removed
    { href: "#logout", label: "Logout", icon: LogOut, action: handleLogout }, // Logout item
  ];


  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          {item.action ? (
            <SidebarMenuButton
              onClick={item.action}
              className="justify-start text-sm"
              tooltip={{children: item.label, side: 'right', align: 'start', className: 'ml-1'}}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 group-data-[state=collapsed]:hidden">{item.label}</span>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              isActive={item.exactMatch ? pathname === item.href : pathname.startsWith(item.href)}
              className="justify-start text-sm"
              tooltip={{children: item.label, side: 'right', align: 'start', className: 'ml-1'}}
            >
              <Link
                href={item.href}
                className="flex w-full items-center gap-3"
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 group-data-[state=collapsed]:hidden">{item.label}</span>
                {item.badge && !item.action && ( // Ensure badge doesn't show for logout action
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 min-w-[1.25rem] px-1.5 text-xs flex items-center justify-center group-data-[state=collapsed]:hidden"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
