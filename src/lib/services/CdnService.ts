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
    const rawData = await manifestResponse.json() as string[] | Array<{folder: string; tags: string[]}>;
    
    if (Array.isArray(rawData) && rawData.length > 0) {
      if (typeof rawData[0] === 'string') {
        return this.parseLegacyManifest(rawData as string[]);
      } else {
        return this.parseModernManifest(rawData as Array<{folder: string; tags: string[]}>);
      }
    }
    return [];
  }
  
  /**
   * @deprecated Parse legacy string[] format manifest
   */
  private parseLegacyManifest(manifest: string[]): ManifestItem[] {
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
  
  private parseModernManifest(manifest: Array<{folder: string; tags: string[]}>): ManifestItem[] {
    return manifest
      .filter(item => parseFolderName(item.folder) !== null)
      .sort((a, b) => {
        const dateA = parseFolderName(a.folder)?.date.getTime() || 0;
        const dateB = parseFolderName(b.folder)?.date.getTime() || 0;
        return dateB - dateA;
      })
      .map(item => ({
        folder: item.folder,
        tags: item.tags || []
      }));
  }

  async fetchPostByFolderName(item: ManifestItem): Promise<Post | null> {
    if (!item) return null;
    if (!item.folder) return null;
    const contentResponse = await fetch(`${this.url}/${item.folder}/content.md`);
    if (!contentResponse.ok) return null;

    const parsed = parseFolderName(item.folder);
    const content = await contentResponse.text();
    if (!parsed) return null;
    return new Post({
      name: item.folder,
      date: parsed.date,
      content: content,
      folder: item.folder,
      tags: item.tags || []
    });
  }
}

export default CdnService;
