/**
 * Shared plumbing for the blog photo viewers (zoom-in-place, carousel,
 * story): group detection over the rendered article, viewport helpers, and
 * the small bits of chrome every viewer uses.
 *
 * Detection contract: BlogImage renders a top-level <figure> containing an
 * <img>, ImageRow renders a top-level <div> whose children are such
 * <figure>s, both as direct children of the `.blog` prose container. Any
 * other element (paragraph, heading, BlogVideo, TripStats) breaks a group.
 * Plain markdown images (<p><img></p>) are intentionally not included.
 */
import { useEffect, useRef, useState } from 'preact/hooks'

export type Item = {
  img: HTMLImageElement
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

export function itemsIn(el: Element): Item[] {
  const figures =
    el.tagName === 'FIGURE'
      ? [el]
      : el.tagName === 'DIV'
        ? Array.from(el.children).filter((c) => c.tagName === 'FIGURE')
        : []
  if (figures.length === 0) return []
  const items: Item[] = []
  for (const fig of figures) {
    const img = fig.querySelector('img')
    if (!img) return []
    const link = img.closest('a')
    items.push({
      img,
      caption:
        fig.querySelector('figcaption')?.textContent?.trim() || undefined,
      alt: img.alt,
      url: link && fig.contains(link) ? link.href : undefined,
    })
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

export function srcOf(img: HTMLImageElement) {
  return img.currentSrc || img.src
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

export function fitTo(img: HTMLImageElement, maxW: number, maxH: number) {
  const nw = img.naturalWidth || img.width || 1
  const nh = img.naturalHeight || img.height || 1
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
