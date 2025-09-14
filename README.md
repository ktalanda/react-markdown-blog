
# react-markdown-blog ![CI](https://github.com/ktalanda/react-markdown-blog/actions/workflows/publish.yml/badge.svg?branch=main)

`react-markdown-blog` is a React component library for hosting a blog with posts written in Markdown. It supports blog content stored in S3 or locally (mock), and renders posts with full Markdown and code highlighting support.

## S3 Blog Format

When using S3 as the backend, your bucket should have the following structure:

```
250101/content.md
250202/content.md
manifest.json
```

- Each folder (e.g. `250101`) represents a post, where the name is the date in `YYMMDD` format.
- Each folder contains a `content.md` file with the Markdown content.
- `manifest.json` is a JSON array listing all post folder names (e.g. `["250101", "250202"]`).

## Usage

You must wrap the blog in a `react-router-dom` router. Here is a sample usage from `src/App.tsx`:

- S3 - renders the blog hosted in S3 bucket.
```tsx
    <BrowserRouter>
      <Routes>
        ...
        <Route path="/blog/*" element={<Blog serviceType={{ source: 's3', bucket: '{bucket_url}' } as ServiceType} footerName="Sample Blog" />} />
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

## Features
- Renders Markdown blog posts with code highlighting
- Supports S3 and local/mock backends
- Date-based folder structure for posts
- Easy integration with React Router
