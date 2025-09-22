import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Alert, Box, Button, CircularProgress, Chip, Typography } from '@mui/material';
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
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const service: Service = useMemo(() => createService(serviceType), [serviceType]);
  const navigate = useNavigate();
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchAvailableTags = useCallback(async (): Promise<void> => {
    try {
      const tags = await service.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, [service]);

  const fetchPosts = useCallback(async (page: number, isInitialLoad = false): Promise<void> => {
    if (isInitialLoad) setLoading(true);
    else setLoadingMore(true);

    try {
      const paginationOptions: PaginationOptions = {
        page,
        limit: postsPerPage
      };
      const result: PaginatedResult<Post> = await service.fetchPostsWithPagination(
        paginationOptions,
      );

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

  useEffect(() => {
    void fetchAvailableTags();
    void fetchPosts(0, true);
  }, [fetchAvailableTags, fetchPosts]);
  
  useEffect(() => {
    const loadNextPage = (): void => {
      if (!loadingMore && pagination.hasMore) {
        void fetchPosts(pagination.page + 1);
      }
    };
    return setupInfiniteScroll(loadNextPage)(!loading && !loadingMore && pagination.hasMore);
  }, [setupInfiniteScroll, fetchPosts, pagination, loading, loadingMore, posts]);

  const handleBackClick = (): void => void navigate('/');

  const handleTagClick = (tag: string): void => {
    setSelectedTags(prevTags => {
      const isSelected = prevTags.includes(tag);
      const newTags = isSelected
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag];
      setTimeout(() => {
        void fetchPosts(0, true);
      }, 0);
      return newTags;
    });
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 2
      }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
          className="back-button"
        >
          Back
        </Button>

        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'flex-end',
          maxWidth: { xs: '100%', sm: '70%' }
        }}>
          {availableTags.length > 0 && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ alignSelf: 'center', mr: 1 }}
              >
                Filter by:
              </Typography>

              {availableTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  color={selectedTags.includes(tag) ? 'primary' : 'default'}
                  onClick={() => handleTagClick(tag)}
                  sx={{
                    '&:hover': {
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                />
              ))}
            </>
          )}
        </Box>
      </Box>

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
