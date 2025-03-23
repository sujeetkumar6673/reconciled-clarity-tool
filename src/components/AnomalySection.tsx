
import { useState } from 'react';
import { AlertTriangle, Filter, ArrowUpDown, FileText, DollarSign, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AnomalySummaryCards from './anomaly/AnomalySummaryCards';
import AnomalyTrendChart from './anomaly/AnomalyTrendChart';
import AnomalyList from './anomaly/AnomalyList';
import { AnomalyItem } from './anomaly/AnomalyCard';

// Mock data for anomalies
const anomalyData: AnomalyItem[] = [
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

  // Calculate summary data
  const resolvedCount = anomalyData.filter(a => a.status === 'resolved').length;
  const totalImpact = '$4,447.30';
  const resolutionRate = '20%';

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
        <AnomalySummaryCards 
          totalAnomalies={anomalyData.length}
          totalImpact={totalImpact}
          resolutionRate={resolutionRate}
          resolvedCount={resolvedCount}
          totalCount={anomalyData.length}
        />

        {/* Left column - Anomaly Chart */}
        <AnomalyTrendChart chartData={chartData} />

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
                
                <TabsContent value="all" className="space-y-4 mt-0">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="high" className="space-y-4 mt-0">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="unresolved" className="space-y-4 mt-0">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="resolved" className="space-y-4 mt-0">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent>
              {/* Content moved to TabsContent components */}
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
