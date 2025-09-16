import Post from "../Post";
import Service from "./Service";
import parseFolderName from "./parseFolderName";

class S3Service implements Service {
  private readonly bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async fetchBlogPosts(): Promise<Post[]> {
    try {
      const manifest = await this.fetchManifestFromServer();
      const blogFolders = manifest.filter(name => parseFolderName(name) !== null);
      const postsWithContent = await Promise.all(
        blogFolders.map(async (folderName) => {
          try {
            const contentResponse = await fetch(
              `${this.bucket}/${folderName}/content.md`
            );
            if (!contentResponse.ok) {
              return null;
            }
            const content = await contentResponse.text();
            const parsed = parseFolderName(folderName)!;
            return new Post({
              name: folderName,
              date: parsed.date,
              content: content,
              folder: folderName
            });
          } catch {
            return null;
          }
        })
      );
      return postsWithContent.filter((post): post is Post => post !== null)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch {
      throw new Error('Failed to fetch blog posts from S3');
    }
  }

  async fetchBlogPostById(postId: string): Promise<Post | null> {
    try {
      const manifest = await this.fetchManifestFromServer();
      const folderName = manifest.find(name => name === postId);
      if (!folderName) return null;
      const contentResponse = await fetch(
        `${this.bucket}/${folderName}/content.md`
      );
      if (!contentResponse.ok) return null;
      const content = await contentResponse.text();
      const parsed = parseFolderName(folderName)!;
      return new Post({
        name: folderName,
        date: parsed.date,
        content: content,
        folder: folderName
      });
    } catch {
      throw new Error('Failed to fetch blog post from S3');
    }
  }

  private async fetchManifestFromServer(): Promise<string[]> {
    const manifestResponse = await fetch(`${this.bucket}/manifest.json`);
    return await manifestResponse.json();
  }
}

export default S3Service;
