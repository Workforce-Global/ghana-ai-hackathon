"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { diseaseFrequencyData } from "@/lib/mock-data"
import { ChartTooltipContent, ChartContainer, ChartTooltip as ChartTooltipWrapper, } from "@/components/ui/chart"

export function DiseaseChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={diseaseFrequencyData}>
         <ChartContainer config={{}} className="min-h-[200px] w-full">
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
             <ChartTooltipWrapper
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
            <Bar dataKey="cases" radius={[4, 4, 0, 0]} />
        </ChartContainer>
      </BarChart>
    </ResponsiveContainer>
  )
}
