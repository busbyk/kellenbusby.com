/**
 * Shared plumbing for the blog photo viewers (zoom-in-place, carousel,
 * story): group detection over the rendered article, viewport helpers, and
 * the small bits of chrome every viewer uses.
 *
 * Detection contract: BlogImage renders a top-level <figure> containing an
 * <img>, ImageRow renders a top-level <div> whose children are such
 * <figure>s, BlogVideo a top-level <figure> containing a native <video> —
 * all direct children of the `.blog` prose container. Any other element
 * (paragraph, heading, TripStats, a BlogVideo iframe embed) breaks a group.
 * Plain markdown images (<p><img></p>) are intentionally not included.
 */
import { useEffect, useRef, useState } from 'preact/hooks'

export type Media = HTMLImageElement | HTMLVideoElement

export type Item = {
  // the in-article element; source of truth for geometry and media src
  el: Media
  kind: 'image' | 'video'
  caption?: string
  alt: string
  url?: string
}

export type ViewerProps = {
  group: Item[]
  index: number
  setIndex: (i: number) => void
  onClose: () => void
}

export const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

// ---------- group detection ----------

// One item from a <figure>, or null if it holds no native media (e.g. a
// BlogVideo iframe embed) — such a figure breaks the surrounding group.
function figureItem(fig: Element): Item | null {
  const media = fig.querySelector<Media>('img, video')
  if (!media) return null
  const kind = media.tagName === 'VIDEO' ? 'video' : 'image'
  const link = media.closest('a')
  return {
    el: media,
    kind,
    caption: fig.querySelector('figcaption')?.textContent?.trim() || undefined,
    alt:
      kind === 'video'
        ? media.getAttribute('aria-label') || media.getAttribute('title') || ''
        : (media as HTMLImageElement).alt,
    url: link && fig.contains(link) ? link.href : undefined,
  }
}

export function itemsIn(el: Element): Item[] {
  const figures =
    el.tagName === 'FIGURE'
      ? [el]
      : el.tagName === 'DIV'
        ? Array.from(el.children).filter((c) => c.tagName === 'FIGURE')
        : []
  const items: Item[] = []
  for (const fig of figures) {
    const item = figureItem(fig)
    if (item) items.push(item)
  }
  return items
}

export function detectGroups(): Item[][] {
  const container = document.querySelector('.blog')
  if (!container) return []
  const groups: Item[][] = []
  let current: Item[] | null = null
  for (const child of Array.from(container.children)) {
    const items = itemsIn(child)
    if (items.length > 0) {
      if (!current) {
        current = []
        groups.push(current)
      }
      current.push(...items)
    } else {
      current = null
    }
  }
  return groups
}

// ---------- viewport / sizing helpers ----------

export function srcOf(el: Media) {
  return el.currentSrc || el.src
}

// intrinsic media dimensions, falling back to the rendered rect before the
// image decodes / video metadata loads
export function naturalSize(el: Media) {
  if (el.tagName === 'VIDEO') {
    const v = el as HTMLVideoElement
    if (v.videoWidth > 0) return { w: v.videoWidth, h: v.videoHeight }
  } else {
    const im = el as HTMLImageElement
    if (im.naturalWidth > 0) return { w: im.naturalWidth, h: im.naturalHeight }
  }
  const r = el.getBoundingClientRect()
  return { w: r.width || 1, h: r.height || 1 }
}

export function viewportSize() {
  return {
    w: window.visualViewport?.width ?? window.innerWidth,
    h: window.visualViewport?.height ?? window.innerHeight,
  }
}

export function isTouch() {
  return window.matchMedia('(pointer: coarse)').matches
}

export function fitTo(el: Media, maxW: number, maxH: number) {
  const { w: nw, h: nh } = naturalSize(el)
  const s = Math.min(maxW / nw, maxH / nh)
  return { width: Math.round(nw * s), height: Math.round(nh * s) }
}

// ---------- hooks ----------

export function useResizeBump() {
  const [, bump] = useState(0)
  useEffect(() => {
    const on = () => bump((n) => n + 1)
    window.addEventListener('resize', on)
    window.visualViewport?.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      window.visualViewport?.removeEventListener('resize', on)
    }
  }, [])
}

export function useScrollLock() {
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [])
}

// keyboard: Escape closes, ←/→ step
export function useViewerKeys(handlers: {
  step: (d: number) => void
  close: () => void
}) {
  const ref = useRef(handlers)
  ref.current = handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Escape') ref.current.close()
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        ref.current.step(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        ref.current.step(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

// ---------- chrome ----------

export function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="h-6 w-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
      />
    </svg>
  )
}

export function XIcon({ class: className = 'h-5 w-5' }: { class?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class={className}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}
