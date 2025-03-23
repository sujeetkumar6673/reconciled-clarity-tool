
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartDataPoint {
  date: string;
  anomalies: number;
  amount: number;
}

interface AnomalyTrendChartProps {
  chartData: ChartDataPoint[];
}

const AnomalyTrendChart: React.FC<AnomalyTrendChartProps> = ({ chartData }) => {
  return (
    <div className="lg:col-span-1 animate-fade-in animate-delay-100">
      <Card className="glass-card h-full">
        <CardHeader>
          <CardTitle>Anomaly Trend</CardTitle>
          <CardDescription>
            Daily anomaly count and financial impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="anomalies"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorAnomalies)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyTrendChart;
