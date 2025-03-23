
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { parseCSV, DynamicColumnData } from '@/lib/csv-parser';

// API base URL configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// Timeout configuration for large file uploads (3 minutes)
const UPLOAD_TIMEOUT = 180000;

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
    
    // Check file size warning
    validFiles.forEach(file => {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 50) {
        toast.warning(`Large file detected: ${file.name} (${fileSizeInMB.toFixed(2)} MB). Processing may take longer.`);
      }
    });
    
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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);
    
    try {
      console.log(`Uploading file ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) to ${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Recommended for large file uploads
        headers: {
          // Don't set content-type header, it will be set automatically with boundary
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        console.error(`Error sending data to ${endpoint}:`, errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log(`Successfully sent data to ${endpoint}:`, result);
      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error(`Request timeout for ${file.name}`);
        throw new Error(`Upload timeout for ${file.name}. The file may be too large or the server is unresponsive.`);
      }
      
      console.error(`API error with ${endpoint}:`, error);
      // Check if the error is a network error (like CORS, server down, etc.)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Network error: Cannot connect to the server at ${API_BASE_URL}. Please check if the API server is running.`);
      }
      
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
            // Show file processing notification
            const fileToastId = toast.loading(`Processing ${file.name}...`);
            
            // Using a try-catch block specifically for the API call
            try {
              // Send the file to the backend API
              await uploadFileToAPI(file, '/upload/realtime');
              toast.success(`Server upload successful: ${file.name}`, { id: fileToastId });
            } catch (uploadError) {
              toast.error(`Server upload failed: ${uploadError.message}`, { id: fileToastId });
              console.error('Error uploading to API:', uploadError);
              
              // Continue with local parsing even if API upload fails
              toast.loading(`Attempting local parsing of ${file.name}...`, { id: fileToastId });
            }
            
            // Proceed with local parsing for the UI regardless of API success
            const text = await file.text();
            const firstLine = text.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.trim());
            allHeaders = [...new Set([...allHeaders, ...headers])];
            const parsedData = parseCSV(text, file.name, 'current');
            currentData.push(...parsedData);
            
            toast.success(`Parsed ${parsedData.length} records from ${file.name}`, { id: fileToastId });
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
            // Show file processing notification
            const fileToastId = toast.loading(`Processing ${file.name}...`);
            
            // Using a try-catch block specifically for the API call
            try {
              // Send the file to the backend API
              await uploadFileToAPI(file, '/upload/historical');
              toast.success(`Server upload successful: ${file.name}`, { id: fileToastId });
            } catch (uploadError) {
              toast.error(`Server upload failed: ${uploadError.message}`, { id: fileToastId });
              console.error('Error uploading to API:', uploadError);
              
              // Continue with local parsing even if API upload fails
              toast.loading(`Attempting local parsing of ${file.name}...`, { id: fileToastId });
            }
            
            // Proceed with local parsing for the UI regardless of API success
            const text = await file.text();
            const firstLine = text.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.trim());
            allHeaders = [...new Set([...allHeaders, ...headers])];
            const parsedData = parseCSV(text, file.name, 'historical');
            historicalData.push(...parsedData);
            
            toast.success(`Parsed ${parsedData.length} records from ${file.name}`, { id: fileToastId });
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
