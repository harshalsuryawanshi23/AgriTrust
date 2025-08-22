'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

// Memoize static data to prevent unnecessary re-renders
const data = [
  { name: 'Urea', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'DAP', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Potash', value: 200, fill: 'hsl(var(--chart-3))' },
  { name: 'NPK', value: 278, fill: 'hsl(var(--chart-4))' },
];

// Optimize label renderer - defined as regular function outside component
const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const FertilizerPieChart = React.memo(() => {
  // Memoize cells inside the component where hooks are allowed
  const renderCells = React.useMemo(() => 
    data.map((entry, index) => (
      <Cell 
        key={`cell-${index}`} 
        fill={entry.fill} 
        stroke={entry.fill}
        strokeWidth={2}
      />
    )), []
  );

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={100}>
      <PieChart>
        <Tooltip 
          content={<ChartTooltipContent indicator="dot" />} 
          animationDuration={200}
        />
        <Legend />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={0}
          labelLine={false}
          label={renderLabel}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {renderCells}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
});

FertilizerPieChart.displayName = 'FertilizerPieChart';

export default FertilizerPieChart;
