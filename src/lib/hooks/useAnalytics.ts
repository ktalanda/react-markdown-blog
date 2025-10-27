import { useContext } from 'react';
import { AnalyticsContext, type AnalyticsContextValue } from '../analytics/AnalyticsContext';

export const useAnalytics = (): AnalyticsContextValue => {
  return useContext(AnalyticsContext);
};
