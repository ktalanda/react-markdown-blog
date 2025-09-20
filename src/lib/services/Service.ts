import Post from '../Post';
import CdnService from './CdnService';
import MockService from './MockService';

export type ServiceType =
  | { source: 'cdn'; url: string }
  | { source: 'mock' };

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

abstract class Service {
  abstract fetchPosts(): Promise<Post[]>;
  abstract fetchPostById(postId: string): Promise<Post | null>;
  abstract fetchPostsWithPagination(options: PaginationOptions): Promise<PaginatedResult<Post>>;

  static create(type: ServiceType): Service {
    switch (type.source) {
    case 'cdn':
      return new CdnService(type.url);
    case 'mock':
      return new MockService();
    default:
      throw new Error(`Unknown blog service type: ${(type as ServiceType).source}`);
    }
  }
}

export default Service;
