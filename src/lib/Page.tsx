import React, { useState, useEffect, useMemo } from "react";
import Text from "@mui/material/Typography";
import { Box, CircularProgress, Alert, Button } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Page.css';

import PostCard from "./PostCard";
import Post from "./Post";
import Service from "./services/Service";
import { Footer } from 'react-wavecoder-components';
import type { BlogProps } from "./Blog";

const Page: React.FC<BlogProps> = ({ serviceType, footerName }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const service: Service = useMemo(() => Service.create(serviceType), [serviceType]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await service.fetchBlogPosts();
        setPosts(posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [service]);

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
