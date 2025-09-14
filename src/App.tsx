
import './App.css';

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Blog from './lib/Blog';


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
        <Route path="/blog/*" element={<Blog serviceType={{ source: 'mock' }} footerName="Sample Blog" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
