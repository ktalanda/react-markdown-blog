import { createContext } from 'react';
import type { AnalyticsStream } from './AnalyticsStream';

interface AnalyticsContextValue {
  stream?: AnalyticsStream;
}

export const AnalyticsContext = createContext<AnalyticsContextValue>({});

export type { AnalyticsContextValue };
