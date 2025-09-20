import Post from '../Post';
import Service, { type PaginationOptions, type PaginatedResult } from './Service';

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
        folder: `post-${i}`
      })
    );
  }
  
  return posts;
};

const samplePosts = generateSamplePosts();

class MockService implements Service {
  async fetchPosts(): Promise<Post[]> {
    // Simulate network delay of 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    return samplePosts;
  }

  async fetchPostById(postId: string): Promise<Post | null> {
    // Simulate network delay of 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    const post = samplePosts.find(post => post.folder === postId);
    return post || null;
  }

  async fetchPostsWithPagination(options: PaginationOptions): Promise<PaginatedResult<Post>> {
    // Simulate network delay of 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { page, limit } = options;
    
    // Calculate pagination indices
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    
    // Get posts for the current page
    const paginatedPosts = samplePosts.slice(startIndex, endIndex);
    
    return {
      data: paginatedPosts,
      total: samplePosts.length,
      page,
      limit,
      hasMore: endIndex < samplePosts.length
    };
  }
}

export default MockService;
