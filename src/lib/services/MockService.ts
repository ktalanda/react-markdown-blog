import Post from "../Post";
import Service from "./Service";

const samplePosts: Post[] = [
  new Post({
    name: "First Post",
    date: new Date("2025-09-01"),
    content: "# First Post\nThis is the content of the first post.\nIt supports **Markdown** formatting!",
    folder: "first-post"
  }),
  new Post({
    name: "Second Post",
    date: new Date("2025-09-10"),
    content: "# Second Post\nHere is some more content for the second post.\nEnjoy reading!",
    folder: "second-post"
  }),
  new Post({
    name: "Third Post",
    date: new Date("2025-09-14"),
    content: "# Third Post\nThis is the third sample blog post.\nStay tuned for more!",
    folder: "third-post"
  })
];

class MockService implements Service {
  async fetchBlogPosts(): Promise<Post[]> {
    return samplePosts;
  }

  async fetchBlogPostById(postId: string): Promise<Post | null> {
    const post = samplePosts.find(post => post.folder === postId);
    return post || null;
  }
}

export default MockService;
