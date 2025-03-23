
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { parseCSV, DynamicColumnData } from '@/lib/csv-parser';

// API base URL configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

interface FileUploadContextType {
  currentFiles: File[];
  historicalFiles: File[];
  isUploading: boolean;
  step: 'current' | 'historical' | 'both';
  addFiles: (files: File[], type: 'current' | 'historical') => void;
  removeFile: (index: number, type: 'current' | 'historical') => void;
  processFiles: () => Promise<void>;
}

interface FileUploadProviderProps {
  children: React.ReactNode;
  onDataProcessed?: (currentData: DynamicColumnData[], historicalData: DynamicColumnData[], headers: string[]) => void;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

export const FileUploadProvider: React.FC<FileUploadProviderProps> = ({ children, onDataProcessed }) => {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [historicalFiles, setHistoricalFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'current' | 'historical' | 'both'>('current');

  const addFiles = (files: File[], fileType: 'current' | 'historical') => {
    const validFiles = files.filter(file => {
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

  const uploadFileToAPI = async (file: File, endpoint: string): Promise<boolean> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error sending data to ${endpoint}:`, errorData);
        throw new Error(errorData.detail || 'Unknown error occurred');
      }
      
      const result = await response.json();
      console.log(`Successfully sent data to ${endpoint}:`, result);
      return true;
    } catch (error) {
      console.error(`API error with ${endpoint}:`, error);
      throw error;
    }
  };

  const processFiles = async () => {
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
          try {
            // Send the file to the backend API
            await uploadFileToAPI(file, '/upload/realtime');
            
            // Also parse locally for the UI
            const text = await file.text();
            const firstLine = text.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.trim());
            allHeaders = [...new Set([...allHeaders, ...headers])];
            const parsedData = parseCSV(text, file.name, 'current');
            currentData.push(...parsedData);
          } catch (error) {
            console.error('Error processing current file:', error);
            toast.error(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      // Process historical files
      for (const file of historicalFiles) {
        if (file.name.toLowerCase().endsWith('.csv')) {
          try {
            // Send the file to the backend API
            await uploadFileToAPI(file, '/upload/historical');
            
            // Also parse locally for the UI
            const text = await file.text();
            const firstLine = text.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.trim());
            allHeaders = [...new Set([...allHeaders, ...headers])];
            const parsedData = parseCSV(text, file.name, 'historical');
            historicalData.push(...parsedData);
          } catch (error) {
            console.error('Error processing historical file:', error);
            toast.error(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
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

  const value = {
    currentFiles,
    historicalFiles,
    isUploading,
    step,
    addFiles,
    removeFile,
    processFiles
  };

  return (
    <FileUploadContext.Provider value={value}>
      {children}
    </FileUploadContext.Provider>
  );
};

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (context === undefined) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
};
