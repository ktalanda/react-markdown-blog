import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Footer } from 'react-wavecoder-components';
import { useNavigate } from 'react-router-dom';

import type { BlogProps } from '../Blog';
import type Post from '../Post';
import Service, { type PaginatedResult } from '../services/Service';
import TagFilter from './TagFilter';
import { type PageState } from './PageState';

import './Page.css';
import createService from '../services/createService';

import ErrorView from './ErrorView';
import ContentView from './ContentView';

const Page: React.FC<BlogProps> = ({ footerName, serviceType, postsPerPage = 5 }) => {
  const [pageState, setPageState] = useState<PageState>({
    status: 'content',
    posts: [],
    pagination: { page: 0, hasMore: true, total: 0 },
    loadingMore: false
  });
  const service: Service = useMemo(() => createService(serviceType), [serviceType]);
  const navigate = useNavigate();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchPosts = useCallback(async (page: number, tags: string[] = []): Promise<void> => {
    setPageState(prevState => ({ ...prevState, loadingMore: true }));

    try {
      const result: PaginatedResult<Post> = await service.fetchPostsWithPagination(
        { page: page, limit: postsPerPage },
        tags
      );

      setPageState(prevState => {
        const prevPosts = (prevState.status === 'content' && !(page === 0)) ? prevState.posts : [];
        
        return ({
          status: 'content',
          posts: [...prevPosts, ...result.data],
          pagination: {
            page,
            hasMore: result.hasMore,
            total: result.total
          },
          loadingMore: false
        });
      });
    } catch (err) {
      setPageState({ 
        status: 'error', 
        message: err instanceof Error ? err.message : 'An error occurred while loading posts'
      });
    }
  }, [postsPerPage, service]);

  useEffect(() => {
    void fetchPosts(0, selectedTags);
  }, [fetchPosts, selectedTags]);

  const handleBackClick = (): void => void navigate('/');

  const handleTagsChange = useCallback((tags: string[]): void => {
    setSelectedTags(tags);
    void fetchPosts(0, tags);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (pageState.status === 'content') {
      void fetchPosts(pageState.pagination.page + 1, selectedTags);
    }
  }, [fetchPosts, pageState, selectedTags]);

  let content: ReactNode;
  switch (pageState.status) {
  case 'error':
    content = <ErrorView error={pageState.message} />;
    break;
  case 'content':
    content = (
      <ContentView
        posts={pageState.posts}
        loadingMore={pageState.loadingMore}
        hasMorePosts={pageState.pagination.hasMore}
        onLoadMore={handleLoadMore}
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
          selectedTags={selectedTags}
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
