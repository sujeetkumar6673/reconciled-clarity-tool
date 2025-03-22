
import React, { useState, useCallback } from 'react';
import { UploadCloud, FileUp, History, File, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { parseCSV, DynamicColumnData } from '@/lib/csv-parser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  onDataProcessed?: (data: DynamicColumnData[], headers: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dataType, setDataType] = useState<'current' | 'historical'>('current');

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      return fileType === 'csv' || fileType === 'xlsx' || fileType === 'xls';
    });
    
    if (validFiles.length === 0) {
      toast.error('Please upload CSV or Excel files only');
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);

    try {
      const allData: DynamicColumnData[] = [];
      let allHeaders: string[] = [];
      
      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.csv')) {
          const text = await file.text();
          
          const firstLine = text.split('\n')[0];
          const headers = firstLine.split(',').map(h => h.trim());
          
          allHeaders = [...new Set([...allHeaders, ...headers])];
          
          const parsedData = parseCSV(text, file.name, dataType);
          allData.push(...parsedData);
        }
      }

      if (allData.length === 0) {
        toast.warning('No valid data found in the uploaded files');
      } else {
        if (onDataProcessed) {
          onDataProcessed(allData, allHeaders);
        }
        toast.success(`Successfully processed ${allData.length} ${dataType} data records`);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files. Please check file format.');
    } finally {
      setIsUploading(false);
      setFiles([]);
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

  const renderUploadArea = () => (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center",
        isDragging 
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
          : "border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-700"
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center transition-all",
          isDragging ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"
        )}>
          <UploadCloud 
            className={cn(
              "h-8 w-8 transition-all",
              isDragging ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
            )} 
          />
        </div>
        <div className="space-y-1">
          <p className="font-medium">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports CSV and Excel files
          </p>
        </div>
        <div className="relative">
          <Button className="relative z-10" onClick={() => document.getElementById(`file-upload-${dataType}`)?.click()}>
            Select Files
          </Button>
          <input
            id={`file-upload-${dataType}`}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            onChange={onFileChange}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">Upload Reconciliation Files</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Choose the data type and upload your CSV or Excel files to start analyzing reconciliation data
        </p>
      </div>

      <Tabs defaultValue="current" onValueChange={(value) => setDataType(value as 'current' | 'historical')} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Current/Realtime Data
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historical Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <div className="space-y-2 mb-4">
            <h3 className="text-lg font-medium">Current/Realtime Data</h3>
            <p className="text-sm text-muted-foreground">
              Upload the most recent data files for reconciliation against your current records.
            </p>
          </div>
          {renderUploadArea()}
        </TabsContent>
        
        <TabsContent value="historical">
          <div className="space-y-2 mb-4">
            <h3 className="text-lg font-medium">Historical Data</h3>
            <p className="text-sm text-muted-foreground">
              Upload past data files for historical analysis and trend identification.
            </p>
          </div>
          {renderUploadArea()}
        </TabsContent>
      </Tabs>

      {files.length > 0 && (
        <div className="mt-8 animate-fade-in">
          <h3 className="text-lg font-medium mb-4">Selected Files ({files.length})</h3>
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
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
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
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Process {dataType === 'current' ? 'Current' : 'Historical'} Files
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
