import Text from '@mui/material/Typography';
import { Box, Card, CardContent, CardActionArea, Chip, Stack } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useNavigate } from 'react-router-dom';
import './PostCard.css';

import Post from '../../Post';
import CodeComponent from '../../components/CodeComponent';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const navigate = useNavigate();
  const handleClick = (): void => {
    void navigate(`/blog/${post.folder}`);
  };

  return (
    <Card className="blog-post-card">
      <CardActionArea onClick={handleClick}>
        <CardContent>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1
          }}>
            <Text variant="body2" color="text.disabled">
              {post.getFormattedDate()}
            </Text>

            {post.tags && post.tags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {post.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          <Box className="blog-post-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{code: CodeComponent}}
            >
              {post.getPreview()}
            </ReactMarkdown>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PostCard;
