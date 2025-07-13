
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Gift, Star, Coffee, Cookie, Ticket, CalendarClock } from "lucide-react";
import Image from "next/image";
import { format, addHours } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface RedeemableItem {
  id: string;
  name: string;
  pointsNeeded: number;
  image: string; // Will now be a path to a local image, e.g., /images/rewards/item-id.png
  aiHint: string;
  icon: React.ElementType;
  validityHours?: number; // Optional: hours for which the redeemed item is valid
}

interface RedeemedVoucher {
  id: string; // original item id
  voucherId: string; // unique id for this specific redemption
  name: string;
  redeemedAt: string; // ISO string
  validUntil?: string; // ISO string - Optional for items like physical goods
}

const initialRedeemableItems: RedeemableItem[] = [
  { id: "item1", name: "Premium Filter Coffee", pointsNeeded: 50, image: "/images/rewards/item1.png", aiHint: "coffee cup", icon: Coffee, validityHours: 24 },
  { id: "item2", name: "Specialty Dessert of the Day", pointsNeeded: 75, image: "/images/rewards/item2.png", aiHint: "cake dessert", icon: Cookie, validityHours: 48 },
  { id: "item3", name: "Guest Meal Voucher", pointsNeeded: 150, image: "/images/rewards/item3.png", aiHint: "voucher ticket", icon: Ticket, validityHours: 7 * 24 }, // Valid for 7 days
  { id: "item4", name: "Eco-Friendly Water Bottle", pointsNeeded: 100, image: "/images/rewards/item4.png", aiHint: "water bottle", icon: Star }, // Physical item, no validity
];

const USER_MOCK_POINTS_KEY = "smartserve_user_reward_points";
const USER_REDEEMED_VOUCHERS_KEY = "smartserve_user_redeemed_vouchers";

export default function RewardsPage() {
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [redeemableItems] = useState<RedeemableItem[]>(initialRedeemableItems);
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>([]);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load points from localStorage
    const storedPoints = localStorage.getItem(USER_MOCK_POINTS_KEY);
    if (storedPoints) {
      setRewardPoints(parseInt(storedPoints, 10));
    } else {
      setRewardPoints(120); // Default mock points
      localStorage.setItem(USER_MOCK_POINTS_KEY, "120");
    }

    // Load redeemed vouchers from localStorage
    const storedVouchers = localStorage.getItem(USER_REDEEMED_VOUCHERS_KEY);
    if (storedVouchers) {
      try {
        setRedeemedVouchers(JSON.parse(storedVouchers));
      } catch (e) {
        console.error("Failed to parse redeemed vouchers:", e);
        setRedeemedVouchers([]);
      }
    }
  }, []);
  
  useEffect(() => {
    // Persist points whenever they change, only on client
    if(isClient) {
        localStorage.setItem(USER_MOCK_POINTS_KEY, rewardPoints.toString());
    }
  }, [rewardPoints, isClient]);

  useEffect(() => {
    // Persist redeemed vouchers whenever they change, only on client
    if(isClient && redeemedVouchers.length > 0) {
        localStorage.setItem(USER_REDEEMED_VOUCHERS_KEY, JSON.stringify(redeemedVouchers));
    } else if (isClient && redeemedVouchers.length === 0) {
        localStorage.removeItem(USER_REDEEMED_VOUCHERS_KEY); // Clean up if no vouchers
    }
  }, [redeemedVouchers, isClient]);


  const handleRedeemItem = (item: RedeemableItem) => {
    if (rewardPoints >= item.pointsNeeded) {
      setRewardPoints(prevPoints => prevPoints - item.pointsNeeded);
      
      const now = new Date();
      const newVoucher: RedeemedVoucher = { // Make sure all properties are assigned
        id: item.id,
        voucherId: `voucher-${item.id}-${now.getTime()}`,
        name: item.name,
        redeemedAt: now.toISOString(),
        validUntil: item.validityHours ? addHours(now, item.validityHours).toISOString() : undefined,
      };
      
      setRedeemedVouchers(prevVouchers => [...prevVouchers, newVoucher]);

      toast({
        title: "Item Redeemed!",
        description: `You have successfully redeemed ${item.name} for ${item.pointsNeeded} points. ${newVoucher.validUntil ? `It's valid until ${format(new Date(newVoucher.validUntil), "PPpp")}.` : ''}`,
        variant: "default",
        className: "bg-accent text-accent-foreground border-accent"
      });
    } else {
      toast({
        title: "Not Enough Points",
        description: `You need ${item.pointsNeeded - rewardPoints} more points to redeem ${item.name}.`,
        variant: "destructive",
      });
    }
  };

  if (!isClient) {
    return (
         <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Rewards Center</h1>
            <p className="text-muted-foreground">Loading your points and rewards...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Rewards Center</h1>
        <p className="text-muted-foreground">
          Use your hard-earned points to redeem exciting items from the cafeteria!
        </p>
      </div>

      <Card className="shadow-xl rounded-xl bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"><Star className="mr-2 h-7 w-7 text-yellow-300" /> Your Reward Points</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold">{rewardPoints} <span className="text-2xl font-normal">Points</span></p>
        </CardContent>
        <CardFooter>
            <p className="text-xs opacity-90">Points are awarded for consistently reducing meal waste. Keep up the great work!</p>
        </CardFooter>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
            <Gift className="mr-2 h-6 w-6 text-primary"/> Redeemable Items
        </h2>
        {redeemableItems.length === 0 ? (
            <p className="text-muted-foreground">No redeemable items available at the moment. Check back soon!</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {redeemableItems.map((item) => (
                <Card key={item.id} className="shadow-lg rounded-xl overflow-hidden flex flex-col">
                    <div className="relative w-full h-48">
                        <Image
                            src={item.image} // Updated path
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={item.aiHint}
                            unoptimized={item.image.startsWith('/')} // Important for local images if not optimized by a loader
                        />
                    </div>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-lg flex items-center">
                            <item.icon className="mr-2 h-5 w-5 text-muted-foreground"/>
                            {item.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-primary font-semibold text-lg">{item.pointsNeeded} Points</p>
                        {item.validityHours && <p className="text-xs text-muted-foreground">Valid for {item.validityHours / 24} day(s) after redemption.</p>}
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full"
                            onClick={() => handleRedeemItem(item)}
                            disabled={rewardPoints < item.pointsNeeded}
                        >
                            {rewardPoints < item.pointsNeeded ? "Not Enough Points" : "Redeem"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            </div>
        )}
      </div>

      {redeemedVouchers.length > 0 && (
        <>
            <Separator className="my-8" />
            <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                    <CalendarClock className="mr-2 h-6 w-6 text-primary"/> Your Active Vouchers
                </h2>
                <div className="space-y-4">
                    {redeemedVouchers.map((voucher) => {
                       const isValid = voucher.validUntil ? new Date(voucher.validUntil) > new Date() : true;
                       return (
                        <Card key={voucher.voucherId} className={`shadow-md rounded-xl ${!isValid && voucher.validUntil ? 'opacity-60 bg-muted/50' : ''}`}>
                            <CardHeader className="pb-3 pt-4">
                                <CardTitle className="text-base">{voucher.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p>Redeemed on: {format(new Date(voucher.redeemedAt), "PPp")}</p>
                                {voucher.validUntil ? (
                                    <p className={isValid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                        {isValid ? `Valid until: ${format(new Date(voucher.validUntil), "PPp")}` : `Expired on: ${format(new Date(voucher.validUntil), "PPp")}`}
                                    </p>
                                ) : (
                                    <p className="text-green-600 font-medium">No Expiry (e.g., physical item)</p>
                                )}
                            </CardContent>
                        </Card>
                       );
                    })}
                </div>
            </div>
        </>
      )}
    </div>
  );
}
