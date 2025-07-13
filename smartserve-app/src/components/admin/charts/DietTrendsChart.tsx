"use client"

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { TrendingUp } from "lucide-react"
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
  { name: "Vegetarian", value: 275, fill: "hsl(var(--chart-1))" },
  { name: "Non-Vegetarian", value: 350, fill: "hsl(var(--chart-2))" },
  { name: "Vegan", value: 150, fill: "hsl(var(--chart-3))" },
]

const chartConfig = {
  value: {
    label: "Count",
  },
  vegetarian: {
    label: "Vegetarian",
    color: "hsl(var(--chart-1))",
  },
  nonvegetarian: {
    label: "Non-Vegetarian",
    color: "hsl(var(--chart-2))",
  },
  vegan: {
    label: "Vegan",
    color: "hsl(var(--chart-3))",
  },
}

export function DietTrendsChart() {
  return (
    <Card className="shadow-md rounded-xl flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Diet Preference Trends</CardTitle>
        <CardDescription>Distribution of dietary preferences.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              strokeWidth={5}
            >
              {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
             <Legend 
                content={({ payload }) => (
                    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
                    {payload?.map((entry, index) => (
                        <li key={`item-${index}`} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.value}
                        </li>
                    ))}
                    </ul>
                )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm mt-auto">
        <div className="flex items-center gap-2 font-medium leading-none">
          Non-vegetarian remains most popular <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing data for the current month
        </div>
      </CardFooter>
    </Card>
  )
}
