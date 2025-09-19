import Post from '../Post';
import Service from './Service';
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

  private async fetchManifestFromServer(): Promise<string[]> {
    const manifestResponse = await fetch(`${this.url}/manifest.json`);
    return await manifestResponse.json() as string[];
  }
}

export default CdnService;
