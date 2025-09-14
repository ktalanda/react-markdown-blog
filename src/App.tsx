import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Blog, { type BlogServiceType } from './lib';

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="card">
      <button onClick={() => navigate('/blog')}>
        Show Blog
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog/*" element={<Blog serviceType={{ source: 'mock' } as BlogServiceType} footerName="Sample Blog" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
