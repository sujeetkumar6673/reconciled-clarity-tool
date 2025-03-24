
import { useState, useCallback, useEffect } from 'react';

export interface UseAnomalyStatsProps {
  onStatsChange?: (count: number, impact: number) => void;
}

export const useAnomalyStats = ({ onStatsChange }: UseAnomalyStatsProps = {}) => {
  const [stats, setStats] = useState({
    totalAnomaliesCount: 0,
    totalImpactValue: 0,
    hasAnomalies: false
  });

  const { totalAnomaliesCount, totalImpactValue, hasAnomalies } = stats;

  // Log state updates for debugging
  useEffect(() => {
    console.log('useAnomalyStats - State updated:', { totalAnomaliesCount, totalImpactValue });
  }, [totalAnomaliesCount, totalImpactValue]);

  // Simplified state update function for anomaly stats
  const updateAnomalyStats = useCallback((count: number, impact: number) => {
    console.log(`Setting anomaly stats - count: ${count}, impact: ${impact}`);
    
    // Force update with new values directly
    const newStats = {
      totalAnomaliesCount: count,
      totalImpactValue: impact,
      hasAnomalies: count > 0
    };
    
    setStats(newStats);
    
    // Always call the callback if provided to ensure parent components are updated
    if (onStatsChange) {
      setTimeout(() => {
        onStatsChange(count, impact);
      }, 10);
    }
    
    // Log state update with a delay to verify it took effect
    setTimeout(() => {
      console.log("Delayed state check:", { totalAnomaliesCount: count, totalImpactValue: impact });
    }, 500);
  }, [onStatsChange]);

  return {
    totalAnomaliesCount,
    totalImpactValue,
    hasAnomalies,
    updateAnomalyStats
  };
};
