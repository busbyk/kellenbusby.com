/**
 * Group-scoped lightbox for blog post images.
 *
 * Clicking a photo lifts it out of the article into a centered viewer over a
 * translucent scrim (the photo's spot in the article goes empty while it's
 * "out"). Contiguous BlogImage/ImageRow elements with no prose between them
 * form a group: ←/→ steps within the group, and paging past either end
 * closes the viewer — the edge chevron renders as an ✕ to signal that.
 *
 * Detection contract: BlogImage renders a top-level <figure> containing an
 * <img>, ImageRow renders a top-level <div> whose children are such
 * <figure>s, both as direct children of the `.blog` prose container. Any
 * other element (paragraph, heading, BlogVideo, TripStats) breaks a group.
 * Plain markdown images (<p><img></p>) are intentionally not included.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

type Item = {
  img: HTMLImageElement
  caption?: string
  alt: string
  url?: string
}

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

// ---------- group detection ----------

function itemsIn(el: Element): Item[] {
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

function detectGroups(): Item[][] {
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

// ---------- animation helpers ----------

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function rectTransform(from: DOMRect, to: DOMRect) {
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`
}

function flipIn(el: HTMLElement, from: DOMRect) {
  if (reducedMotion()) {
    return el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 })
  }
  el.style.transformOrigin = 'top left'
  return el.animate(
    [
      { transform: rectTransform(from, el.getBoundingClientRect()) },
      { transform: 'none' },
    ],
    { duration: 320, easing: EASE },
  )
}

function flipOut(el: HTMLElement, to: DOMRect) {
  if (reducedMotion()) {
    return el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 150,
      fill: 'forwards',
    })
  }
  el.style.transformOrigin = 'top left'
  return el.animate(
    [
      { transform: 'none' },
      { transform: rectTransform(to, el.getBoundingClientRect()) },
    ],
    { duration: 280, easing: EASE, fill: 'forwards' },
  )
}

// Explicit pixel size so the overlay <img> has a known rect before load
function fitSize(img: HTMLImageElement, wFrac: number, hFrac: number) {
  const nw = img.naturalWidth || img.width || 1
  const nh = img.naturalHeight || img.height || 1
  const s = Math.min(
    (window.innerWidth * wFrac) / nw,
    (window.innerHeight * hFrac) / nh,
  )
  return { width: Math.round(nw * s), height: Math.round(nh * s) }
}

function srcOf(img: HTMLImageElement) {
  return img.currentSrc || img.src
}

// ---------- chrome ----------

function Chevron({ dir }: { dir: 'left' | 'right' }) {
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

function XIcon() {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

// At the group edge the chevron becomes an ✕ — paging past the end closes
function NavButton(props: {
  side: 'left' | 'right'
  atEdge: boolean
  onClick: () => void
}) {
  const pos = props.side === 'left' ? 'left-3 md:left-6' : 'right-3 md:right-6'
  return (
    <button
      data-chrome
      aria-label={
        props.atEdge
          ? 'Close'
          : props.side === 'left'
            ? 'Previous image'
            : 'Next image'
      }
      class={`absolute top-1/2 -translate-y-1/2 ${pos} rounded-full p-2.5 transition-opacity duration-150 bg-card/85 text-foreground border border-border/60 shadow-md hover:bg-card`}
      onClick={(e) => {
        e.stopPropagation()
        props.onClick()
      }}
    >
      {props.atEdge ? <XIcon /> : <Chevron dir={props.side} />}
    </button>
  )
}

// ---------- viewer ----------

type ViewerProps = {
  group: Item[]
  index: number
  setIndex: (i: number) => void
  onClose: () => void
}

function SpotlightViewer({ group, index, setIndex, onClose }: ViewerProps) {
  const item = group[index]
  const rootRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const prevIndex = useRef(index)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const openedFrom = useRef<DOMRect | null>(null)
  if (!openedFrom.current) openedFrom.current = item.img.getBoundingClientRect()

  // lock page scroll while open
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [])

  // the photo "lifts out" — keep its article spot empty while viewing
  useEffect(() => {
    item.img.style.visibility = 'hidden'
    return () => {
      item.img.style.visibility = ''
    }
  }, [item])

  // move focus into the dialog, restore on close
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    rootRef.current?.focus()
    return () => prev?.focus?.()
  }, [])

  // entrance: FLIP up from the clicked image's spot
  useLayoutEffect(() => {
    if (imgRef.current && openedFrom.current)
      flipIn(imgRef.current, openedFrom.current)
    scrimRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 240,
      easing: 'ease-out',
    })
  }, [])

  // directional crossfade when stepping within the group
  useLayoutEffect(() => {
    if (prevIndex.current === index) return
    const dir = index > prevIndex.current ? 1 : -1
    prevIndex.current = index
    const slide = reducedMotion()
      ? 'none'
      : `translateX(${dir * 32}px) scale(0.985)`
    imgRef.current?.animate(
      [
        { opacity: 0, transform: slide },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 240, easing: EASE },
    )
  }, [index])

  // upgrade the overlay to a higher-res srcset candidate once it's decoded
  const [hiRes, setHiRes] = useState<string | null>(null)
  useEffect(() => {
    setHiRes(null)
    const source = item.img
    if (!source.srcset) return
    let cancelled = false
    const probe = new Image()
    probe.srcset = source.srcset
    probe.sizes = '92vw'
    probe
      .decode()
      .then(() => {
        if (
          !cancelled &&
          probe.currentSrc &&
          probe.currentSrc !== srcOf(source)
        ) {
          setHiRes(probe.currentSrc)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [item])

  // refit the image when the viewport changes
  const [, bumpViewport] = useState(0)
  useEffect(() => {
    const onResize = () => bumpViewport((n) => n + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const requestClose = () => {
    if (closing.current) return
    closing.current = true
    const el = imgRef.current
    if (!el) return onClose()
    scrimRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 240,
      easing: 'ease-in',
      fill: 'forwards',
    })
    rootRef.current
      ?.querySelectorAll<HTMLElement>('[data-chrome]')
      .forEach((n) => {
        n.style.opacity = '0'
      })
    flipOut(el, item.img.getBoundingClientRect()).onfinish = onClose
  }

  const step = (delta: number) => {
    if (closing.current) return
    const next = index + delta
    if (next < 0 || next >= group.length) requestClose()
    else setIndex(next)
  }

  // keyboard: Escape closes, ←/→ step (and close past the group edge)
  const keys = useRef({ step, requestClose })
  keys.current = { step, requestClose }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Escape') keys.current.requestClose()
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        keys.current.step(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        keys.current.step(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const size = fitSize(item.img, 0.92, 0.85)

  return (
    <div
      ref={rootRef}
      tabindex={-1}
      class="fixed inset-0 z-[150] outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onTouchStart={(e) => {
        const t = e.touches[0]
        touchStart.current = { x: t.clientX, y: t.clientY }
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current
        touchStart.current = null
        if (!start) return
        const t = e.changedTouches[0]
        const dx = t.clientX - start.x
        const dy = t.clientY - start.y
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5)
          step(dx < 0 ? 1 : -1)
      }}
    >
      <div
        ref={scrimRef}
        class="absolute inset-0 bg-background/75"
        onClick={requestClose}
      />
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          ref={imgRef}
          src={hiRes ?? srcOf(item.img)}
          alt={item.alt}
          style={{ width: `${size.width}px`, height: `${size.height}px` }}
          class="rounded-md shadow-2xl pointer-events-auto cursor-zoom-out"
          onClick={requestClose}
        />
      </div>
      {(item.url || group.length === 1) && (
        <div
          data-chrome
          class="absolute top-4 right-4 flex items-center gap-2 transition-opacity duration-150"
        >
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open linked page"
              class="rounded-full p-2.5 bg-card/85 text-foreground border border-border/60 shadow-md hover:bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
          {group.length === 1 && (
            <button
              aria-label="Close"
              class="rounded-full p-2.5 bg-card/85 text-foreground border border-border/60 shadow-md hover:bg-card"
              onClick={(e) => {
                e.stopPropagation()
                requestClose()
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      <div
        data-chrome
        class="absolute bottom-5 inset-x-0 flex flex-col items-center gap-1 pointer-events-none transition-opacity duration-150"
      >
        {item.caption && (
          <p class="text-sm text-foreground/90 text-center px-4">
            {item.caption}
          </p>
        )}
        {group.length > 1 && (
          <p class="text-xs text-muted font-mono">
            {index + 1} / {group.length}
          </p>
        )}
      </div>
      {group.length > 1 && (
        <>
          <NavButton
            side="left"
            atEdge={index === 0}
            onClick={() => step(-1)}
          />
          <NavButton
            side="right"
            atEdge={index === group.length - 1}
            onClick={() => step(1)}
          />
        </>
      )}
    </div>
  )
}

// ---------- root ----------

export default function BlogLightbox() {
  const [groups, setGroups] = useState<Item[][]>([])
  const [open, setOpen] = useState<{ g: number; i: number } | null>(null)

  useEffect(() => {
    const detected = detectGroups()
    setGroups(detected)
    const cleanups: (() => void)[] = []
    detected.forEach((group, g) => {
      group.forEach((item, i) => {
        // capture clicks even when BlogImage wraps the img in an external
        // link (the url stays reachable via the button inside the viewer)
        const onClick = (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen({ g, i })
        }
        item.img.style.cursor = 'zoom-in'
        item.img.addEventListener('click', onClick)
        cleanups.push(() => {
          item.img.style.cursor = ''
          item.img.removeEventListener('click', onClick)
        })
      })
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])

  if (!open || !groups[open.g]) return null
  return (
    <SpotlightViewer
      key={open.g}
      group={groups[open.g]}
      index={open.i}
      setIndex={(i) => setOpen({ g: open.g, i })}
      onClose={() => setOpen(null)}
    />
  )
}
