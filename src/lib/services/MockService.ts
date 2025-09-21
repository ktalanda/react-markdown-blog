import Post from '../Post';
import Service from './Service';

// Generate 15 sample posts (5 per page for 3 pages)
const generateSamplePosts = (): Post[] => {
  const posts: Post[] = [];
  
  // Create 15 posts with different dates
  for (let i = 1; i <= 15; i++) {
    // Calculate date: newest posts first
    const date = new Date();
    date.setDate(date.getDate() - i * 2); // Posts every 2 days
    
    posts.push(
      new Post({
        name: `Post ${i}`,
        date: date,
        content: `# Post ${i}\n\nThis is the content of post ${i}.\nIt supports **Markdown** formatting!\n\n${
          i % 3 === 0 ? '## Code Example\n\n```js\nconsole.log("Hello from post ' + i + '!");\n```' : ''
        }`,
        folder: `post-${i}`,
        tags: i %  3 === 0 ? ['code'] : i % 2 === 0 ? ['surfing', 'other'] : []
      })
    );
  }
  
  return posts;
};

const samplePosts = generateSamplePosts();

class MockService extends Service {
  fetchManifestFromServer(): Promise<string[]> {
    return Promise.resolve(samplePosts.map(post => post.folder));
  }

  async fetchPostByFolderName(folderName: string): Promise<Post | null> {
    const post = samplePosts.find(post => post.folder === folderName);
    return Promise.resolve(post || null);
  }
}

export default MockService;
