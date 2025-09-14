import { ThemeProvider, createTheme, type Theme } from '@mui/material/styles';
import { Routes, Route } from 'react-router-dom';

import Page from './Page';
import PostPage from './PostPage';

import type { ServiceType } from './services/Service';

export interface BlogProps {
  footerName: string;
  serviceType: ServiceType;
  theme?: Theme;
}

const defaultTheme = createTheme({
 palette: {
    primary: {
      main: "#fff",
    },
    secondary: {
      main: "#4fc3f7",
    },
    text: {
      primary: "#fff",
      secondary: "#4fc3f7",
      disabled: "#999",
    },
  },
});

const Blog: React.FC<BlogProps> = (props) => (
  <ThemeProvider theme={props.theme || defaultTheme}>
    <Routes>
      <Route path="/" element={<Page {...props} />} />
      <Route path="/:postId" element={<PostPage {...props} />} />
    </Routes>
  </ThemeProvider>
);

export default Blog;
