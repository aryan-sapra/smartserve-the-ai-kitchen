
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PredictedOccupancyChart } from "@/components/admin/charts/PredictedOccupancyChart";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AirVent, Fan, Lightbulb, Play, Pause, RotateCcw, History, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Appliance {
  id: string;
  name: string;
  type: 'ac' | 'fan' | 'light'; // For easier categorization in automation
  icon: React.ElementType;
  isOn: boolean;
  zone?: string; // e.g., 'Dining A', 'Kitchen', 'Main Hall'
}

const initialAppliances: Appliance[] = [
  { id: "ac1", name: "Main Hall AC 1", type: 'ac', icon: AirVent, isOn: false, zone: "Main Hall" },
  { id: "ac2", name: "Dining Area AC 1", type: 'ac', icon: AirVent, isOn: false, zone: "Dining" },
  { id: "ac3", name: "Kitchen AC", type: 'ac', icon: AirVent, isOn: false, zone: "Kitchen" },
  { id: "ac4", name: "Office Wing AC", type: 'ac', icon: AirVent, isOn: false, zone: "Office" },
  { id: "fan1", name: "Main Hall Fan 1", type: 'fan', icon: Fan, isOn: true, zone: "Main Hall" },
  { id: "fan2", name: "Dining Area Fan 1", type: 'fan', icon: Fan, isOn: false, zone: "Dining" },
  { id: "fan3", name: "Main Hall Fan 2", type: 'fan', icon: Fan, isOn: false, zone: "Main Hall" },
  { id: "fan4", name: "Reception Fan", type: 'fan', icon: Fan, isOn: false, zone: "Reception" },
  { id: "lights1", name: "Main Hall Lights", type: 'light', icon: Lightbulb, isOn: true, zone: "Main Hall" },
  { id: "lights2", name: "Dining Lights Zone A", type: 'light', icon: Lightbulb, isOn: false, zone: "Dining A" },
  { id: "lights3", name: "Dining Lights Zone B", type: 'light', icon: Lightbulb, isOn: false, zone: "Dining B" },
  { id: "lights4", name: "Kitchen Prep Lights", type: 'light', icon: Lightbulb, isOn: true, zone: "Kitchen" },
  { id: "lights5", name: "Corridor Lights", type: 'light', icon: Lightbulb, isOn: false, zone: "Corridor" },
  { id: "lights6", name: "Restroom Lights", type: 'light', icon: Lightbulb, isOn: false, zone: "Restroom" },
];

// This data needs to be consistent with PredictedOccupancyChart or passed as a prop.
// For simplicity, we'll duplicate it here for the automation logic.
const predictedOccupancyData = [
  { timeSlot: "10-11 AM", users: 25, hour: 10 },
  { timeSlot: "11-12 PM", users: 40, hour: 11 },
  { timeSlot: "12-1 PM", users: 75, hour: 12 }, // Peak
  { timeSlot: "1-2 PM", users: 60, hour: 13 },  // Moderate-High
  { timeSlot: "2-3 PM", users: 30, hour: 14 },  // Low-Moderate
  { timeSlot: "3-4 PM", users: 15, hour: 15 },  // Low
  { timeSlot: "4-5 PM", users: 10, hour: 16 },  // Very Low
];
const SIMULATION_START_HOUR = 10;
const SIMULATION_END_HOUR = 16; // Represents 4-5 PM slot

export default function FacilityIntegrationPage() {
  const [appliances, setAppliances] = useState<Appliance[]>(initialAppliances);
  const [simulatedTime, setSimulatedTime] = useState<number>(SIMULATION_START_HOUR);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [automationLog, setAutomationLog] = useState<string[]>([]);

  const formatSimulatedTime = (hour: number): string => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${ampm}`;
  };

  const addLogEntry = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAutomationLog(prevLog => [`[${timestamp}] ${message}`, ...prevLog].slice(0, 20)); // Keep last 20 entries
  }, [setAutomationLog]);

  const handleToggleAppliance = (applianceId: string) => {
    const applianceToToggle = appliances.find(a => a.id === applianceId);
    if (!applianceToToggle) return;

    const newIsOnState = !applianceToToggle.isOn;

    setAppliances((prevAppliances) =>
      prevAppliances.map((appliance) =>
        appliance.id === applianceId
          ? { ...appliance, isOn: newIsOnState }
          : appliance
      )
    );
    
    if (!isSimulationRunning) { // Only log manual toggles if simulation is not running
        addLogEntry(`Manually toggled ${applianceToToggle.name} to ${newIsOnState ? 'ON' : 'OFF'}`);
    }
  };

  // Automation Logic
  const runAutomation = useCallback((currentHour: number) => {
    const occupancyEntry = predictedOccupancyData.find(d => d.hour === currentHour);
    if (!occupancyEntry) {
      addLogEntry(`No occupancy data for ${formatSimulatedTime(currentHour)}. No changes made.`);
      return;
    }

    const { users } = occupancyEntry;
    addLogEntry(`Simulated time: ${formatSimulatedTime(currentHour)}, Predicted Users: ${users}. Running automation...`);

    let changesMade = false;
    setAppliances(prevAppliances => 
      prevAppliances.map(appliance => {
        let newIsOn = appliance.isOn;
        if (appliance.type === 'ac') {
          if (users > 65) newIsOn = true; // All ACs on for peak
          else if (users > 45) newIsOn = appliance.zone === "Main Hall" || appliance.zone === "Dining"; // Main ACs for moderate
          else if (users > 20) newIsOn = (appliance.zone === "Main Hall" && appliance.id === "ac1"); // Minimal AC
          else newIsOn = false; // Off for very low
        } else if (appliance.type === 'fan') {
          if (users > 50) newIsOn = true; // All fans on
          else if (users > 30) newIsOn = appliance.zone === "Main Hall" || appliance.zone === "Dining";
          else newIsOn = false;
        } else if (appliance.type === 'light') {
          if (users > 35) newIsOn = appliance.zone !== "Restroom" && appliance.zone !== "Corridor"; // Most lights
          else if (users > 15) newIsOn = appliance.zone === "Main Hall" || appliance.zone === "Kitchen" || appliance.zone === "Dining A"; // Essential lights
          else newIsOn = appliance.zone === "Kitchen" || appliance.zone === "Corridor"; // Minimal lights
        }

        if (newIsOn !== appliance.isOn) {
          changesMade = true;
          addLogEntry(`Automation: Turned ${appliance.name} ${newIsOn ? 'ON' : 'OFF'} (Users: ${users})`);
        }
        return { ...appliance, isOn: newIsOn };
      })
    );
    if (!changesMade) {
        addLogEntry(`No appliance state changes needed for ${formatSimulatedTime(currentHour)} (Users: ${users})`);
    }
  }, [addLogEntry]); // setAppliances from useState is stable


  // Effect for simulation clock
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isSimulationRunning) {
      intervalId = setInterval(() => {
        setSimulatedTime(prevTime => {
          if (prevTime >= SIMULATION_END_HOUR) {
            setIsSimulationRunning(false); // Stop simulation at end time
            addLogEntry("Simulation ended.");
            return SIMULATION_END_HOUR;
          }
          return prevTime + 1;
        });
      }, 3000); // Advance time every 3 seconds
    }
    return () => clearInterval(intervalId);
  }, [isSimulationRunning, addLogEntry]);

  // Effect to run automation when simulatedTime changes
  useEffect(() => {
    if (isSimulationRunning) {
      runAutomation(simulatedTime);
    }
  }, [simulatedTime, isSimulationRunning, runAutomation]);

  const startSimulation = () => {
    if (simulatedTime >= SIMULATION_END_HOUR) {
        setSimulatedTime(SIMULATION_START_HOUR); // Reset if at end
        setAutomationLog([]); // Clear log on restart from end
        addLogEntry("Simulation restarted.");
    } else {
        addLogEntry("Simulation started/resumed.");
    }
    setIsSimulationRunning(true);
  };

  const pauseSimulation = () => {
    setIsSimulationRunning(false);
    addLogEntry("Simulation paused.");
  };

  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setSimulatedTime(SIMULATION_START_HOUR);
    setAppliances(initialAppliances); // Reset appliances to initial state
    setAutomationLog([]);
    addLogEntry("Simulation reset to initial state.");
  };
  

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Facility Integration</h1>
        <p className="text-muted-foreground">Monitor predicted occupancy and manage facility appliances.</p>
      </div>

      <PredictedOccupancyChart />

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5 text-primary"/>Test Clock & Automation Control</CardTitle>
          <CardDescription>Simulate time to observe automatic appliance adjustments based on predicted occupancy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">Simulated Time</p>
                <p className="text-3xl font-bold text-primary">{formatSimulatedTime(simulatedTime)}</p>
            </div>
            <div className="flex justify-center gap-2">
                {!isSimulationRunning ? (
                    <Button onClick={startSimulation} variant="default" className="bg-green-600 hover:bg-green-700">
                        <Play className="mr-2 h-4 w-4"/> {simulatedTime >= SIMULATION_END_HOUR ? "Restart Simulation" : "Start Simulation"}
                    </Button>
                ) : (
                    <Button onClick={pauseSimulation} variant="outline">
                        <Pause className="mr-2 h-4 w-4"/> Pause Simulation
                    </Button>
                )}
                <Button onClick={resetSimulation} variant="destructive">
                    <RotateCcw className="mr-2 h-4 w-4"/> Reset
                </Button>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md rounded-xl">
            <CardHeader>
            <CardTitle>Appliance Controls</CardTitle>
            <CardDescription>
                {isSimulationRunning 
                ? "Appliance states are currently managed by automation." 
                : "Manually control facility appliances. Simulation is paused."}
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px]">
            <ScrollArea className="h-[350px] pr-3">
                {appliances.map((appliance, index) => (
                <React.Fragment key={appliance.id}>
                    <div className="flex items-center justify-between space-x-4 p-2.5 rounded-md border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                        <appliance.icon className={`h-5 w-5 ${appliance.isOn ? 'text-primary' : 'text-muted-foreground'}`} />
                        <Label htmlFor={appliance.id} className="flex flex-col">
                            <span className="font-medium">{appliance.name}</span>
                            <span className={`text-xs ${appliance.isOn ? 'text-green-600' : 'text-red-600'}`}>
                                {appliance.isOn ? "Status: ON" : "Status: OFF"}
                            </span>
                        </Label>
                    </div>
                    <Switch
                        id={appliance.id}
                        checked={appliance.isOn}
                        onCheckedChange={() => handleToggleAppliance(appliance.id)}
                        aria-label={`Toggle ${appliance.name}`}
                        // Simpler disabled logic: disable if simulation is running and automation turned it off
                        disabled={isSimulationRunning && !appliance.isOn && initialAppliances.find(a=>a.id === appliance.id)?.isOn !== appliance.isOn}
                    />
                    </div>
                    {index < appliances.length - 1 && <Separator className="my-1" />}
                </React.Fragment>
                ))}
            </ScrollArea>
            </CardContent>
        </Card>
        <Card className="shadow-md rounded-xl">
            <CardHeader>
                <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-amber-500"/>Automation Log</CardTitle>
                <CardDescription>Recent actions taken by the facility automation system.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px] p-3 bg-muted/30 rounded-md border">
                    {automationLog.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic text-center py-4">No automation actions logged yet. Start simulation.</p>
                    ) : (
                        <ul className="space-y-1.5 text-xs">
                        {automationLog.map((log, index) => (
                            <li key={index} className="text-muted-foreground">
                                <span className="font-mono text-foreground/80">{log.split('] ')[0]}]</span> {log.split('] ')[1]}
                            </li>
                        ))}
                        </ul>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

