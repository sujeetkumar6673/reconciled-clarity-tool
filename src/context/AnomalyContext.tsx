
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnomalyItem } from '@/types/anomaly';

interface AnomalyContextType {
  anomalyStats: {
    totalAnomalies: number;
    totalImpact: number;
    resolvedCount: number;
    totalCount: number;
  };
  anomalyData: AnomalyItem[];
  updateAnomalyStats: (count: number, impact: number) => void;
  updateAnomalyData: (data: AnomalyItem[]) => void;
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
  updateAnomalyStats: () => {},
  updateAnomalyData: () => {},
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

  // Update stats
  const updateAnomalyStats = (count: number, impact: number) => {
    console.log('AnomalyContext - Updating stats:', { count, impact });
    setAnomalyStats(prev => ({
      ...prev,
      totalAnomalies: count,
      totalImpact: impact,
      totalCount: Math.max(count, prev.totalCount)
    }));
  };

  // Update anomaly data
  const updateAnomalyData = (data: AnomalyItem[]) => {
    console.log('AnomalyContext - Updating data:', { count: data.length });
    setAnomalyData(data);
    
    // Update resolved count based on new data
    const resolvedCount = data.filter(item => item.status === 'resolved').length;
    setAnomalyStats(prev => ({
      ...prev,
      resolvedCount,
      totalCount: Math.max(data.length, prev.totalCount)
    }));
  };

  // Force refresh of stats - called when refresh button clicked
  const refreshStats = () => {
    console.log('AnomalyContext - Forcing refresh of stats');
    // This triggers a re-render in components consuming the context
    setAnomalyStats(prev => ({ ...prev }));
  };

  return (
    <AnomalyContext.Provider value={{
      anomalyStats,
      anomalyData,
      updateAnomalyStats,
      updateAnomalyData,
      refreshStats
    }}>
      {children}
    </AnomalyContext.Provider>
  );
};
