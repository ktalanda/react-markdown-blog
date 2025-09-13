import Text from "@mui/material/Typography";
import { Box, Card, CardContent, CardActionArea } from "@mui/material";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useNavigate } from 'react-router-dom';
import './BlogPostCard.css';

import BlogPost from "./BlogPost";
import CodeComponent from "./CodeComponent";

const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/blog/${post.folder}`);
  };

  return (
    <Card className="blog-post-card">
      <CardActionArea onClick={handleClick}>
        <CardContent>
          <Text variant="body2" color="text.disabled">
            {post.getFormattedDate()}
          </Text>
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

export default BlogPostCard;
