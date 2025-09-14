
import './App.css';
import { useState } from 'react';
import BlogPage from './lib/BlogPage';

function App() {

  const [showBlog, setShowBlog] = useState(false);

  if (showBlog) {
      return (
        <BlogPage serviceType={{ source: 'mock' }} footerName="Sample Blog" />
      );
  }

  return (
    <div className="card">
      <button
        onClick={() => setShowBlog(true)}
      >
        Show Blog
      </button>
    </div>
  );
}

export default App
