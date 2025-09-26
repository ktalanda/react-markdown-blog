import { Alert } from '@mui/material';
import Box from '@mui/material/Box';

const ErrorView: React.FC<{ error: string }> = ({ error }) => (
  <Box className="blog-error">
    <Alert severity="error">Error loading blog posts: {error}</Alert>
  </Box>
);

export default ErrorView;