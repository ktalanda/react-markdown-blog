import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Blog, { type ServiceType, AnalyticsStream, type AnalyticsEvent } from './lib';
import type { JSX } from 'react';

function LandingPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="card">
      <button onClick={() => void navigate('/blog')}>
        Show Blog
      </button>
    </div>
  );
}

function App(): JSX.Element {
  const analyticsStream = new AnalyticsStream();
  analyticsStream.subscribe((event: AnalyticsEvent) => {
    console.log('Analytics Event:', event, {
      isDevelopment: process.env.NODE_ENV === 'development'
    });
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog/*" element={<Blog
          serviceType={{ source: 'cdn', url: 'https://wavecoder.com.au/blog' } as ServiceType} footerName="Sample Blog"
          analyticsStream={analyticsStream}
        />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
