import type Post from '../Post';

interface Pagination {
  page: number;
  hasMore: boolean;
  total: number;
}

export type PageState = 
  | { status: 'error'; message: string }
  | { 
      status: 'content'; 
      posts: Post[]; 
      pagination: Pagination;
      loadingMore: boolean;
    };
