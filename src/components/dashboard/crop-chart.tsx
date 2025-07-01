"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { cropDistributionData } from "@/lib/mock-data"
import { ChartContainer, ChartTooltip as ChartTooltipWrapper, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"

export function CropChart() {
  return (
    <div className="w-full h-[350px] flex flex-col items-center">
        <ChartContainer config={{}} className="mx-auto aspect-square w-full max-w-[300px]">
          <PieChart>
             <ChartTooltipWrapper
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            <Pie
              data={cropDistributionData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
             {cropDistributionData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
    </div>
  )
}
