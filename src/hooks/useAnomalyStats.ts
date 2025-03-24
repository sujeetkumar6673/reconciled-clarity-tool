
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

  // Log state updates for debugging
  useEffect(() => {
    console.log('useAnomalyStats - State updated:', { totalAnomaliesCount, totalImpactValue });
  }, [totalAnomaliesCount, totalImpactValue]);

  // Simplified state update function for anomaly stats with enhanced callback handling
  const updateAnomalyStats = useCallback((count: number, impact: number) => {
    console.log(`Setting anomaly stats - count: ${count}, impact: ${impact}`);
    
    // Force update with new values directly
    setStats({
      totalAnomaliesCount: count,
      totalImpactValue: impact,
      hasAnomalies: count > 0
    });
    
    // Call the callback immediately with the new values
    if (onStatsChange) {
      console.log('Calling onStatsChange with:', { count, impact });
      onStatsChange(count, impact);
      
      // Also call it after a small delay to ensure it takes effect
      setTimeout(() => {
        console.log('Delayed onStatsChange call with:', { count, impact });
        onStatsChange(count, impact);
      }, 100);
    }
    
    // Display toast notification for significant updates
    if (count > 0) {
      toast.success(`Updated anomaly statistics: ${count} anomalies found with impact of $${Math.abs(impact).toLocaleString()}`);
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
