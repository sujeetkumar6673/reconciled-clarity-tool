
import { useState } from 'react';
import { AlertTriangle, Filter, ArrowUpDown, FileText, DollarSign, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock data for anomalies
const anomalyData = [
  { 
    id: 1, 
    title: 'Balance Discrepancy', 
    description: 'General Ledger balance doesn\'t match bank statement by $1,240.50',
    severity: 'high',
    category: 'balance',
    date: '2023-05-22',
    impact: '$1,240.50',
    status: 'unresolved'
  },
  { 
    id: 2, 
    title: 'Duplicate Transaction', 
    description: 'Invoice #INV-2023-0542 was paid twice on different dates',
    severity: 'medium',
    category: 'duplicate',
    date: '2023-05-18',
    impact: '$458.75',
    status: 'unresolved'
  },
  { 
    id: 3, 
    title: 'Missing Transaction', 
    description: 'Bank shows withdrawal of $890.25 with no corresponding GL entry',
    severity: 'high',
    category: 'missing',
    date: '2023-05-15',
    impact: '$890.25',
    status: 'unresolved'
  },
  { 
    id: 4, 
    title: 'Timing Discrepancy', 
    description: 'Transaction recorded in GL on May 10, but cleared bank on May 15',
    severity: 'low',
    category: 'timing',
    date: '2023-05-10',
    impact: '$325.00',
    status: 'resolved'
  },
  { 
    id: 5, 
    title: 'Unclassified Transaction', 
    description: 'Bank deposit of $1,532.80 not classified in GL accounts',
    severity: 'medium',
    category: 'unclassified',
    date: '2023-05-12',
    impact: '$1,532.80',
    status: 'unresolved'
  },
];

// Mock data for chart
const chartData = [
  { date: 'May 1', anomalies: 2, amount: 520 },
  { date: 'May 5', anomalies: 1, amount: 320 },
  { date: 'May 10', anomalies: 4, amount: 1240 },
  { date: 'May 15', anomalies: 3, amount: 890 },
  { date: 'May 20', anomalies: 5, amount: 2300 },
];

const AnomalySection = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredAnomalies = anomalyData.filter(anomaly => {
    if (selectedTab === 'high' && anomaly.severity !== 'high') return false;
    if (selectedTab === 'resolved' && anomaly.status !== 'resolved') return false;
    if (selectedTab === 'unresolved' && anomaly.status !== 'unresolved') return false;
    if (selectedCategory && anomaly.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'balance':
        return <DollarSign className="h-4 w-4" />;
      case 'duplicate':
        return <FileText className="h-4 w-4" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'timing':
        return <Clock className="h-4 w-4" />;
      case 'unclassified':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">Anomaly Detection</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Identify and resolve reconciliation anomalies and discrepancies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Summary cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Total Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{anomalyData.length}</div>
              <p className="text-sm text-muted-foreground">Across all accounts</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                Total Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                $4,447.30
              </div>
              <p className="text-sm text-muted-foreground">Combined financial impact</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">20%</div>
              <p className="text-sm text-muted-foreground">1 of 5 anomalies resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Left column - Anomaly Chart */}
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

        {/* Right column - Anomaly List */}
        <div className="lg:col-span-2 animate-fade-in animate-delay-200">
          <Card className="glass-card h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anomaly Details</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    <span>Filter</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                    <span>Sort</span>
                  </Button>
                </div>
              </div>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="high">High Priority</TabsTrigger>
                  <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex flex-wrap gap-2 mt-2">
                {['balance', 'duplicate', 'missing', 'timing', 'unclassified'].map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => 
                      setSelectedCategory(selectedCategory === category ? null : category)
                    }
                  >
                    {getCategoryIcon(category)}
                    <span className="ml-1">{category}</span>
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="all" className="space-y-4 mt-0">
                {filteredAnomalies.length > 0 ? (
                  filteredAnomalies.map(anomaly => (
                    <div 
                      key={anomaly.id}
                      className="p-4 rounded-lg border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium flex items-center">
                            {getCategoryIcon(anomaly.category)}
                            <span className="ml-2">{anomaly.title}</span>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {anomaly.description}
                          </p>
                        </div>
                        <Badge 
                          className={cn(
                            "ml-2",
                            getSeverityColor(anomaly.severity)
                          )}
                        >
                          {anomaly.severity} priority
                        </Badge>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {anomaly.date}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {anomaly.impact}
                          </span>
                        </div>
                        <Badge variant={anomaly.status === 'resolved' ? 'outline' : 'destructive'}>
                          {anomaly.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No anomalies found</h3>
                    <p className="text-muted-foreground">
                      Try changing your filters to see more results
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="high" className="space-y-4 mt-0">
                {/* Same content structure as "all" tab */}
                {/* This will be automatically filtered by our filteredAnomalies logic */}
              </TabsContent>
              
              <TabsContent value="unresolved" className="space-y-4 mt-0">
                {/* Same content structure as "all" tab */}
                {/* This will be automatically filtered by our filteredAnomalies logic */}
              </TabsContent>
              
              <TabsContent value="resolved" className="space-y-4 mt-0">
                {/* Same content structure as "all" tab */}
                {/* This will be automatically filtered by our filteredAnomalies logic */}
              </TabsContent>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View All Anomalies</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnomalySection;
