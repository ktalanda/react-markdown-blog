import React, { useState, useEffect, useMemo } from "react";
import Text from "@mui/material/Typography";
import { Box, CircularProgress, Alert, Button } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './BlogPage.css';

import BlogPostCard from "./BlogPostCard";
import BlogPost from "./BlogPost";
import BlogService from "./services/BlogService";
import { Footer } from 'react-wavecoder-components';

import type { BlogServiceType } from "./services/BlogService";

interface BlogPageProps {
  footerName: string;
  serviceType: BlogServiceType;
}

const BlogPage: React.FC<BlogPageProps> = ({ serviceType, footerName }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const blogService: BlogService = useMemo(() => BlogService.create(serviceType), [serviceType]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await blogService.fetchBlogPosts();
        setPosts(posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [blogService]);

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box className="blog-loading">
        <CircularProgress />
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
          <BlogPostCard 
            key={post.folder} 
            post={post} 
          />
        ))
      )}
      
      <Footer name={footerName}/>
    </Box>
  );
};

export default BlogPage;
