import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Blog, { type ServiceType } from './lib';
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog/*" element={<Blog serviceType={{ source: 'mock' } as ServiceType} footerName="Sample Blog" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
