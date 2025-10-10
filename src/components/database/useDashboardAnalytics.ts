import { useState, useEffect } from 'react';
import { AnalyticsService, PottyService } from './services';

export function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState<{
    weeklyProgress: any;
    commandTrends: any[];
    pottySuccessRate: number;
    isLoading: boolean;
  }>({
    weeklyProgress: null,
    commandTrends: [],
    pottySuccessRate: 0,
    isLoading: true
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [weeklyProgress, commandTrends, pottySuccessRate] = await Promise.all([
          AnalyticsService.calculateWeeklyProgress(),
          AnalyticsService.getCommandTrends(),
          PottyService.getSuccessRate(7)
        ]);

        setAnalytics({
          weeklyProgress,
          commandTrends,
          pottySuccessRate,
          isLoading: false
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
        setAnalytics(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAnalytics();
  }, []);

  const refreshAnalytics = async () => {
    setAnalytics(prev => ({ ...prev, isLoading: true }));
    const [weeklyProgress, commandTrends, pottySuccessRate] = await Promise.all([
      AnalyticsService.calculateWeeklyProgress(),
      AnalyticsService.getCommandTrends(),
      PottyService.getSuccessRate(7)
    ]);

    setAnalytics({
      weeklyProgress,
      commandTrends,
      pottySuccessRate,
      isLoading: false
    });
  };

  return {
    ...analytics,
    refreshAnalytics
  };
}