import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Text from '@mui/material/Typography';
import { Footer } from 'react-wavecoder-components';
import { useNavigate } from 'react-router-dom';

import type { BlogProps } from './Blog';
import type Post from './Post';
import PostCard from './PostCard';
import Service, { type PaginationOptions, type PaginatedResult } from './services/Service';

import './Page.css';

const POSTS_PER_PAGE = 5;

const Page: React.FC<BlogProps> = ({ footerName, serviceType }) => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    hasMore: boolean;
    total: number;
  }>({
    page: 0,
    hasMore: false,
    total: 0
  });

  const service: Service = useMemo(() => Service.create(serviceType), [serviceType]);
  const navigate = useNavigate();

  const fetchPosts = useCallback(async (page: number, isInitialLoad = false): Promise<void> => {
    if (isInitialLoad) setLoading(true);
    else setLoadingMore(true);
  
    try {
      const paginationOptions: PaginationOptions = {
        page,
        limit: POSTS_PER_PAGE
      };
      const result: PaginatedResult<Post> = await service.fetchPostsWithPagination(paginationOptions);

      if (isInitialLoad) setPosts(result.data);
      else setPosts(prevPosts => [...prevPosts, ...result.data]);

      setPagination({
        page,
        hasMore: result.hasMore,
        total: result.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 
        `An error occurred ${isInitialLoad ? 'loading' : 'loading more'} posts`);
    } finally {
      if (isInitialLoad) setLoading(false);
      else setLoadingMore(false);
    }
  }, [service]);

  useEffect(() => void fetchPosts(0, true), [service, fetchPosts]);
  const handleLoadMore = (): void => {
    if (loadingMore || !pagination.hasMore) return;
    void fetchPosts(pagination.page + 1);
  };
  const handleBackClick = (): void => void navigate('/blog');

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

      {posts.length === 0 && !loading ? (
        <Text variant="body1">No blog posts found.</Text>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard 
              key={post.folder} 
              post={post} 
            />
          ))}

          {pagination.hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <Button 
                variant="contained" 
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Load More (${posts.length} of ${pagination.total})`
                )}
              </Button>
            </Box>
          )}
        </>
      )}

      <Footer name={footerName}/>
    </Box>
  );
};

export default Page;
