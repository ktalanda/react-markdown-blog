import S3Service from './CdnService';
import Post from '../Post';

// Mock global fetch
global.fetch = jest.fn();

describe('S3Service', () => {
  let s3Service: S3Service;
  const mockBaseUrl = 'https://example-bucket.s3.amazonaws.com';
  
  beforeEach(() => {
    jest.resetAllMocks();
    s3Service = new S3Service(mockBaseUrl);
  });

  describe('fetchBlogPosts', () => {
    it('should return sorted blog posts when manifest and content are successfully fetched', async () => {
      // Mock manifest response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['230101', '230202', '230303'])
        })
      );

      // Mock content responses for each post
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Post 1 content')
        })
      );
      
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Post 2 content')
        })
      );
      
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Post 3 content')
        })
      );

      // Act
      const posts = await s3Service.fetchPosts();

      // Assert
      expect(posts).toHaveLength(3);
      
      // Check if sorted by date (newest first)
      expect(posts[0].folder).toBe('230303');
      expect(posts[1].folder).toBe('230202');
      expect(posts[2].folder).toBe('230101');

      // Verify fetch calls
      expect(fetch).toHaveBeenCalledTimes(4);
      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/manifest.json`);
      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/230101/content.md`);
      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/230202/content.md`);
      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/230303/content.md`);
    });

    it('should filter out folders that do not match the expected naming pattern', async () => {
      // Mock manifest response with invalid folder names
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['230101', 'invalid-folder-name', '230202'])
        })
      );

      // Mock content responses
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Post 1 content')
        })
      );
      
      // This will be called for the invalid folder, but will be filtered out
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Invalid post content')
        })
      );
      
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Post 3 content')
        })
      );

      // Act
      const posts = await s3Service.fetchPosts();

      // Assert
      expect(posts).toHaveLength(2);
      expect(posts[0].folder).toBe('230202');
      expect(posts[1].folder).toBe('230101');
    });

    it('should filter out posts that fail to fetch content', async () => {
      // Mock manifest response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['230101', '230202'])
        })
      );

      // Mock content response - first succeeds, second fails
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Post 1 content')
        })
      );
      
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: false
        })
      );

      // Act
      const posts = await s3Service.fetchPosts();

      // Assert
      expect(posts).toHaveLength(1);
      expect(posts[0].folder).toBe('230101');
    });
  });

  describe('fetchBlogPostById', () => {
    it('should return a post when it exists in the manifest and content is successfully fetched', async () => {
      const postId = '230101';
      
      // Mock manifest response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['230101', '230202'])
        })
      );

      // Mock content response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Post 1 content')
        })
      );

      // Act
      const post = await s3Service.fetchPostById(postId);

      // Assert
      expect(post).toBeInstanceOf(Post);
      expect(post?.folder).toBe(postId);
      expect(post?.content).toBe('# Post 1 content');
      expect(post?.date).toEqual(new Date(2023, 0, 1));
      
      // Verify fetch calls
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/manifest.json`);
      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/${postId}/content.md`);
    });

    it('should return null when post ID is not found in manifest', async () => {
      const postId = 'non-existent-post';
      
      // Mock manifest response without the requested post
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['230101', '230202'])
        })
      );

      // Act
      const post = await s3Service.fetchPostById(postId);

      // Assert
      expect(post).toBeNull();
      
      // Verify only manifest was fetched
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/manifest.json`);
    });

    it('should return null when content fetch fails', async () => {
      const postId = '230101';
      
      // Mock manifest response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['230101', '230202'])
        })
      );

      // Mock failed content response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: false
        })
      );

      // Act
      const post = await s3Service.fetchPostById(postId);

      // Assert
      expect(post).toBeNull();
    });

    it('should return null when folder name cannot be parsed', async () => {
      const postId = 'invalid-folder-name';
      
      // Mock manifest response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['invalid-folder-name'])
        })
      );

      // Mock content response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Content')
        })
      );

      // Act
      const post = await s3Service.fetchPostById(postId);

      // Assert
      expect(post).toBeNull();
    });
  });

  describe('fetchPostByFolderName', () => {
    it('should return null for empty folder name', async () => {
      // Act
      // @ts-expect-error - Testing private method
      const post = await s3Service.fetchPostByFolderName('');

      // Assert
      expect(post).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should create a valid Post object from a valid folder name', async () => {
      const folderName = '230101';
      
      // Mock content response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Test content')
        })
      );

      // Act
      // @ts-expect-error - Testing private method 
      const post = await s3Service.fetchPostByFolderName(folderName);

      // Assert
      expect(post).toBeInstanceOf(Post);
      expect(post?.name).toBe(folderName);
      expect(post?.folder).toBe(folderName);
      expect(post?.content).toBe('# Test content');
      expect(post?.date).toEqual(new Date(2023, 0, 1));
    });
  });
});
