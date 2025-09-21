import Post from '../Post';
import parseFolderName from './parseFolderName';

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
  async fetchPosts(): Promise<Post[]> {
    const manifest = await this.fetchManifestFromServer();
    const blogFolders = manifest.filter(name => parseFolderName(name) !== null);
    const postsWithContent = await Promise.all(
      blogFolders.map(async (folderName) => await this.fetchPostByFolderName(folderName))
    );
    return postsWithContent.filter((post): post is Post => post !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async fetchPostById(postId: string): Promise<Post | null> {
    const manifest = await this.fetchManifestFromServer();
    const folderName = manifest.find(name => name === postId);
    return await this.fetchPostByFolderName(folderName || '');
  }

  async fetchPostsWithPagination(options: PaginationOptions): Promise<PaginatedResult<Post>> {
    const page = typeof options.page === 'number' ? options.page : 0;
    const limit = typeof options.limit === 'number' ? options.limit : 10;

    const manifest = await this.fetchManifestFromServer();
    const total = manifest.length;
    const startIndex = page * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const pageFolders = manifest.slice(startIndex, endIndex); 
    const pagePostsPromises = pageFolders.map(
      folderName => this.fetchPostByFolderName(folderName)
    );
    const pagePosts = (await Promise.all(pagePostsPromises))
      .filter((post): post is Post => post !== null);

    return {
      data: pagePosts,
      total,
      page,
      limit,
      hasMore: endIndex < total
    };
  }

  abstract fetchManifestFromServer(): Promise<string[]>;
  abstract fetchPostByFolderName(folderName: string): Promise<Post | null>;
}

export default Service;
