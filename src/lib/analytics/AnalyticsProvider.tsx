import type { ReactNode } from 'react';
import { AnalyticsContext } from './AnalyticsContext';
import type { AnalyticsStream } from './AnalyticsStream';

export const AnalyticsProvider: React.FC<{
  children: ReactNode;
  stream?: AnalyticsStream;
}> = ({ children, stream }) => {
  return (
    <AnalyticsContext.Provider value={{ stream }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
