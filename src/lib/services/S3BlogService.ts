import BlogPost from "../BlogPost";
import BlogService from "./BlogService";

class S3BlogService implements BlogService {
  private readonly cdnUrl: string;

  constructor(cdnUrl: string) {
    this.cdnUrl = cdnUrl;
  }

  private parseFolderName(folderName: string): { date: Date; } | null {
    const dateStr = folderName;
    const year = 2000 + parseInt(dateStr.substring(0, 2));
    const month = parseInt(dateStr.substring(2, 4)) - 1; // Month is 0-based
    const day = parseInt(dateStr.substring(4, 6));

    console.log(`Parsing folder name: ${folderName}`);

    return {
      date: new Date(year, month, day),
    };
  }

  async fetchBlogPosts(): Promise<BlogPost[]> {
    try {
      const manifest = await this.fetchManifestFromServer();

      const blogFolders = manifest.filter(name => this.parseFolderName(name) !== null);

      const postsWithContent = await Promise.all(
        blogFolders.map(async (folderName) => {
          try {
            const contentResponse = await fetch(
              `${this.cdnUrl}/${folderName}/content.md`
            );
            
            if (!contentResponse.ok) {
              console.warn(`No content.md found in ${folderName}`);
              return null;
            }

            const content = await contentResponse.text();
            const parsed = this.parseFolderName(folderName)!;

            return new BlogPost({
              name: folderName,
              date: parsed.date,
              content: content,
              folder: folderName
            });
          } catch (error) {
            console.error(`Error fetching content for ${folderName}:`, error);
            return null;
          }
        })
      );

      // Filter out failed requests and sort by date descending
      const validPosts = postsWithContent
        .filter((post): post is BlogPost => post !== null)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      return validPosts;
    } catch (error) {
      console.error('Error fetching from S3BlogService:', error);
      throw new Error('Failed to fetch blog posts from S3');
    }
  }

  async fetchBlogPostById(postId: string): Promise<BlogPost | null> {
    try {
      const manifest = await this.fetchManifestFromServer();
      const folderName = manifest.find(name => name === postId);
      
      if (!folderName) {
        return null; // Post not found
      }

      const contentResponse = await fetch(
        `${this.cdnUrl}/${folderName}/content.md`
      );
      
      if (!contentResponse.ok) {
        console.warn(`No content.md found in ${folderName}`);
        return null;
      }

      const content = await contentResponse.text();
      const parsed = this.parseFolderName(folderName)!;

      return new BlogPost({
        name: folderName,
        date: parsed.date,
        content: content,
        folder: folderName
      });
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      throw new Error('Failed to fetch blog post from S3');
    }
  }

  private async fetchManifestFromServer(): Promise<string[]> {
    const manifestResponse = await fetch(`${this.cdnUrl}/manifest.json`);
    return await manifestResponse.json();
  }
}

export default S3BlogService;
