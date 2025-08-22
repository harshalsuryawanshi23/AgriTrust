
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Wand2, Loader2 } from 'lucide-react';
import PriceForecastChart from './charts/price-forecast-chart';
import { getPriceSummary } from '@/app/price-forecast/actions';
import { useToast } from '@/hooks/use-toast';
import type { PriceData } from '@/lib/types';

const crops = ['Wheat', 'Rice', 'Maize', 'Cotton'];

const dummyData: { [key: string]: PriceData[] } = {
  Wheat: [
    { month: 'Jan', price: 2100, type: 'Historical' }, { month: 'Feb', price: 2150, type: 'Historical' }, { month: 'Mar', price: 2200, type: 'Historical' },
    { month: 'Apr', price: 2280, type: 'Historical' }, { month: 'May', price: 2250, type: 'Historical' }, { month: 'Jun', price: 2300, type: 'Historical' },
    { month: 'Jul', price: 2350, type: 'Predicted' }, { month: 'Aug', price: 2380, type: 'Predicted' },
    { month: 'Sep', price: 2400, type: 'Predicted' }, { month: 'Oct', price: 2420, type: 'Predicted' }, { month: 'Nov', price: 2450, type: 'Predicted' },
  ],
  Rice: [
    { month: 'Jan', price: 3400, type: 'Historical' }, { month: 'Feb', price: 3450, type: 'Historical' }, { month: 'Mar', price: 3500, type: 'Historical' },
    { month: 'Apr', price: 3580, type: 'Historical' }, { month: 'May', price: 3550, type: 'Historical' }, { month: 'Jun', price: 3600, type: 'Historical' },
    { month: 'Jul', price: 3650, type: 'Predicted' }, { month: 'Aug', price: 3680, type: 'Predicted' },
    { month: 'Sep', price: 3700, type: 'Predicted' }, { month: 'Oct', price: 3720, type: 'Predicted' }, { month: 'Nov', price: 3750, type: 'Predicted' },
  ],
  // Add other crops similarly
};

dummyData.Maize = dummyData.Wheat.map(d => ({...d, price: d.price * 0.8}));
dummyData.Cotton = dummyData.Wheat.map(d => ({...d, price: d.price * 2.5}));

const chartConfig = {
  Historical: {
    label: "Historical",
    color: "hsl(var(--chart-2))",
  },
  Predicted: {
    label: "Predicted",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const priceDataForChart = (data: PriceData[]) => {
    const historical = data.filter(d => d.type === 'Historical');
    const predicted = data.filter(d => d.type === 'Predicted');

    if (historical.length > 0 && predicted.length > 0) {
        const lastHistorical = historical[historical.length - 1];
        const firstPredicted = predicted[0];
        if (lastHistorical.month === firstPredicted.month) {
            // Already connected
        } else {
             const connectingPoint: PriceData = {
                month: lastHistorical.month,
                price: lastHistorical.price,
                type: 'Predicted',
            };
            return [...historical, connectingPoint, ...predicted];
        }
    }
    
    return [...historical, ...predicted];
};


export default function PriceForecastClient() {
  const [selectedCrop, setSelectedCrop] = React.useState(crops[0]);
  const [chartData, setChartData] = React.useState<PriceData[]>([]);
  const [summary, setSummary] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const rawData = dummyData[selectedCrop];
    const processedData = priceDataForChart(rawData);
    setChartData(processedData);
    setSummary('');
  }, [selectedCrop]);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    const { summary: newSummary, error } = await getPriceSummary(selectedCrop, chartData);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
    } else {
      setSummary(newSummary || '');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Market Trends: {selectedCrop}</CardTitle>
              <CardDescription>Historical and predicted price data.</CardDescription>
            </div>
            <Select onValueChange={setSelectedCrop} defaultValue={selectedCrop}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PriceForecastChart data={chartData} />
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>AI-Powered Summary</CardTitle>
            <CardDescription>
              Get key trends and insights from the price data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Summary
            </Button>
            <div className="mt-4 flex-grow rounded-md border bg-muted/50 p-4">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Generating analysis...</p>
                </div>
              )}
              {summary && (
                <div className="prose prose-sm max-w-none text-foreground">
                  {summary.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              )}
               {!summary && !isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-center">Click the button to generate an AI summary of the price trends.</p>
                 </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
