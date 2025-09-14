import BlogPost from "../BlogPost";
import MockBlogService from "./MockBlogService";
import S3BlogService from "./S3BlogService";

export type BlogServiceType =
  | { source: 's3'; cdnUrl: string }
  | { source: 'mock' };

abstract class BlogService {
  abstract fetchBlogPosts(): Promise<BlogPost[]>;
  abstract fetchBlogPostById(postId: string): Promise<BlogPost | null>;

  static create(type: BlogServiceType): BlogService {
    switch (type.source) {
      case 's3':
        return new S3BlogService(type.cdnUrl);
      case 'mock':
        return new MockBlogService();
      default:
        throw new Error(`Unknown blog service type: ${type}`);
    }
  }
}

export default BlogService;
