'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from '@/components/ui/metric-card';
import { LoadingScreen } from '@/components/ui/loading';
import { IndianRupee, Users, Blocks, TrendingUp, Sprout, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load chart components for better performance
const PriceLineChart = React.lazy(() => import('@/components/charts/price-line-chart'));
const FertilizerPieChart = React.lazy(() => import('@/components/charts/fertilizer-pie-chart'));

// Loading fallback component
const ChartSkeleton = () => (
  <div className="h-[300px] w-full animate-pulse bg-muted rounded-md flex items-center justify-center">
    <div className="text-muted-foreground">Loading chart...</div>
  </div>
);

const priceChartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const fertilizerChartConfig = {
  Urea: { label: 'Urea', color: "hsl(var(--chart-1))" },
  DAP: { label: 'DAP', color: "hsl(var(--chart-2))" },
  Potash: { label: 'Potash', color: "hsl(var(--chart-3))" },
  NPK: { label: 'NPK', color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

const DashboardPage = React.memo(() => {
  const { userProfile, loading } = useAuth();
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  // Simulate data loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsDataLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced metrics data with real-time simulation
  const metricsData = React.useMemo(() => [
    {
      title: "Total Farmers",
      value: 1234,
      change: { value: 5.2, period: "last month" },
      icon: Users,
      description: "Registered farmers in the system",
      color: "blue" as const,
      trend: "up" as const
    },
    {
      title: "Active Transactions",
      value: 10456,
      change: { value: 12.1, period: "last month" },
      icon: Blocks,
      description: "Total blockchain transactions recorded",
      color: "green" as const,
      trend: "up" as const
    },
    {
      title: "Live Crop Prices",
      value: "₹2,350/qtl",
      change: { value: 2.5, period: "this week" },
      icon: IndianRupee,
      description: "Current wheat price with prediction",
      color: "orange" as const,
      trend: "up" as const
    },
    {
      title: "Fertilizer Recommendations",
      value: 89,
      change: { value: -3.2, period: "last week" },
      icon: Sprout,
      description: "AI-powered fertilizer suggestions",
      color: "purple" as const,
      trend: "down" as const
    },
    {
      title: "Yield Predictions",
      value: "95.2%",
      change: { value: 8.7, period: "this season" },
      icon: BarChart3,
      description: "Accuracy of yield forecasting model",
      color: "green" as const,
      trend: "up" as const
    },
    {
      title: "Weather Alerts",
      value: 3,
      change: { value: -15.8, period: "this week" },
      icon: TrendingUp,
      description: "Active weather warnings for farmers",
      color: "red" as const,
      trend: "down" as const
    }
  ], []);

  if (loading || isDataLoading) {
    return <LoadingScreen message="Loading dashboard data..." />;
  }

  return (
    <motion.div 
      className="flex-1 space-y-6 p-4 md:p-8 pt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userProfile?.displayName || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your agricultural operations today.
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {metricsData.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </motion.div>
      {/* Charts Section */}
      <motion.div 
        className="grid gap-4 lg:grid-cols-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div
          className="lg:col-span-4"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Price Predictions (Wheat)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered price forecasting with 95% accuracy
              </p>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={priceChartConfig} className="h-[300px] sm:h-[350px] w-full">
                <React.Suspense fallback={<ChartSkeleton />}>
                  <PriceLineChart />
                </React.Suspense>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          className="lg:col-span-3"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-500" />
                Fertilizer Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Current usage distribution across all farms
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={fertilizerChartConfig} className="h-[300px] sm:h-[350px] w-full">
                <React.Suspense fallback={<ChartSkeleton />}>
                  <FertilizerPieChart />
                </React.Suspense>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;
