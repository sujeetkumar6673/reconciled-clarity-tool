
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

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

  // Log state updates for debugging and call the callback
  useEffect(() => {
    console.log('useAnomalyStats - State updated:', { totalAnomaliesCount, totalImpactValue });
    
    // Call onStatsChange when state updates, regardless of values
    if (onStatsChange) {
      console.log('Calling onStatsChange from useEffect with:', { count: totalAnomaliesCount, impact: totalImpactValue });
      onStatsChange(totalAnomaliesCount, totalImpactValue);
    }
    
    // After a slight delay, call the callback again to ensure it wasn't missed
    if (onStatsChange && (totalAnomaliesCount > 0 || totalImpactValue !== 0)) {
      setTimeout(() => {
        console.log('Delayed onStatsChange call with:', { count: totalAnomaliesCount, impact: totalImpactValue });
        onStatsChange(totalAnomaliesCount, totalImpactValue);
      }, 300);
    }
  }, [totalAnomaliesCount, totalImpactValue, onStatsChange]);

  // State update function with direct callback
  const updateAnomalyStats = useCallback((count: number, impact: number) => {
    console.log(`Setting anomaly stats - count: ${count}, impact: ${impact}`);
    
    // Update state
    setStats({
      totalAnomaliesCount: count,
      totalImpactValue: impact,
      hasAnomalies: count > 0
    });
    
    // Call the callback immediately with the new values
    if (onStatsChange) {
      console.log('Calling onStatsChange with:', { count, impact });
      onStatsChange(count, impact);
    }
    
    // Log state update with a delay to verify it took effect
    setTimeout(() => {
      console.log("Delayed state check:", { totalAnomaliesCount: count, totalImpactValue: impact });
    }, 500);
  }, [onStatsChange]);

  // Add a direct refresh method that components can call
  const refreshStats = useCallback(() => {
    console.log('Manually refreshing stats:', { totalAnomaliesCount, totalImpactValue });
    if (onStatsChange) {
      onStatsChange(totalAnomaliesCount, totalImpactValue);
    }
  }, [totalAnomaliesCount, totalImpactValue, onStatsChange]);

  return {
    totalAnomaliesCount,
    totalImpactValue,
    hasAnomalies,
    updateAnomalyStats,
    refreshStats
  };
};
