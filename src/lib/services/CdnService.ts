import Post from '../Post';
import Service, { type ManifestItem } from './Service';
import parseFolderName from './parseFolderName';

class CdnService extends Service {
  private readonly url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }

  async fetchManifestFromServer(): Promise<ManifestItem[]> {
    const manifestResponse = await fetch(`${this.url}/manifest.json`);
    const manifest = await manifestResponse.json() as string[];
    return manifest
      .filter(name => parseFolderName(name) !== null)
      .sort((a, b) => {
        const dateA = parseFolderName(a)?.date.getTime() || 0;
        const dateB = parseFolderName(b)?.date.getTime() || 0;
        return dateB - dateA;
      })
      .map(item => ({
        folder: item,
        tags: []
      }));
  }

  async fetchPostByFolderName(folderName: string): Promise<Post | null> {
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
      folder: folderName,
      tags:[]
    });
  }
}

export default CdnService;
