
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutGrid, Users, BarChart3, FileText, Settings, Zap, PackageMinus, type LucideIcon } from "lucide-react"; // Added PackageMinus

interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exactMatch?: boolean;
}

const adminNavItems: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid, exactMatch: true },
  { href: "/admin/user-management", label: "User Management", icon: Users },
  { href: "/admin/waste-management", label: "Waste Management", icon: BarChart3 },
  { href: "/admin/dishes-wasted", label: "Dishes Wasted (User Log)", icon: PackageMinus }, // New Item
  { href: "/admin/facility-integration", label: "Facility Integration", icon: Zap },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {adminNavItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            asChild
            isActive={item.exactMatch ? pathname === item.href : pathname.startsWith(item.href)}
            className="justify-start text-sm"
            tooltip={{children: item.label, side: 'right', align: 'start', className: 'ml-1'}}
          >
            <Link href={item.href} className="flex w-full items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span className="flex-1 group-data-[state=collapsed]:hidden">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
