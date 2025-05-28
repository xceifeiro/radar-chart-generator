"use client"

import { RadarChart, PolarAngleAxis, PolarGrid, Radar, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RadarChartData {
  subject: string
  value: number
  fullMark: number
}

interface RadarChartComponentProps {
  data: RadarChartData[]
}

export default function RadarChartComponent({ data }: RadarChartComponentProps) {
  const chartConfig = {
    value: {
      label: "Valor",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value, name) => [`${value}/10`, name === "value" ? "Pontuação" : name]}
          />
          <PolarGrid gridType="polygon" radialLines={true} stroke="hsl(var(--border))" strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fontSize: 12,
              fill: "hsl(var(--foreground))",
              textAnchor: "middle",
            }}
            className="text-xs"
          />
          <Radar
            name="value"
            dataKey="value"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{
              fill: "hsl(var(--chart-1))",
              strokeWidth: 2,
              r: 4,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
