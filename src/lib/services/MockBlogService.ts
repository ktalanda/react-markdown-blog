import BlogPost from "../BlogPost";
import BlogService from "./BlogService";

const sampleBlogPosts: BlogPost[] = [
  new BlogPost({
    name: "First Post",
    date: new Date("2025-09-01"),
    content: "# First Post\nThis is the content of the first post.\nIt supports **Markdown** formatting!",
    folder: "first-post"
  }),
  new BlogPost({
    name: "Second Post",
    date: new Date("2025-09-10"),
    content: "# Second Post\nHere is some more content for the second post.\nEnjoy reading!",
    folder: "second-post"
  }),
  new BlogPost({
    name: "Third Post",
    date: new Date("2025-09-14"),
    content: "# Third Post\nThis is the third sample blog post.\nStay tuned for more!",
    folder: "third-post"
  })
];

class MockBlogService implements BlogService {
  async fetchBlogPosts(): Promise<BlogPost[]> {
    return sampleBlogPosts;
  }

  async fetchBlogPostById(postId: string): Promise<BlogPost | null> {
    const post = sampleBlogPosts.find(post => post.folder === postId);
    return post || null;
  }
}

export default MockBlogService;
