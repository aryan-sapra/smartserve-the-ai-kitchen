import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, Utensils, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  actionText?: string;
  actionLink?: string;
  isRead?: boolean;
}

const notifications: NotificationItem[] = [
  {
    id: "notif1",
    icon: CalendarDays,
    title: "Feedback Request",
    description: "How was yesterday's Paneer Tikka Masala?",
    time: "5 hours ago",
    actionText: "Give Feedback",
    actionLink: "/dashboard/feedback/new?meal=paneer_tikka_masala",
  },
  {
    id: "notif2",
    icon: MapPin,
    title: "Menu Change",
    description: "Friday's menu has been updated to include Hyderabadi Biryani.",
    time: "Yesterday",
    actionText: "See Changes",
    actionLink: "/dashboard/todays-menu#friday",
    isRead: true,
  },
  {
    id: "notif3",
    icon: Utensils,
    title: "Meal Preference",
    description: "You haven't set your preference for tomorrow yet.",
    time: "2 days ago",
    actionText: "Set Preference",
    actionLink: "/dashboard#meal-preference", // Link to section on dashboard
  },
];

export function NotificationsCard() {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className="shadow-lg rounded-xl max-h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Notifications</CardTitle>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" asChild className="text-xs text-primary hover:text-primary/90 px-2 h-7">
            <Link href="/dashboard/notifications">{unreadCount} new</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-1 flex-1 overflow-y-auto py-0 pr-3 pl-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {notifications.map((notification, index) => (
          <div key={notification.id}>
            <div className="flex items-start space-x-3 py-3">
              <notification.icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{notification.title}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{notification.time}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-snug">{notification.description}</p>
                {notification.actionText && notification.actionLink && (
                  <Button variant="link" size="sm" asChild className="px-0 h-auto text-primary hover:text-primary/90 text-xs font-medium">
                    <Link href={notification.actionLink}>{notification.actionText}</Link>
                  </Button>
                )}
              </div>
            </div>
            {index < notifications.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-4 border-t mt-auto">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/notifications">View All Notifications</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
