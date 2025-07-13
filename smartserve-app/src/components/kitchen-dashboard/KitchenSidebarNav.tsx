
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Trash2, ClipboardEdit, UtensilsCrossed, type LucideIcon } from "lucide-react";

interface KitchenNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exactMatch?: boolean;
}

const kitchenNavItems: KitchenNavItem[] = [
  { href: "/kitchen-dashboard", label: "Summary & Prep", icon: LayoutDashboard, exactMatch: true },
  { href: "/kitchen-dashboard/log-todays-menu", label: "Log Today's Menu", icon: ClipboardEdit },
  { href: "/kitchen-dashboard/log-dish-waste", label: "Log Specific Dish Waste", icon: UtensilsCrossed },
  { href: "/kitchen-dashboard/log-waste", label: "Log General Waste", icon: Trash2 },
];

export function KitchenSidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {kitchenNavItems.map((item) => (
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
