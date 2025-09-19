import Post from '../Post';
import CdnService from './CdnService';
import MockService from './MockService';

export type ServiceType =
  | { source: 'cdn'; url: string }
  | { source: 'mock' };

abstract class Service {
  abstract fetchPosts(): Promise<Post[]>;
  abstract fetchPostById(postId: string): Promise<Post | null>;

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
