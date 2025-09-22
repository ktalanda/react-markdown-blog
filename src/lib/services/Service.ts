import Post from '../Post';
import parseFolderName from './parseFolderName';

export type ServiceType =
  | { source: 'cdn'; url: string }
  | { source: 'mock' };

export interface ManifestItem {
  folder: string;
  tags: string[];
}

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
    const blogFolders = manifest.filter(item => parseFolderName(item.folder) !== null);
    const postsWithContent = await Promise.all(
      blogFolders.map(async (item) => await this.fetchPostByFolderName(item.folder))
    );
    return postsWithContent.filter((post): post is Post => post !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async fetchPostById(postId: string): Promise<Post | null> {
    const manifest = await this.fetchManifestFromServer();
    const item = manifest.find(item => item.folder === postId);
    return await this.fetchPostByFolderName(item?.folder || '');
  }

  async fetchPostsWithPagination(options: PaginationOptions, tags: string[] = []): Promise<PaginatedResult<Post>> {
    const page = typeof options.page === 'number' ? options.page : 0;
    const limit = typeof options.limit === 'number' ? options.limit : 10;

    const manifest = await this.fetchManifestFromServer();
    const filteredManifest = tags.length > 0
      ? manifest.filter(item => item.tags.some(tag => tags.includes(tag)))
      : manifest;
    const total = filteredManifest.length;
    const startIndex = page * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const pageFolders = filteredManifest.slice(startIndex, endIndex);
    const pagePostsPromises = pageFolders.map(
      item => this.fetchPostByFolderName(item.folder)
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

  async getAllTags(): Promise<string[]> {
    const manifest = await this.fetchManifestFromServer();
    const allTags = manifest.flatMap(item => item.tags);
    return Array.from(new Set(allTags)).sort();
  }

  abstract fetchManifestFromServer(): Promise<ManifestItem[]>;
  abstract fetchPostByFolderName(folderName: string): Promise<Post | null>;
}

export default Service;
