import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing, CheckCheck } from "lucide-react";

const allNotifications = [
  { id: "n1", title: "Feedback Request", description: "How was yesterday's Paneer Tikka Masala?", time: "5 hours ago", read: false },
  { id: "n2", title: "Menu Change", description: "Friday's menu has been updated to include Hyderabadi Biryani.", time: "Yesterday", read: true },
  { id: "n3", title: "Meal Preference", description: "You haven't set your preference for tomorrow yet.", time: "2 days ago", read: false },
  { id: "n4", title: "System Update", description: "SmartServe will be undergoing maintenance tonight at 2 AM.", time: "3 days ago", read: true },
  { id: "n5", title: "New Feature: Meal Ratings", description: "You can now rate your meals out of 5 stars!", time: "4 days ago", read: true },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">All Notifications</h1>
        <Button variant="outline" size="sm"><CheckCheck className="mr-2 h-4 w-4" /> Mark all as read</Button>
      </div>
      <p className="text-muted-foreground">
        Catch up on all your past notifications here.
      </p>
      <div className="space-y-4">
        {allNotifications.map((notification) => (
          <Card key={notification.id} className={`shadow-md rounded-xl ${notification.read ? "bg-card/70 opacity-70" : "bg-card"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{notification.title}</CardTitle>
                <span className={`text-xs ${notification.read ? "text-muted-foreground" : "text-primary font-semibold"}`}>{notification.time}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${notification.read ? "text-muted-foreground" : "text-foreground"}`}>{notification.description}</p>
              {!notification.read && (
                 <Button variant="link" size="sm" className="px-0 mt-1 text-primary">Mark as read</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
