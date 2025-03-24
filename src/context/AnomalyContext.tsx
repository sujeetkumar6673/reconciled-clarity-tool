
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
  
  // Use a ref to track previous values and prevent redundant updates
  const prevStatsRef = useRef({ count: 0, impact: 0 });

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
    console.log('AnomalyContext - Updating data:', { count: data.length });
    setAnomalyData(data);
    
    // Update resolved count based on new data
    const resolvedCount = data.filter(item => item.status === 'resolved').length;
    setAnomalyStats(prev => ({
      ...prev,
      resolvedCount,
      totalCount: Math.max(data.length, prev.totalCount)
    }));
  }, []);
  
  // Update insights data
  const updateInsightsData = useCallback((data: AnomalyItem[]) => {
    console.log('AnomalyContext - Updating insights data:', { count: data.length });
    if (data.length > 0) {
      setInsightsData(data);
    }
  }, []);

  // Force refresh of stats - called when refresh button clicked
  const refreshStats = useCallback(() => {
    console.log('AnomalyContext - Forcing refresh of stats');
    // This triggers a re-render in components consuming the context
    setAnomalyStats(prev => ({ ...prev }));
  }, []);

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
