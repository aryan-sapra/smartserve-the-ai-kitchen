"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { TrendingDown } from "lucide-react"
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
  { date: "2024-W27", food: 12.5, water: 5.2 }, // Week 27
  { date: "2024-W28", food: 10.2, water: 4.8 }, // Week 28
  { date: "2024-W29", food: 9.8, water: 4.5 },  // Week 29
  { date: "2024-W30", food: 11.0, water: 5.0 }, // Week 30
];

const chartConfig = {
  food: {
    label: "Food Waste (kg)",
    color: "hsl(var(--chart-4))",
  },
  water: {
    label: "Water Waste (L)",
    color: "hsl(var(--chart-5))",
  },
}

export function WasteDataChart() {
  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle>Waste Data Over Time</CardTitle>
        <CardDescription>Weekly food (kg) and water (liters) waste.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{left: 12, right: 12,}}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              // tickFormatter={(value) => value.slice(-2)} // Example: Show W27 as 27
            />
             <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="food" fill="var(--color-food)" radius={4} />
            <Bar dataKey="water" fill="var(--color-water)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Overall waste reduced by 3.1% last week <TrendingDown className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing waste data for the last 4 weeks
        </div>
      </CardFooter>
    </Card>
  )
}
