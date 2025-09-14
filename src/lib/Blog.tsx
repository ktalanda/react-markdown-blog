import { Routes, Route } from 'react-router-dom';

import Page from './Page';
import PostPage from './PostPage';

import type { BlogServiceType } from './services/BlogService';

export interface BlogProps {
  footerName: string;
  serviceType: BlogServiceType;
}

const Blog: React.FC<BlogProps> = (props) => (
    <Routes>
  <Route path="/" element={<Page {...props} />} />
        <Route path="/:postId" element={<PostPage {...props} />} />
    </Routes>
);

export default Blog;
