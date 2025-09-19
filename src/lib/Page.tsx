import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Text from '@mui/material/Typography';
import { Footer } from 'react-wavecoder-components';
import { useNavigate } from 'react-router-dom';

import type { BlogProps } from './Blog';
import Service from './services/Service';
import type Post from './Post';
import PostCard from './PostCard';

import './Page.css';

const Page: React.FC<BlogProps> = ({ footerName, serviceType }) => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  const service: Service = useMemo(() => Service.create(serviceType), [serviceType]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogPosts = async (): Promise<void> => {
      try {
        const posts = await service.fetchPosts();
        setPosts(posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    void fetchBlogPosts();
  }, [service]);

  const handleBackClick = (): void => {
    void navigate('/blog');
  };


  if (loading) {
    return (
      <Box className="blog-loading">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="blog-error">
        <Alert severity="error">Error loading blog posts: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="blog-container">
      <Button 
        startIcon={<ArrowBack />} 
        onClick={handleBackClick}
        className="back-button"
        sx={{ mb: 2 }}
      >
        Back to Home
      </Button>
      
      {posts.length === 0 ? (
        <Text variant="body1">No blog posts found.</Text>
      ) : (
        posts.map((post) => (
          <PostCard 
            key={post.folder} 
            post={post} 
          />
        ))
      )}
      
      <Footer name={footerName}/>
    </Box>
  );
};

export default Page;
