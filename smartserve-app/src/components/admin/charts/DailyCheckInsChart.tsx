"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"

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
  { date: "2024-07-01", checkIns: 55 },
  { date: "2024-07-02", checkIns: 62 },
  { date: "2024-07-03", checkIns: 70 },
  { date: "2024-07-04", checkIns: 45 }, // Holiday/Weekend dip
  { date: "2024-07-05", checkIns: 75 },
  { date: "2024-07-06", checkIns: 80 },
  { date: "2024-07-07", checkIns: 72 },
];

const chartConfig = {
  checkIns: {
    label: "Check-ins",
    color: "hsl(var(--chart-1))",
  },
}

export function DailyCheckInsChart() {
  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle>Daily User Check-ins</CardTitle>
        <CardDescription>Check-in trends over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="checkIns"
              type="monotone"
              stroke="var(--color-checkIns)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total check-ins for the last 7 days
        </div>
      </CardFooter>
    </Card>
  )
}
