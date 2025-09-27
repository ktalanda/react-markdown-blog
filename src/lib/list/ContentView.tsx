import { useCallback, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import PostCard from './card/PostCard';
import type Post from '../Post';

interface ContentViewProps {
  posts: Post[];
  loadingMore: boolean;
  hasMorePosts: boolean;
  onLoadMore: () => void;
}

const ContentView: React.FC<ContentViewProps> = ({
  posts,
  loadingMore,
  hasMorePosts,
  onLoadMore
}) => {
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupInfiniteScroll = useCallback(
    (shouldObserve = true): (() => void) | undefined => {
      if (!shouldObserve) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            onLoadMore();
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

      return (): void => {
        if (observerRef.current) observerRef.current.disconnect();
      };
    },
    [onLoadMore]
  );

  useEffect(() => {
    return setupInfiniteScroll(!loadingMore && hasMorePosts);
  }, [setupInfiniteScroll, loadingMore, hasMorePosts, posts.length]);

  if (posts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="body1">No blog posts found.</Typography>
      </Box>
    );
  }

  return (
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
  );
};

export default ContentView;
