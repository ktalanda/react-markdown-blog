export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface PageViewEvent extends AnalyticsEvent {
  type: 'page_view';
  data: {
    page: string;
    title?: string;
    postId?: string;
  };
}

export type BlogAnalyticsEvent = PageViewEvent;

export class AnalyticsStream {
  private listeners: Array<(event: BlogAnalyticsEvent) => void> = [];

  subscribe(listener: (event: BlogAnalyticsEvent) => void): () => void {
    this.listeners.push(listener);
 
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(event: Omit<BlogAnalyticsEvent, 'timestamp'>): void {
    const fullEvent = {
      ...event,
      timestamp: Date.now(),
    } as BlogAnalyticsEvent;

    this.listeners.forEach(listener => {
      try {
        listener(fullEvent);
      } catch (error) {
        console.error('Error in analytics listener:', error);
      }
    });
  }

  trackPageView(page: string, title?: string, postId?: string): void {
    this.emit({
      type: 'page_view',
      data: { page, title, postId }
    });
  }
}
