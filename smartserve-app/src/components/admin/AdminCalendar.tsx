
"use client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { parse, isEqual, startOfDay } from 'date-fns';

const HACKATHON_DATE_STR = "2025-05-29"; // YYYY-MM-DD
const EVENT_MULTIPLIER_STORAGE_KEY = "smartserve_current_event_multiplier";

export function AdminCalendar() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [numTeams, setNumTeams] = useState("");
  const [avgPersons, setAvgPersons] = useState("");

  const hackathonDate = parse(HACKATHON_DATE_STR, 'yyyy-MM-dd', new Date());

  useEffect(() => {
    setIsClient(true);
    setDate(new Date()); // Set initial calendar view to today
  }, []);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && isEqual(startOfDay(selectedDate), startOfDay(hackathonDate))) {
      setSelectedEventTitle("Hackathon");
      // Reset form fields when opening dialog
      const storedMultiplier = localStorage.getItem(EVENT_MULTIPLIER_STORAGE_KEY);
      if (storedMultiplier) {
        // For simplicity, we don't pre-fill teams/persons from multiplier.
        // A more complex app might try to reverse-engineer or store original inputs.
      }
      setNumTeams("");
      setAvgPersons("");
      setIsEventDialogOpen(true);
    }
  };

  const handleSaveEventMultiplier = () => {
    const teams = parseInt(numTeams, 10);
    const persons = parseInt(avgPersons, 10);
    let multiplier = 1.0;

    if (!isNaN(teams) && !isNaN(persons) && teams > 0 && persons > 0) {
      const totalAttendees = teams * persons;
      if (totalAttendees > 100) { // Example threshold
        multiplier = 1.8;
      } else if (totalAttendees > 50) {
        multiplier = 1.6;
      } else if (totalAttendees > 20) {
        multiplier = 1.4;
      } else {
        multiplier = 1.1; // Small event still gets a slight bump
      }
       toast({
        title: "Event Multiplier Applied!",
        description: `Hackathon: ${teams} teams, ~${persons} persons/team. Multiplier set to ${multiplier.toFixed(1)}.`,
        className: "bg-accent text-accent-foreground border-accent",
      });
    } else {
      // If inputs are invalid or empty, reset to default multiplier
      multiplier = 1.0;
      toast({
        title: "Event Multiplier Reset",
        description: "No specific event attendee numbers provided, multiplier reset to default (1.0).",
        variant: "default",
      });
    }

    localStorage.setItem(EVENT_MULTIPLIER_STORAGE_KEY, multiplier.toString());
    // Manually dispatch storage event to ensure other components pick it up
    window.dispatchEvent(new StorageEvent('storage', {
        key: EVENT_MULTIPLIER_STORAGE_KEY,
        newValue: multiplier.toString()
    }));
    
    setIsEventDialogOpen(false);
  };
  
  const handleClearEventMultiplier = () => {
    localStorage.removeItem(EVENT_MULTIPLIER_STORAGE_KEY);
    window.dispatchEvent(new StorageEvent('storage', { key: EVENT_MULTIPLIER_STORAGE_KEY, newValue: null }));
    toast({
        title: "Event Multiplier Cleared",
        description: "The special event multiplier has been removed. Suggestions will use default logic.",
    });
    setIsEventDialogOpen(false);
  };


  if (!isClient) {
    return (
      <Card className="shadow-md rounded-lg group-data-[state=collapsed]:hidden">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm font-medium">Calendar</CardTitle>
        </CardHeader>
        <CardContent className="p-1 flex justify-center items-center min-h-[280px]">
          <p className="text-xs text-muted-foreground">Loading calendar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md rounded-lg group-data-[state=collapsed]:hidden">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm font-medium">Calendar</CardTitle>
        </CardHeader>
        <CardContent className="p-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md"
            classNames={{
              day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
              day_today: "bg-accent text-accent-foreground",
            }}
            modifiers={{
              holidays: [new Date(2025, 7, 15), new Date(2025, 9, 2)], // Aug 15, Oct 2
              teamEvents: [hackathonDate] // May 29, 2025
            }}
            modifiersStyles={{
              holidays: { border: "2px solid hsl(var(--destructive))", borderRadius: 'var(--radius)' },
              teamEvents: { border: "2px solid hsl(var(--accent))", borderRadius: 'var(--radius)' }
            }}
            defaultMonth={new Date(2025, 4)} // Default to May 2025 to easily show the event
          />
          <div className="p-2 text-xs space-y-1 mt-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-destructive"></div>
              <span>Holidays</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-accent"></div>
              <span>Team Events (Hackathon on May 29, 2025)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Event Details: {selectedEventTitle}</DialogTitle>
            <DialogDescription>
              Set participant numbers to adjust meal preparation suggestions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numTeams" className="text-right col-span-1">
                No. of Teams
              </Label>
              <Input
                id="numTeams"
                type="number"
                value={numTeams}
                onChange={(e) => setNumTeams(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avgPersons" className="text-right col-span-1">
                Avg. Persons/Team
              </Label>
              <Input
                id="avgPersons"
                type="number"
                value={avgPersons}
                onChange={(e) => setAvgPersons(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 5"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClearEventMultiplier}>
                Clear Event Multiplier
            </Button>
            <div className="flex gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveEventMultiplier}>
                    Save & Apply Multiplier
                </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
