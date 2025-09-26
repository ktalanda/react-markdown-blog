import { Box, CircularProgress } from '@mui/material';
import PostCard from './card/PostCard';
import type Post from '../Post';

const ContentView: React.FC<{ posts: Post[]; loadingMore: boolean; lastPostRef: React.RefObject<HTMLDivElement | null>}> = ({ posts, loadingMore, lastPostRef }) => (
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

export default ContentView;
