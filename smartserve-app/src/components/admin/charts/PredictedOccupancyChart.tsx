
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Users } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { timeSlot: "10-11 AM", users: 25 },
  { timeSlot: "11-12 PM", users: 40 },
  { timeSlot: "12-1 PM", users: 75 },
  { timeSlot: "1-2 PM", users: 60 },
  { timeSlot: "2-3 PM", users: 30 },
  { timeSlot: "3-4 PM", users: 15 },
  { timeSlot: "4-5 PM", users: 10 },
];

const chartConfig = {
  users: {
    label: "Predicted Users",
    color: "hsl(var(--chart-2))", // Using chart-2 for a different color
  },
}

export function PredictedOccupancyChart() {
  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle>Predicted Cafeteria Occupancy</CardTitle>
        <CardDescription>Estimated number of users in 1-hour time slots based on trends.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{left: 12, right: 12}}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timeSlot"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
             <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                label={{ value: 'Users', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="users" fill="var(--color-users)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Peak occupancy expected around 12-1 PM <Users className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Data based on historical check-in patterns and current day factors.
        </div>
      </CardFooter>
    </Card>
  )
}
