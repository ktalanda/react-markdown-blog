import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Text from '@mui/material/Typography';
import { Footer } from 'react-wavecoder-components';
import { useNavigate } from 'react-router-dom';

import type { BlogProps } from '../Blog';
import type Post from '../Post';
import PostCard from './card/PostCard';
import Service, { type PaginationOptions, type PaginatedResult } from '../services/Service';
import TagFilter from './TagFilter';
import { type PageState } from './PageState';

import './Page.css';
import createService from '../services/createService';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';

const Page: React.FC<BlogProps> = ({ footerName, serviceType, postsPerPage = 5 }) => {
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });
  const service: Service = useMemo(() => createService(serviceType), [serviceType]);
  const navigate = useNavigate();
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async (page: number, isInitialLoad = false, selectedTags: string[] = []): Promise<void> => {
    if (isInitialLoad) {
      setPageState({ status: 'loading' });
    } else {
      setPageState(prevState => ({ ...prevState, loadingMore: true }));
    }

    try {
      const paginationOptions: PaginationOptions = {
        page,
        limit: postsPerPage
      };
      const result: PaginatedResult<Post> = await service.fetchPostsWithPagination(
        paginationOptions,
        selectedTags
      );

      if (isInitialLoad) {
        setPageState({ status: 'content', posts: result.data, pagination: {
          page,
          hasMore: result.hasMore,
          total: result.total
        }, loadingMore: false });
        if (result.data.length === 0) {
          setPageState({ status: 'empty' });
        } else {
          setPageState({ status: 'content', posts: result.data, pagination: {
            page,
            hasMore: result.hasMore,
            total: result.total
          }, loadingMore: false });
        }
      } else {
        setPageState(prevState => {
          if (prevState.status !== 'content') return prevState;
          return ({
            ...prevState,
            posts: [...prevState.posts, ...result.data]
          });
        });
      }
    } catch (err) {
      setPageState({ 
        status: 'error', 
        message: err instanceof Error ? err.message : 
          `An error occurred ${isInitialLoad ? 'loading' : 'loading more'} posts`
      });
    } finally {
      if (!isInitialLoad) {
        setPageState(prevState => ({ ...prevState, loadingMore: false }));
      }
    }
  }, [postsPerPage, service]);

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
    void fetchPosts(0, true);
  }, [fetchPosts]);
  
  useEffect(() => {
    if (pageState.status !== 'content') return;

    const loadNextPage = (): void => {
      if (!pageState.loadingMore && pageState.pagination.hasMore) {
        void fetchPosts(pageState.pagination.page + 1);
      }
    };
    return setupInfiniteScroll(loadNextPage)(!pageState.loadingMore && pageState.pagination.hasMore);
  }, [setupInfiniteScroll, fetchPosts, pageState]);

  const handleBackClick = (): void => void navigate('/');

  const handleTagsChange = useCallback((tags: string[]): void => {
    fetchPosts(0, true, tags).catch(err =>
      console.error('Error fetching posts after tag change:', err)
    );
  }, [fetchPosts]);

  switch (pageState.status) {
  case 'loading':
    return <LoadingPage />;
  
  case 'error':
    return <ErrorPage error={pageState.message} />;
    
  case 'empty':
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

          <TagFilter
            onTagsChange={handleTagsChange}
            serviceType={serviceType}
          />
        </Box>
        
        <Text variant="body1">No blog posts found.</Text>
        
        <Footer name={footerName}/>
      </Box>
    );
    
  case 'content':
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

          <TagFilter
            onTagsChange={handleTagsChange}
            serviceType={serviceType}
          />
        </Box>

        {pageState.posts.map((post, index) => (
          <div 
            key={post.folder}
            ref={index === pageState.posts.length - 1 ? lastPostRef : null}
          >
            <PostCard post={post} />
          </div>
        ))}
        
        {pageState.loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        <Footer name={footerName}/>
      </Box>
    );
  }
};

export default Page;
