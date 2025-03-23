
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { DynamicColumnData } from '@/lib/csv-parser';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { Progress } from '@/components/ui/progress';

interface AnomalyDetectionButtonProps {
  onAnomalyDataReceived?: (data: DynamicColumnData[], headers: string[]) => void;
}

const AnomalyDetectionButton: React.FC<AnomalyDetectionButtonProps> = ({ onAnomalyDataReceived }) => {
  const { 
    isDetecting, 
    resultFile, 
    detectAnomalies, 
    downloadFile,
    progress
  } = useAnomalyDetection({ onAnomalyDataReceived });

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={detectAnomalies}
        disabled={isDetecting}
        size="lg"
        className="bg-amber-600 hover:bg-amber-700"
      >
        {isDetecting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Detecting Anomalies...
          </>
        ) : (
          <>
            <AlertTriangle className="mr-2 h-5 w-5" />
            Detect Anomalies
          </>
        )}
      </Button>
      
      {isDetecting && (
        <div className="w-full max-w-md mt-2 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium">Detecting anomalies using GenAI...</span>
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {resultFile && (
        <Button 
          onClick={downloadFile}
          variant="outline"
          className="mt-2"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Results
        </Button>
      )}
    </div>
  );
};

export default AnomalyDetectionButton;
