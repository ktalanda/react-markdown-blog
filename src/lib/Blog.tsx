import { ThemeProvider, createTheme, type Theme } from '@mui/material/styles';
import { Routes, Route } from 'react-router-dom';

import Page from './list/Page';
import PostPage from './post/PostPage';
import { AnalyticsProvider } from './analytics/AnalyticsProvider';
import type { AnalyticsStream } from './analytics/AnalyticsStream';

import type { ServiceType } from './services/Service';

export interface BlogProps {
  footerName: string;
  serviceType: ServiceType;
  postsPerPage?: number;
  theme?: Theme;
  analyticsStream?: AnalyticsStream;
}

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#fff',
    },
    secondary: {
      main: '#4fc3f7',
    },
    text: {
      primary: '#fff',
      secondary: '#4fc3f7',
      disabled: '#999',
    },
  },
});

const Blog: React.FC<BlogProps> = (props) => (
  <ThemeProvider theme={props.theme || defaultTheme}>
    <AnalyticsProvider stream={props.analyticsStream}>
      <Routes>
        <Route path="/" element={<Page {...props} />} />
        <Route path="/:postId" element={<PostPage {...props} />} />
      </Routes>
    </AnalyticsProvider>
  </ThemeProvider>
);

export default Blog;
