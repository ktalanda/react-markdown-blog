# react-markdown-blog [![Publish to npm](https://github.com/ktalanda/react-markdown-blog/actions/workflows/publish.yml/badge.svg)](https://github.com/ktalanda/react-markdown-blog/actions/workflows/publish.yml)

`react-markdown-blog` is a React component library for hosting a blog with posts written in Markdown. It supports blog content served via CDN or locally (mock), and renders posts with full Markdown and code highlighting support.

## Content Structure

When using a CDN to serve your blog content, your storage should have the following structure:

```
250101/content.md
250202/content.md
manifest.json
```

- Each folder (e.g. `250101`) represents a post, where the name is the date in `YYMMDD` format.
- Each folder contains a `content.md` file with the Markdown content.
- `manifest.json` contains a list of all post entries in one of two formats:

### Enhanced Format
An array of objects with folder and tags:
```json
[
  {"folder": "250101", "tags": ["react", "typescript"]},
  {"folder": "250202", "tags": ["css", "design"]}
]
```

The enhanced format allows for tag-based filtering of posts in the UI.

## Usage

You must wrap the blog in a `react-router-dom` router. Here is a sample usage from `src/App.tsx`:

- CDN - renders the blog provided by url.
```tsx
    <BrowserRouter>
      <Routes>
        ...
        <Route path="/blog/*" element={<Blog serviceType={{ source: 'cdn', url: '{your_cdn_url}' } as ServiceType} footerName="Sample Blog" />} />
      </Routes>
    </BrowserRouter>
```

- Mock - for testing only.
```tsx
    <BrowserRouter>
      <Routes>
        ...
        <Route path="/blog/*" element={<Blog serviceType={{ source: 'mock' } as ServiceType} footerName="Sample Blog" />} />
      </Routes>
    </BrowserRouter>
```

## Example Setup

You can see a live example of this library in action at [wavecoder.com.au/blog](https://wavecoder.com.au/blog).

The source repository showing the proper folder structure for blog posts can be found here:
[github.com/ktalanda/wavecoder-blog](https://github.com/ktalanda/wavecoder-blog/tree/main/posts)

This example demonstrates:
1. The correct folder naming structure with dates
2. Markdown content files
3. Manifest file with tags
4. How to deploy the content to a CDN

## Features
- Renders Markdown blog posts with code highlighting
- Supports content served via CDN or mock data for local development
- Tag-based filtering of blog posts
- Infinite scrolling with pagination
- Date-based folder structure for posts
- Easy integration with React Router
