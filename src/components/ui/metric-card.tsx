'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon?: React.ComponentType<any>;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'blue' | 'orange' | 'purple';
  className?: string;
  onClick?: () => void;
}

const colorVariants = {
  green: 'border-green-200 bg-green-50 text-green-900 hover:bg-green-100',
  red: 'border-red-200 bg-red-50 text-red-900 hover:bg-red-100',
  blue: 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100',
  orange: 'border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100',
  purple: 'border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100',
};

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  className,
  onClick,
}: MetricCardProps) => {
  const getTrendIcon = () => {
    switch (trend || (change && change.value > 0 ? 'up' : change && change.value < 0 ? 'down' : 'neutral')) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend || (change && change.value > 0 ? 'up' : change && change.value < 0 ? 'down' : 'neutral')) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                'transition-all duration-300 cursor-pointer',
                colorVariants[color],
                className
              )}
              onClick={onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <motion.div
                  className="text-2xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </motion.div>
                {change && (
                  <div className="flex items-center space-x-1 mt-1">
                    {getTrendIcon()}
                    <span className={cn('text-xs font-medium', getTrendColor())}>
                      {change.value > 0 ? '+' : ''}
                      {change.value}% from {change.period}
                    </span>
                  </div>
                )}
                {trend && !change && (
                  <div className="flex items-center space-x-1 mt-1">
                    {getTrendIcon()}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TooltipTrigger>
        {description && (
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetricCard;
