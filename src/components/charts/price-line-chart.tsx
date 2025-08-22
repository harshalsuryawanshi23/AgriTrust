'use client';

import * as React from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

// Memoize static data to prevent unnecessary re-renders
const data = [
  { month: 'Jan', price: 2100 },
  { month: 'Feb', price: 2150 },
  { month: 'Mar', price: 2200 },
  { month: 'Apr', price: 2280 },
  { month: 'May', price: 2250 },
  { month: 'Jun', price: 2300 },
];

// Optimize tick formatter to prevent recreation on every render
const tickFormatter = (value: number) => `₹${value}`;

// Memoize chart configuration objects
const chartMargin = { top: 5, right: 20, left: -10, bottom: 5 };
const cursorConfig = { stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' };
const activeDotConfig = { r: 8 };

const PriceLineChart = React.memo(() => {
  return (
    <ResponsiveContainer width="100%" height="100%" debounce={100}>
      <LineChart data={data} margin={chartMargin}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
        <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} />
        <YAxis 
          stroke="hsl(var(--foreground))" 
          fontSize={12} 
          domain={['dataMin - 100', 'dataMax + 100']} 
          tickFormatter={tickFormatter} 
        />
        <Tooltip
          content={<ChartTooltipContent indicator="dot" />}
          cursor={cursorConfig}
          animationDuration={200}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2} 
          activeDot={activeDotConfig}
          dot={false}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

PriceLineChart.displayName = 'PriceLineChart';

export default PriceLineChart;
