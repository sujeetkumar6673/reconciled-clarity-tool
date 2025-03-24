
import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';
import { AnomalyItem } from '@/types/anomaly';

interface AnomalyContextType {
  anomalyStats: {
    totalAnomalies: number;
    totalImpact: number;
    resolvedCount: number;
    totalCount: number;
  };
  anomalyData: AnomalyItem[];
  insightsData: AnomalyItem[];
  updateAnomalyStats: (count: number, impact: number) => void;
  updateAnomalyData: (data: AnomalyItem[]) => void;
  updateInsightsData: (data: AnomalyItem[]) => void;
  refreshStats: () => void;
}

const defaultContext: AnomalyContextType = {
  anomalyStats: {
    totalAnomalies: 0,
    totalImpact: 0,
    resolvedCount: 0,
    totalCount: 0
  },
  anomalyData: [],
  insightsData: [],
  updateAnomalyStats: () => {},
  updateAnomalyData: () => {},
  updateInsightsData: () => {},
  refreshStats: () => {}
};

const AnomalyContext = createContext<AnomalyContextType>(defaultContext);

export const useAnomalyContext = () => useContext(AnomalyContext);

export const AnomalyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [anomalyStats, setAnomalyStats] = useState({
    totalAnomalies: 0,
    totalImpact: 0,
    resolvedCount: 0,
    totalCount: 0
  });
  const [anomalyData, setAnomalyData] = useState<AnomalyItem[]>([]);
  const [insightsData, setInsightsData] = useState<AnomalyItem[]>([]);
  
  // Use refs to track previous values and prevent redundant updates
  const prevStatsRef = useRef({ count: 0, impact: 0 });
  const prevDataRef = useRef({ dataLength: 0, insightsLength: 0 });

  // Update stats
  const updateAnomalyStats = useCallback((count: number, impact: number) => {
    // Skip update if values haven't changed
    if (prevStatsRef.current.count === count && prevStatsRef.current.impact === impact) {
      console.log('AnomalyContext - Skipping redundant update:', { count, impact });
      return;
    }
    
    console.log('AnomalyContext - Updating stats:', { count, impact });
    setAnomalyStats(prev => ({
      ...prev,
      totalAnomalies: count,
      totalImpact: impact,
      totalCount: Math.max(count, prev.totalCount)
    }));
    
    // Update ref with new values
    prevStatsRef.current = { count, impact };
  }, []);

  // Update anomaly data
  const updateAnomalyData = useCallback((data: AnomalyItem[]) => {
    // Skip update if data is empty or hasn't changed in length
    if (data.length === 0 || (data.length === prevDataRef.current.dataLength && data.length === anomalyData.length)) {
      console.log('AnomalyContext - Skipping redundant data update:', { count: data.length });
      return;
    }
    
    console.log('AnomalyContext - Updating data:', { count: data.length });
    setAnomalyData(data);
    
    // Update resolved count based on new data
    const resolvedCount = data.filter(item => item.status === 'resolved').length;
    setAnomalyStats(prev => ({
      ...prev,
      resolvedCount,
      totalCount: Math.max(data.length, prev.totalCount)
    }));
    
    // Update ref with new data length
    prevDataRef.current = { ...prevDataRef.current, dataLength: data.length };
  }, [anomalyData.length]);
  
  // Update insights data
  const updateInsightsData = useCallback((data: AnomalyItem[]) => {
    // Skip update if data is empty or hasn't changed in length
    if (data.length === 0 || (data.length === prevDataRef.current.insightsLength && data.length === insightsData.length)) {
      console.log('AnomalyContext - Skipping redundant insights update:', { count: data.length });
      return;
    }
    
    console.log('AnomalyContext - Updating insights data:', { count: data.length });
    setInsightsData(data);
    
    // If there's no anomaly data yet, use the insights data to populate it
    if (anomalyData.length === 0 && data.length > 0) {
      console.log('AnomalyContext - Also updating anomaly data from insights:', { count: data.length });
      setAnomalyData(data);
      
      // Update resolved count based on new data
      const resolvedCount = data.filter(item => item.status === 'resolved').length;
      setAnomalyStats(prev => ({
        ...prev,
        resolvedCount,
        totalCount: Math.max(data.length, prev.totalCount)
      }));
      
      // Update data length ref
      prevDataRef.current = { ...prevDataRef.current, dataLength: data.length };
    }
    
    // Update insights length ref
    prevDataRef.current = { ...prevDataRef.current, insightsLength: data.length };
  }, [anomalyData.length, insightsData.length]);

  // Force refresh of stats - called when refresh button clicked
  const refreshStats = useCallback(() => {
    console.log('AnomalyContext - Forcing refresh of stats');
    
    // This triggers a re-render in components consuming the context
    // by creating a shallow copy of the stats object
    setAnomalyStats(prev => ({ ...prev }));
    
    // Also force re-render of the data arrays to ensure components update
    if (anomalyData.length > 0) {
      console.log('AnomalyContext - Refreshing anomaly data');
      setAnomalyData(prev => [...prev]);
    }
    
    if (insightsData.length > 0) {
      console.log('AnomalyContext - Refreshing insights data');
      setInsightsData(prev => [...prev]);
    }
  }, [anomalyData.length, insightsData.length]);

  return (
    <AnomalyContext.Provider value={{
      anomalyStats,
      anomalyData,
      insightsData,
      updateAnomalyStats,
      updateAnomalyData,
      updateInsightsData,
      refreshStats
    }}>
      {children}
    </AnomalyContext.Provider>
  );
};
