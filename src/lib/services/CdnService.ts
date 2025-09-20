import Post from '../Post';
import Service, { type PaginationOptions, type PaginatedResult } from './Service';
import parseFolderName from './parseFolderName';

class CdnService implements Service {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

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

  private async fetchManifestFromServer(): Promise<string[]> {
    const manifestResponse = await fetch(`${this.url}/manifest.json`);
    const manifest = await manifestResponse.json() as string[];
    return manifest
      .filter(name => parseFolderName(name) !== null)
      .sort((a, b) => {
        const dateA = parseFolderName(a)?.date.getTime() || 0;
        const dateB = parseFolderName(b)?.date.getTime() || 0;
        return dateB - dateA;
      });
  }

  private async fetchPostByFolderName(folderName: string): Promise<Post | null> {
    if (!folderName) return null;
    const contentResponse = await fetch(`${this.url}/${folderName}/content.md`);
    if (!contentResponse.ok) return null;

    const parsed = parseFolderName(folderName);
    const content = await contentResponse.text();
    if (!parsed) return null;
    return new Post({
      name: folderName,
      date: parsed.date,
      content: content,
      folder: folderName
    });
  }
}

export default CdnService;
