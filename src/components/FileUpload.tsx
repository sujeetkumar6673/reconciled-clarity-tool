
import React, { useState } from 'react';
import { FileUp, History, File, XCircle, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { parseCSV, DynamicColumnData } from '@/lib/csv-parser';

export interface ReconciliationData {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'Reconciled' | 'Pending' | 'Unmatched';
  source: string;
}

interface FileUploadProps {
  onDataProcessed?: (currentData: DynamicColumnData[], historicalData: DynamicColumnData[], headers: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataProcessed }) => {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [historicalFiles, setHistoricalFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'current' | 'historical' | 'both'>('current');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'current' | 'historical') => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => {
        const fileType = file.name.split('.').pop()?.toLowerCase();
        return fileType === 'csv' || fileType === 'xlsx' || fileType === 'xls';
      });
      
      if (validFiles.length === 0) {
        toast.error('Please upload CSV or Excel files only');
        return;
      }
      
      if (fileType === 'current') {
        setCurrentFiles(prev => [...prev, ...validFiles]);
        setStep('historical');
      } else {
        setHistoricalFiles(prev => [...prev, ...validFiles]);
        setStep('both');
      }
    }
  };

  const removeFile = (index: number, fileType: 'current' | 'historical') => {
    if (fileType === 'current') {
      setCurrentFiles(prev => prev.filter((_, i) => i !== index));
      if (currentFiles.length === 1) {
        setStep('current');
      }
    } else {
      setHistoricalFiles(prev => prev.filter((_, i) => i !== index));
      if (historicalFiles.length === 1) {
        setStep('historical');
      }
    }
  };

  const handleUpload = async () => {
    if (currentFiles.length === 0 && historicalFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);

    try {
      const currentData: DynamicColumnData[] = [];
      const historicalData: DynamicColumnData[] = [];
      let allHeaders: string[] = [];
      
      // Process current files
      for (const file of currentFiles) {
        if (file.name.toLowerCase().endsWith('.csv')) {
          const text = await file.text();
          
          const firstLine = text.split('\n')[0];
          const headers = firstLine.split(',').map(h => h.trim());
          
          allHeaders = [...new Set([...allHeaders, ...headers])];
          
          const parsedData = parseCSV(text, file.name, 'current');
          currentData.push(...parsedData);
        }
      }
      
      // Process historical files
      for (const file of historicalFiles) {
        if (file.name.toLowerCase().endsWith('.csv')) {
          const text = await file.text();
          
          const firstLine = text.split('\n')[0];
          const headers = firstLine.split(',').map(h => h.trim());
          
          allHeaders = [...new Set([...allHeaders, ...headers])];
          
          const parsedData = parseCSV(text, file.name, 'historical');
          historicalData.push(...parsedData);
        }
      }

      // Call APIs to process the data
      if (currentData.length > 0) {
        try {
          const realtimeResponse = await fetch('/upload/realtime', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: currentData })
          });
          
          if (!realtimeResponse.ok) {
            console.error('Error sending realtime data to API');
          } else {
            console.log('Successfully sent realtime data to API');
          }
        } catch (error) {
          console.error('API error:', error);
          toast.error('Error sending realtime data to API. Processing locally only.');
        }
      }

      if (historicalData.length > 0) {
        try {
          const historicalResponse = await fetch('/upload/historical', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: historicalData })
          });
          
          if (!historicalResponse.ok) {
            console.error('Error sending historical data to API');
          } else {
            console.log('Successfully sent historical data to API');
          }
        } catch (error) {
          console.error('API error:', error);
          toast.error('Error sending historical data to API. Processing locally only.');
        }
      }

      if (currentData.length === 0 && historicalData.length === 0) {
        toast.warning('No valid data found in the uploaded files');
      } else {
        if (onDataProcessed) {
          onDataProcessed(currentData, historicalData, allHeaders);
        }
        
        const totalRecords = currentData.length + historicalData.length;
        toast.success(`Successfully processed ${totalRecords} records (${currentData.length} current, ${historicalData.length} historical)`);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files. Please check file format.');
    } finally {
      setIsUploading(false);
      setCurrentFiles([]);
      setHistoricalFiles([]);
      setStep('current');
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return <File className="h-5 w-5 text-green-500" />;
      case 'xlsx':
      case 'xls':
        return <File className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderUploadButton = (type: 'current' | 'historical', disabled: boolean = false) => (
    <div className={cn(
      "flex flex-col items-center p-8 border rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-all",
      disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
    )}>
      <div className={cn(
        "h-16 w-16 rounded-full flex items-center justify-center mb-4",
        type === 'current' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-purple-100 dark:bg-purple-900/30"
      )}>
        {type === 'current' ? (
          <FileUp className="h-8 w-8 text-blue-500" />
        ) : (
          <History className="h-8 w-8 text-purple-500" />
        )}
      </div>
      <h3 className="text-xl font-medium mb-2">
        {type === 'current' ? 'Current/Realtime Data' : 'Historical Data'}
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {type === 'current' 
          ? 'Upload the most recent data files for reconciliation' 
          : 'Upload past data files for historical analysis'}
      </p>
      <Button 
        size="lg" 
        onClick={() => {
          document.getElementById(`file-upload-${type}`)?.click();
        }}
        disabled={disabled}
        className={cn(
          "w-full",
          type === 'current' 
            ? "bg-blue-500 hover:bg-blue-600" 
            : "bg-purple-500 hover:bg-purple-600"
        )}
      >
        Select Files
      </Button>
      <input
        id={`file-upload-${type}`}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls"
        className="sr-only"
        onChange={(e) => onFileChange(e, type)}
      />
    </div>
  );

  const renderSelectedFiles = (files: File[], type: 'current' | 'historical') => {
    if (files.length === 0) return null;
    
    return (
      <div className="mt-6 animate-fade-in">
        <h3 className="text-lg font-medium mb-4">
          {type === 'current' ? 'Selected Current Files' : 'Selected Historical Files'} ({files.length})
        </h3>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-4 mb-4">
          <ul className="divide-y dark:divide-gray-800">
            {files.map((file, index) => (
              <li key={index} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  {getFileIcon(file.name)}
                  <span className="ml-3 text-sm font-medium">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index, type)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">Upload Reconciliation Files</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Upload both current and historical data files to start analyzing reconciliation data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {renderUploadButton('current', false)}
        {renderUploadButton('historical', step === 'current' && currentFiles.length === 0)}
      </div>

      {renderSelectedFiles(currentFiles, 'current')}
      {renderSelectedFiles(historicalFiles, 'historical')}

      {(currentFiles.length > 0 || historicalFiles.length > 0) && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="px-6"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Server className="mr-2 h-4 w-4" />
                Process All Files
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
