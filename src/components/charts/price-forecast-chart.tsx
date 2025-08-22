'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

interface PriceForecastChartProps {
  data: {
      month: string;
      price: number;
      type: 'Historical' | 'Predicted';
  }[];
}

export default function PriceForecastChart({ data }: PriceForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
        <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--foreground))" fontSize={12} domain={['dataMin - 200', 'dataMax + 200']} tickFormatter={(value) => `₹${value}`} />
        <Tooltip
          content={<ChartTooltipContent indicator="dot" />}
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1.5, strokeDasharray: '4 4' }}
        />
        <Legend />
        <Line
            type="monotone"
            dataKey="price"
            name="Historical"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            connectNulls
            data={data.filter(d => d.type === 'Historical')}
            />
        <Line
            type="monotone"
            dataKey="price"
            name="Predicted"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
            data={data.filter(d => d.type === 'Predicted')}
            />
      </LineChart>
    </ResponsiveContainer>
  );
}
