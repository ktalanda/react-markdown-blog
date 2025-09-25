import { ArrowBack } from '@mui/icons-material';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeComponent from '../components/CodeComponent';
import { Footer } from 'react-wavecoder-components';

import type { BlogProps } from '../Blog';
import { useEffect, useMemo, useState } from 'react';
import type { Post } from '../Post';
import { useNavigate, useParams } from 'react-router-dom';
import Service from '../services/Service';

import './PostPage.css';
import createService from '../services/createService';

const PostPage: React.FC<BlogProps> = ({ footerName, serviceType }) => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service: Service = useMemo(() => createService(serviceType), [serviceType]);
  const navigate = useNavigate();

  const handleBackClick = (): void => {
    void navigate('/blog');
  };

  useEffect(() => {
    const fetchPost = async (): Promise<void> => {
      if (!postId) {
        setError('No post ID provided');
        setLoading(false);
        return;
      }

      try {
        const foundPost = await service.fetchPostById(postId);
        if (!foundPost) {
          setError('Post not found');
        } else {
          setPost(foundPost);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    void fetchPost();
  }, [postId, service]);

  if (loading) {
    return (
      <Box className="blog-post-loading">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="blog-post-error">
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Blog
        </Button>
      </Box>
    );
  }
  if (!post) {
    return (
      <Box className="blog-post-error">
        <Alert severity="warning">Post not found</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Blog
        </Button>
      </Box>
    );
  }

  return (
    <Box className="blog-post-container">
      <Box className="blog-post-header">
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBackClick}
          className="back-button"
        >
          Back to Blog
        </Button>
        
        <Typography variant="body2" className="blog-post-date">
          {post.getFormattedDate()}
        </Typography>
      </Box>

      <Box className="blog-post-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code: CodeComponent
          }}
        >
          {post.content}
        </ReactMarkdown>
      </Box>
      
      <Footer name={footerName}/>
    </Box>
  );
};

export default PostPage;
