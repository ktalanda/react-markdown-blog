import { useCallback, useEffect, useMemo, useState, useRef, type ReactNode } from 'react';
import { Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Text from '@mui/material/Typography';
import { Footer } from 'react-wavecoder-components';
import { useNavigate } from 'react-router-dom';

import type { BlogProps } from '../Blog';
import type Post from '../Post';
import Service, { type PaginationOptions, type PaginatedResult } from '../services/Service';
import TagFilter from './TagFilter';
import { type PageState } from './PageState';

import './Page.css';
import createService from '../services/createService';

import LoadingView from './LoadingView';
import ErrorView from './ErrorView';
import ContentView from './ContentView';

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
    void fetchPosts(0, true, tags);
  }, [fetchPosts]);

  let content: ReactNode;
  switch (pageState.status) {
  case 'loading':
    content = <LoadingView />;
    break;
  case 'error':
    content = <ErrorView error={pageState.message} />;
    break;
  case 'empty':
    content = <Text variant="body1">No blog posts found.</Text>;
    break;
  case 'content':
    content = (
      <ContentView
        posts={pageState.posts}
        loadingMore={pageState.loadingMore}
        lastPostRef={lastPostRef}
      />
    );
    break;
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
        <TagFilter
          onTagsChange={handleTagsChange}
          serviceType={serviceType}
        />
      </Box>
      {content}
      <Footer name={footerName}/>
    </Box>
  );
};

export default Page;
