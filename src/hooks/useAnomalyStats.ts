
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
    console.log('useAnomalyDetection - State updated:', { totalAnomaliesCount, totalImpactValue });
  }, [totalAnomaliesCount, totalImpactValue]);

  // Atomic state update function for anomaly stats
  const updateAnomalyStats = useCallback((count: number, impact: number) => {
    console.log(`Setting anomaly stats - count: ${count}, impact: ${impact}`);
    
    // Force state update to be atomic
    setStats(prev => ({
      ...prev,
      totalAnomaliesCount: count,
      totalImpactValue: impact,
      hasAnomalies: count > 0
    }));
    
    // Notify parent component if callback provided
    if (onStatsChange) {
      onStatsChange(count, impact);
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
