import { Routes, Route } from 'react-router-dom';

import BlogPage from './BlogPage';
import BlogPostPage from './BlogPostPage';

import type { BlogServiceType } from './services/BlogService';

export interface BlogProps {
  footerName: string;
  serviceType: BlogServiceType;
}

const Blog: React.FC<BlogProps> = (props) => (
    <Routes>
        <Route path="/" element={<BlogPage {...props} />} />
        <Route path="/:postId" element={<BlogPostPage {...props} />} />
    </Routes>
);

export default Blog;
