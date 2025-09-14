import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeComponent from './CodeComponent';
import BlogPost from './BlogPost';
import BlogService from './services/BlogService';
import { Footer } from 'react-wavecoder-components';
import './BlogPostPage.css';
import type { BlogProps } from './Blog';

const BlogPostPage: React.FC<BlogProps> = ({ serviceType, footerName }) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blogService: BlogService = useMemo(() => BlogService.create(serviceType), [serviceType]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('No post ID provided');
        setLoading(false);
        return;
      }

      try {
        const foundPost = await blogService.fetchBlogPostById(postId);
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

    fetchPost();
  }, [postId, blogService]);

  const handleBackClick = () => {
    navigate('/blog');
  };

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

export default BlogPostPage;
