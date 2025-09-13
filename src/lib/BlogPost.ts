export class BlogPost {
  readonly name: string;
  readonly date: Date;
  readonly content: string;
  readonly folder: string;

  constructor(data: {
    name: string;
    date: Date;
    content: string;
    folder: string;
  }) {
    if (!data.name?.trim()) throw new Error('BlogPost name is required');
    if (!data.content?.trim()) throw new Error('BlogPost content is required');
    if (!data.folder?.trim()) throw new Error('BlogPost folder is required');
    if (!(data.date instanceof Date) || isNaN(data.date.getTime())) {
      throw new Error('BlogPost date must be a valid Date');
    }

    this.name = data.name;
    this.date = new Date(data.date);
    this.content = data.content;
    this.folder = data.folder;
  }

  getPreview(maxLength: number = 300): string {
    return this.content.length > maxLength 
      ? this.content.substring(0, maxLength) + '...' 
      : this.content;
  }

  getFormattedDate(): string {
      return this.date.toLocaleDateString('en-UK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  }
}

export default BlogPost;
