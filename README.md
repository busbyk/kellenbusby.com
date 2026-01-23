# kellenbusby.com

## Scripts

### Create a new blog post

```bash
pnpm new-post "My Post Title"
```

Creates a new blog post directory with MDX template at `src/content/blog/my-post-title/index.mdx`.

### Generate social images

```bash
# Generate OG and Instagram images for a specific post
pnpm social-image cardonomics

# Generate for all posts
pnpm social-image --all

# Regenerate (overwrite existing)
pnpm social-image --all --force

# Generate only OG images (1200x630)
pnpm social-image cardonomics --og-only

# Generate only Instagram images (1080x1350)
pnpm social-image cardonomics --instagram-only
```

Images are saved to:
- `public/og/{slug}.png` - Open Graph / Twitter cards
- `public/instagram/{slug}.png` - Instagram posts

Blog posts automatically use the generated OG images in their meta tags.
