import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowDown, Brain } from 'lucide-react';
import { SingleFileUpload } from '@/components/upload/SingleFileUpload';
import { DynamicColumnData } from '@/lib/csv-parser';
import DynamicTable from '@/components/DynamicTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RuleSuggestionsPanel from '@/components/insights/RuleSuggestionsPanel';
import { useAnomalyContext } from '@/context/AnomalyContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/utils/apiUtils';

interface RuleSuggestion {
  id?: number;
  TRADEID?: number;
  MatchStatus?: string;
  RootCause?: string;
  SuggestedAction?: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
}

const SplitFileAnalysis = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [file1Data, setFile1Data] = useState<DynamicColumnData[]>([]);
  const [file2Data, setFile2Data] = useState<DynamicColumnData[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [uploadedFilename, setUploadedFilename] = useState<string>('');
  const [ruleSuggestions, setRuleSuggestions] = useState<RuleSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { updateAnomalyStats } = useAnomalyContext();

  const handleFileSplitComplete = (
    file1Data: DynamicColumnData[],
    file2Data: DynamicColumnData[],
    headers: string[],
    actions: any[],
    filename: string
  ) => {
    setFile1Data(file1Data);
    setFile2Data(file2Data);
    setTableHeaders(headers);
    setUploadedFilename(filename);
    setShowTable(true);
    
    const anomalyCount = file1Data.length;
    const impact = file1Data.reduce((sum, item) => {
      const impactValue = typeof item.impact === 'number' ? item.impact : 
                          typeof item.impact === 'string' ? parseFloat(item.impact) : 0;
      return sum + (isNaN(impactValue) ? 0 : impactValue);
    }, 0);
    
    updateAnomalyStats(anomalyCount, impact);
    
    toast.success(`File successfully processed. Found ${anomalyCount} anomalies.`);
    
    setTimeout(() => {
      document.getElementById('split-data')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGetRuleSuggestions = async () => {
    if (!uploadedFilename) {
      toast.error('Please upload a file first before getting recommendations');
      return;
    }

    setIsLoadingSuggestions(true);
    const toastId = toast.loading('Generating AI recommendations...');

    try {
      const response = await fetch(`${API_BASE_URL}/rule-suggestions?filename=${encodeURIComponent(uploadedFilename)}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        const suggestions: RuleSuggestion[] = result.data;
        setRuleSuggestions(suggestions);
        toast.success('Recommendations generated successfully', { id: toastId });
        
        setTimeout(() => {
          document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        toast.error('Invalid recommendations data received from server', { id: toastId });
      }
    } catch (error) {
      console.error('Error fetching rule suggestions:', error);
      toast.error(`Error getting recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
      
      const fallbackSuggestions: RuleSuggestion[] = [
        {
          TRADEID: 68911236,
          MatchStatus: 'Quantity_Break',
          RootCause: 'Quantity mismatch: Catalyst=119966816, Impact=119966813',
          SuggestedAction: 'Investigate booking differences and update lower quantity.'
        },
        {
          TRADEID: 69014525,
          MatchStatus: 'Price_Break',
          RootCause: 'Price mismatch: Catalyst=98.8512, Impact=98.85',
          SuggestedAction: 'Price difference due to rounding. Acceptable.'
        },
        {
          TRADEID: 69145541,
          MatchStatus: 'Catalyst_Only',
          RootCause: 'Trade exists in Catalyst but missing in Impact.',
          SuggestedAction: 'Check if trade ingestion failed in Impact. Trigger sync.'
        }
      ];
      
      setRuleSuggestions(fallbackSuggestions);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      
      <section className="pt-32 pb-20 px-4 relative">
        <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 transform translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              Pre-Analyzed File Processing
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Catalyst vs Impact Reconciliation
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Process pre-analyzed files with anomalies and take action
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 py-6 rounded-full text-lg" onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}>
              Upload File
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 rounded-full text-lg" asChild>
              <Link to="/">Go to GL vs iHub Reconciliation</Link>
            </Button>
          </div>

          <div className="mt-24 animate-bounce">
            <a href="#upload" className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all">
              <ArrowDown className="h-6 w-6 text-blue-500" />
            </a>
          </div>
        </div>
      </section>
      
      <section id="upload" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <SingleFileUpload onFileSplitComplete={handleFileSplitComplete} />
        </div>
      </section>
      
      {showTable && (
        <>
          <section id="split-data" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-6xl mx-auto animate-fade-in-up">
              <div className="flex justify-center mb-8">
                <Button 
                  className="px-8 text-lg"
                  onClick={handleGetRuleSuggestions}
                  disabled={isLoadingSuggestions}
                  size="lg"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  {isLoadingSuggestions ? 'Getting Recommendations...' : 'Get AI Recommendations'}
                </Button>
              </div>
            </div>
          </section>

          <section id="recommendations" className="py-20 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <h2 className="text-2xl font-medium text-center mb-8">AI-Powered Recommendations</h2>
              <RuleSuggestionsPanel 
                suggestions={ruleSuggestions} 
                isLoading={isLoadingSuggestions} 
              />
            </div>
          </section>
          
          <section id="tables" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-6xl mx-auto animate-fade-in-up">
              <h2 className="text-2xl font-medium text-center mb-8">Reconciliation Data</h2>
              
              <Tabs defaultValue="file1" className="w-full">
                <div className="flex justify-center mb-6">
                  <TabsList>
                    <TabsTrigger value="file1" className="px-6">Catalyst Data</TabsTrigger>
                    <TabsTrigger value="file2" className="px-6">Impact Data</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="file1">
                  <h3 className="text-xl font-medium text-center mb-6">Catalyst Data</h3>
                  {file1Data.length > 0 ? (
                    <DynamicTable data={file1Data} headers={tableHeaders} />
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <h3 className="text-xl font-medium mb-2">No Catalyst Data Available</h3>
                      <p className="text-muted-foreground max-w-xl mx-auto mb-4">
                        The first split file does not contain any Catalyst data.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="file2">
                  <h3 className="text-xl font-medium text-center mb-6">Impact Data</h3>
                  {file2Data.length > 0 ? (
                    <DynamicTable data={file2Data} headers={tableHeaders} />
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <h3 className="text-xl font-medium mb-2">No Impact Data Available</h3>
                      <p className="text-muted-foreground max-w-xl mx-auto mb-4">
                        The second split file does not contain any Impact data.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </>
      )}
      
      {!showTable && (
        <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4">No Data Yet</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Upload your CSV file in the section above to view the data.
            </p>
            <Button onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}>
              Go to Upload Section
            </Button>
          </div>
        </section>
      )}
      
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Smart-Recon
              </span>
              <p className="mt-2 text-gray-400 text-sm">
                Smarter Reconciliation and Anomaly Detection using Gen AI
              </p>
            </div>
            <div className="flex space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/split-file-analysis" className="text-gray-300 hover:text-white transition-colors">Catalyst vs Impact</Link>
              <Link to="/learn-more" className="text-gray-300 hover:text-white transition-colors">Learn More</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Smart-Recon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SplitFileAnalysis;
