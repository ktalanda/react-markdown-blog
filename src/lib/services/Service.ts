import Post from "../Post";
import S3Service from "./S3Service";
import MockService from "./MockService";

export type ServiceType =
  | { source: 's3'; bucket: string }
  | { source: 'mock' };

abstract class Service {
  abstract fetchBlogPosts(): Promise<Post[]>;
  abstract fetchBlogPostById(postId: string): Promise<Post | null>;

  static create(type: ServiceType): Service {
    switch (type.source) {
      case 's3':
        return new S3Service(type.bucket);
      case 'mock':
        return new MockService();
      default:
        throw new Error(`Unknown blog service type: ${type}`);
    }
  }
}

export default Service;
