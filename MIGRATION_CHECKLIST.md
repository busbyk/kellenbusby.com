# Migration Checklist: Tailwind 4 + pnpm + Dark Mode

This checklist helps you port the theme/style system from `nextjs-rewrite` to your Remix architecture on `main`.

---

## 1. Switch to pnpm

```bash
# From the main branch
npm install -g pnpm

# Create .npmrc
echo "shamefully-hoist=true" > .npmrc

# Import existing lockfile and install
pnpm import
rm package-lock.json  # or yarn.lock
pnpm install
```

Update `package.json` scripts if needed (they should work as-is).

---

## 2. Upgrade to Tailwind CSS v4

### Install new packages

```bash
pnpm remove tailwindcss autoprefixer @tailwindcss/typography @tailwindcss/aspect-ratio
pnpm add tailwindcss@^4 @tailwindcss/postcss
pnpm add -D @tailwindcss/typography
```

### Update `postcss.config.cjs`

Replace contents with:

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### Delete `tailwind.config.ts`

Tailwind v4 uses CSS-based configuration. Delete the config file - all theming moves to your CSS.

---

## 3. Replace `app/styles/tailwind.css`

Replace your existing `tailwind.css` with this new CSS-based config:

```css
@import 'tailwindcss';
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: 'Rubik', 'sans-serif';

  /* Light mode colors (default) */
  --color-background: #fcf8ff;
  --color-foreground: #1e293b;
  --color-muted: #475569;
  --color-border: #e2dfe5;

  /* Primary colors */
  --color-primary: #7fb3c8;
  --color-primary-foreground: #0f172a;
  --color-primary-hover: #6ba3c0;

  /* Secondary colors */
  --color-secondary: #5d3b60;
  --color-secondary-foreground: #ffffff;
  --color-secondary-hover: #6d4b70;

  /* Accent colors */
  --color-accent: #f59432;
  --color-accent-foreground: #ffffff;
  --color-accent-hover: #e4634a;

  /* Card and surface colors */
  --color-card: #ffffff;
  --color-card-foreground: #1e293b;
}

/* Dark mode overrides */
.dark {
  --color-background: #0f172a;
  --color-foreground: #f1f5f9;
  --color-muted: #94a3b8;
  --color-border: #334155;

  --color-primary: oklch(0.5614 0.1004 223.51);
  --color-primary-foreground: #ffffff;
  --color-primary-hover: #6ba3c0;

  --color-secondary: #837184;
  --color-secondary-foreground: #f1f5f9;
  --color-secondary-hover: #937294;

  --color-accent: #f59432;
  --color-accent-foreground: #0f172a;
  --color-accent-hover: #e4634a;

  --color-card: #1e293b;
  --color-card-foreground: #f1f5f9;
}

@layer base {
  * {
    border-color: var(--color-border);
  }

  html {
    @apply min-h-screen w-screen overflow-x-hidden;
  }

  body {
    margin: 0 auto;
    color: var(--color-foreground);
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }

  p, h1, h2, h3, h4, h5, h6, div, span {
    color: inherit;
  }

  button:not(:disabled),
  [role='button']:not(:disabled) {
    cursor: pointer;
  }
}

@layer components {
  @media screen(md) {
    .slide-in-background-from-right::before {
      @apply bg-primary absolute inset-0 rounded-md translate-x-[110%] hover:translate-x-0 transition-transform duration-500 ease-in-out;
      content: '';
      z-index: -1;
    }

    .slide-in-background-from-left::before {
      @apply bg-primary absolute inset-0 rounded-md -translate-x-[110%] hover:translate-x-0 transition-transform duration-500 ease-in-out;
      content: '';
      z-index: -1;
    }
  }

  .blog img {
    @apply rounded-md shadow-xl;
  }
}
```

---

## 4. Add Dark Mode Components

### Create `app/components/ThemeProvider.tsx`

```tsx
'use client'

import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return <>{children}</>
}
```

### Create `app/components/DarkModeToggle.tsx`

```tsx
import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)

    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative h-8 w-8 rounded-full bg-card border-border border transition-colors duration-200 ease-in-out hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark != null && (
        <>
          {/* Sun icon - slides in from left when light mode */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out ${
              isDark ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Moon icon - slides in from right when dark mode */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out ${
              isDark ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </div>
        </>
      )}
    </button>
  )
}
```

---

## 5. Update `app/root.tsx`

Add the inline script to prevent flash of incorrect theme, and wrap with ThemeProvider:

```tsx
import ThemeProvider from './components/ThemeProvider'

// In your Document component, add this script in <head>:
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          var theme = localStorage.getItem('theme');
          var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

          if (theme === 'dark' || (!theme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (e) {}
      })();
    `,
  }}
/>

// Add suppressHydrationWarning to <html>:
<html lang="en" suppressHydrationWarning>

// Update <body> classes:
<body className="flex min-h-screen w-screen flex-col overflow-x-clip bg-background text-foreground">
  <ThemeProvider>
    {/* your existing content */}
  </ThemeProvider>
</body>
```

---

## 6. Update Color Class Names

Replace old theme color classes with new semantic names:

| Old Class | New Class |
|-----------|-----------|
| `bg-theme-white` | `bg-background` |
| `text-theme-gray-default` | `text-foreground` |
| `text-theme-gray-mid` | `text-muted` |
| `bg-theme-blue-default` | `bg-primary` |
| `bg-theme-blue-light` | `bg-primary` (or adjust) |
| `text-theme-blue-light` | `text-primary` |
| `bg-theme-purple-default` | `bg-secondary` |
| `bg-theme-purple-light` | `bg-secondary` |
| `bg-theme-orange-default` | `bg-accent` |
| `bg-theme-orange-light` | `bg-accent` |

For hover states, use the hover variants:
- `hover:bg-primary-hover`
- `hover:bg-secondary-hover`
- `hover:bg-accent-hover`

---

## 7. Add DarkModeToggle to Layout

In your `MainLayout` or header component:

```tsx
import DarkModeToggle from '../DarkModeToggle'

// Add to your header/nav:
<DarkModeToggle />
```

---

## 8. Verification Checklist

- [ ] `pnpm dev` runs without errors
- [ ] Tailwind classes compile correctly
- [ ] Light mode displays correctly
- [ ] Dark mode toggle works
- [ ] Theme persists across page refreshes
- [ ] No flash of incorrect theme on initial load
- [ ] System preference is respected when no saved preference

---

## Color Mapping Reference

Your old colors map to the new semantic system like this:

```
theme-white (#FCF8FF)     → background (light)
theme-gray-default        → foreground
theme-gray-mid/light      → muted
theme-blue-light (#7FB3C8)→ primary
theme-blue-default        → primary-hover
theme-purple-default      → secondary
theme-purple-light        → secondary (dark mode)
theme-orange-light        → accent
theme-orange-default      → accent-hover
```
