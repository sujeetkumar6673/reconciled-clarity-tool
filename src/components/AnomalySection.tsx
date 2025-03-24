import { useState, useEffect } from 'react';
import { AlertTriangle, Filter, ArrowUpDown, FileText, DollarSign, Calendar, Clock, Briefcase, Layers, ArrowUp, ArrowDown, RefreshCw, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AnomalySummaryCards from './anomaly/AnomalySummaryCards';
import AnomalyTrendChart from './anomaly/AnomalyTrendChart';
import AnomalyList from './anomaly/AnomalyList';
import { AnomalyItem } from './anomaly/AnomalyCard';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { DynamicColumnData } from '@/lib/csv-parser';

const anomalyData: AnomalyItem[] = [
  { 
    id: 1, 
    title: 'Inconsistent Variations in Outstanding Balances', 
    description: 'Several accounts showing inconsistent variations that exceed the normal threshold',
    severity: 'high',
    category: 'balance',
    date: '2023-05-22',
    impact: '$17,000.00',
    status: 'unresolved',
    bucket: 'Bucket 1: Inconsistent Variations in Outstanding Balances',
    anomalyCount: 17,
    rootCauses: [
      'Data entry errors leading to temporary inconsistencies',
      'Timing differences in recording transactions',
      'Misalignment in reconciliation processes or methodologies'
    ],
    suggestedActions: [
      'Conduct a detailed review of data entry processes to ensure accuracy',
      'Align transaction recording timing between systems',
      'Standardize reconciliation methodologies across departments'
    ],
    sampleRecords: [
      {
        company: 'Doyle Ltd',
        account: '740',
        primaryAccount: 'COMMERCIAL LOANS',
        secondaryAccount: 'INTEREST RECEIVABLE',
        glBalance: 83000,
        iHubBalance: 83000,
        anomalyScore: -0.0121,
        balanceDifference: 0.0
      },
      {
        company: 'Galloway-Wyatt',
        account: '493',
        primaryAccount: 'ALL LOB LOANS',
        secondaryAccount: 'PRINCIPAL',
        glBalance: 22000,
        iHubBalance: 22000,
        anomalyScore: -0.0216,
        balanceDifference: 0.0
      }
    ]
  },
  { 
    id: 2, 
    title: 'No Clear Pattern, Deviation Exceeds Threshold', 
    description: 'Account balances showing deviations that exceed thresholds without clear patterns',
    severity: 'medium',
    category: 'unclassified',
    date: '2023-05-18',
    impact: '$17,000.00',
    status: 'unresolved',
    bucket: 'Bucket 11: No Clear Pattern, but Deviation Exceeds Threshold',
    anomalyCount: 7,
    rootCauses: [
      'Unusual transactions that do not follow historical patterns',
      'Errors in threshold settings or detection algorithms'
    ],
    suggestedActions: [
      'Investigate each case individually to identify unique causes',
      'Review and adjust threshold settings and anomaly detection algorithms'
    ],
    sampleRecords: [
      {
        company: 'Abbott-Munoz',
        account: '327',
        primaryAccount: 'RETAIL LOANS',
        secondaryAccount: 'DEFERRED COSTS',
        glBalance: 88000,
        iHubBalance: 105000,
        anomalyScore: -0.0275,
        balanceDifference: -17000
      }
    ]
  },
  { 
    id: 3, 
    title: 'Consistent Increase/Decrease in Balances', 
    description: 'Systematic trend of increases or decreases in account balances',
    severity: 'high',
    category: 'missing',
    date: '2023-05-15',
    impact: '$9,000.00',
    status: 'unresolved',
    bucket: 'Bucket 2: Consistent Increase or Decrease in Outstanding Balances',
    anomalyCount: 6,
    rootCauses: [
      'Systematic errors in transaction processing',
      'Consistent misreporting or misclassification of transactions'
    ],
    suggestedActions: [
      'Audit transaction processing systems for systematic errors',
      'Implement checks for consistent misreporting or misclassification'
    ],
    sampleRecords: [
      {
        company: 'Mcclain, Miller and Henderson',
        account: '298',
        primaryAccount: 'RETAIL LOANS',
        secondaryAccount: 'INTEREST RECEIVABLE',
        glBalance: 32000,
        iHubBalance: 23000,
        anomalyScore: -0.0190,
        balanceDifference: 9000
      }
    ]
  },
  { 
    id: 4, 
    title: 'Reversal or Correction Entry Detected', 
    description: 'Evidence of reversal or correction entries that require validation',
    severity: 'low',
    category: 'timing',
    date: '2023-05-10',
    impact: '$11,000.00',
    status: 'resolved',
    bucket: 'Bucket 8: Reversal or Correction Entry Detected',
    anomalyCount: 3,
    rootCauses: [
      'Reversal entries made to correct prior errors',
      'Adjustments not properly documented or communicated'
    ],
    suggestedActions: [
      'Ensure all reversal and correction entries are properly documented',
      'Enhance communication protocols for adjustments'
    ],
    sampleRecords: [
      {
        company: 'Guzman, Hoffman and Baldwin',
        account: '365',
        primaryAccount: 'COMMERCIAL LOANS',
        secondaryAccount: 'DEFERRED COSTS',
        glBalance: 82000,
        iHubBalance: 93000,
        anomalyScore: -0.0730,
        balanceDifference: -11000
      }
    ]
  },
  { 
    id: 5, 
    title: 'Balances Not in Line with Previous Months', 
    description: 'Account balances showing unexpected deviations from historical patterns',
    severity: 'medium',
    category: 'unclassified',
    date: '2023-05-12',
    impact: '$1,532.80',
    status: 'unresolved',
    bucket: 'Bucket 4: Outstanding Balances Not in Line with Previous Months',
    anomalyCount: 3,
    rootCauses: [
      'Seasonal fluctuations not accounted for in analysis',
      'Changes in business operations or external factors'
    ],
    suggestedActions: [
      'Incorporate seasonal adjustments into analysis',
      'Investigate changes in business operations or external factors impacting balances'
    ]
  },
];

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
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [displayData, setDisplayData] = useState<AnomalyItem[]>([]);

  const { 
    totalAnomaliesCount, 
    totalImpactValue,
    detectAnomalies
  } = useAnomalyDetection({
    onAnomalyDataReceived: (data, headers) => {
      const transformedData: AnomalyItem[] = data.map((item: DynamicColumnData, index) => {
        return {
          id: Number(item.id?.replace('anomaly-', '')) || index,
          title: item.title as string || `Anomaly ${index + 1}`,
          description: item.description as string || 'No description available',
          severity: item.severity as string || 'medium',
          category: item.category as string || 'unclassified',
          date: item.date as string || new Date().toISOString().split('T')[0],
          impact: item.impact as string || '$0.00',
          status: item.status as string || 'unresolved',
          bucket: item.bucket as string,
          anomalyCount: typeof item.anomalyCount === 'number' 
            ? item.anomalyCount 
            : typeof item.anomalyCount === 'string' 
              ? parseInt(item.anomalyCount, 10) 
              : undefined,
          rootCauses: Array.isArray(item.rootCauses) 
            ? item.rootCauses as string[] 
            : undefined,
          suggestedActions: Array.isArray(item.suggestedActions) 
            ? item.suggestedActions as string[] 
            : undefined,
          sampleRecords: Array.isArray(item.sampleRecords) 
            ? item.sampleRecords 
            : undefined,
        };
      });
      
      setDisplayData(transformedData);
    }
  });

  const anomaliesData = displayData.length > 0 ? displayData : anomalyData;

  const uniqueBuckets = Array.from(
    new Set(anomaliesData.map(a => a.bucket?.split(':')[0]).filter(Boolean))
  );

  const filteredAnomalies = anomaliesData.filter(anomaly => {
    if (selectedTab === 'high' && anomaly.severity !== 'high') return false;
    if (selectedTab === 'resolved' && anomaly.status !== 'resolved') return false;
    if (selectedTab === 'unresolved' && anomaly.status !== 'unresolved') return false;
    if (selectedCategory && anomaly.category !== selectedCategory) return false;
    if (selectedBucket && (!anomaly.bucket || !anomaly.bucket.startsWith(selectedBucket))) return false;
    return true;
  });

  const resolvedCount = anomaliesData.filter(a => a.status === 'resolved').length;
  
  const formattedTotalImpact = typeof totalImpactValue === 'number' 
    ? `$${Math.abs(totalImpactValue).toLocaleString()}`
    : '$0.00';
  
  const resolutionRate = anomaliesData.length > 0 
    ? `${Math.round((resolvedCount / anomaliesData.length) * 100)}%` 
    : '0%';

  useEffect(() => {
    console.log('AnomalySection - totalAnomaliesCount:', totalAnomaliesCount);
    console.log('AnomalySection - totalImpactValue:', totalImpactValue);
    console.log('Values for AnomalySummaryCards:', {
      totalAnomalies: totalAnomaliesCount,
      formattedTotalImpact,
      resolutionRate,
      resolvedCount,
      totalCount: anomaliesData.length
    });
  }, [totalAnomaliesCount, totalImpactValue, formattedTotalImpact, resolutionRate, resolvedCount, anomaliesData.length]);

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

  const getBucketIcon = (bucket: string) => {
    if (bucket.includes('Bucket 1')) return <Layers className="h-4 w-4" />;
    if (bucket.includes('Bucket 2')) return <ArrowDown className="h-4 w-4" />;
    if (bucket.includes('Bucket 4')) return <Calendar className="h-4 w-4" />;
    if (bucket.includes('Bucket 5')) return <ArrowUp className="h-4 w-4" />;
    if (bucket.includes('Bucket 8')) return <RefreshCw className="h-4 w-4" />;
    if (bucket.includes('Bucket 11')) return <PieChart className="h-4 w-4" />;
    return <Briefcase className="h-4 w-4" />;
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
        <h2 className="text-2xl font-medium text-center mb-2">AI-Enhanced Anomaly Detection</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Identify and resolve reconciliation anomalies and discrepancies with AI-powered insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnomalySummaryCards 
          totalAnomalies={totalAnomaliesCount || 0}
          totalImpact={formattedTotalImpact}
          resolutionRate={resolutionRate}
          resolvedCount={resolvedCount}
          totalCount={anomaliesData.length}
        />

        <AnomalyTrendChart chartData={chartData} />

        <div className="lg:col-span-2 animate-fade-in animate-delay-200">
          <Card className="glass-card h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anomaly Insights</CardTitle>
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
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="text-xs font-medium text-muted-foreground mr-1 mt-1">Categories:</div>
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
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="text-xs font-medium text-muted-foreground mr-1 mt-1">AI Buckets:</div>
                  {uniqueBuckets.map(bucket => (
                    <Badge
                      key={bucket}
                      variant={selectedBucket === bucket ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => 
                        setSelectedBucket(selectedBucket === bucket ? null : bucket)
                      }
                    >
                      {getBucketIcon(bucket as string)}
                      <span className="ml-1">{bucket}</span>
                    </Badge>
                  ))}
                </div>
                
                <TabsContent value="all" className="space-y-4 mt-2">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="high" className="space-y-4 mt-2">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="unresolved" className="space-y-4 mt-2">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="resolved" className="space-y-4 mt-2">
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
              <Button className="w-full">Export Anomaly Insights</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnomalySection;
