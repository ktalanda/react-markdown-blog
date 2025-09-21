import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
import createService from './services/createService';

const Page: React.FC<BlogProps> = ({ footerName, serviceType, postsPerPage = 5 }) => {
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

  const service: Service = useMemo(() => createService(serviceType), [serviceType]);
  const navigate = useNavigate();
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async (page: number, isInitialLoad = false): Promise<void> => {
    if (isInitialLoad) setLoading(true);
    else setLoadingMore(true);
  
    try {
      const paginationOptions: PaginationOptions = {
        page,
        limit: postsPerPage
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
  }, [service, postsPerPage]);

  const setupInfiniteScroll = useCallback(
    (onIntersect: () => void) => 
      (shouldObserve = true) : (() => void) | undefined => {
        if (!shouldObserve) return;

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
              onIntersect();
            }
          },
          {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
          }
        );

        const currentLastPost = lastPostRef.current;
        if (currentLastPost) observerRef.current.observe(currentLastPost);
        
        return () : void => {
          if (observerRef.current) observerRef.current.disconnect();
        };
      },
    []
  );

  useEffect(() => void fetchPosts(0, true), [fetchPosts]);
  
  useEffect(() => {
    const loadNextPage = (): void => {
      if (!loadingMore && pagination.hasMore) {
        void fetchPosts(pagination.page + 1);
      }
    };
    return setupInfiniteScroll(loadNextPage)(!loading && !loadingMore && pagination.hasMore);
  }, [setupInfiniteScroll, fetchPosts, pagination, loading, loadingMore, posts]);

  const handleBackClick = (): void => void navigate('/');

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
          {posts.map((post, index) => (
            <div 
              key={post.folder}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <PostCard post={post} />
            </div>
          ))}
          
          {loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </>
      )}

      <Footer name={footerName}/>
    </Box>
  );
};

export default Page;
