/**
 * Whole-post story mode — Instagram-stories-style playback of a post.
 *
 * Every photo is a screen and each chunk of prose between photos becomes a
 * text screen (headings start a new screen and keep their first paragraph;
 * long runs split at paragraph boundaries). Photo screens run 5s; text
 * screens scale with word count. Segmented progress bars sit at the top;
 * tap the right two-thirds to advance, the left third to go back (back on
 * the first screen restarts it), press-and-hold to pause, swipe down to
 * dismiss. Pinching a photo zooms it Instagram-style — held while your
 * fingers are down (story paused), springing back on release. Desktop:
 * click zones, hold the mouse button to pause, Esc or the ✕ to close.
 * The backdrop is the site background in both themes.
 */
import { useEffect, useRef, useState } from 'preact/hooks'
import {
  EASE,
  XIcon,
  type Item,
  fitTo,
  itemsIn,
  srcOf,
  useResizeBump,
  useScrollLock,
  useViewerKeys,
  viewportSize,
} from './shared'

export type StorySlide =
  | { kind: 'image'; item: Item }
  | { kind: 'prose'; html: string; ms: number }

const IMAGE_SLIDE_MS = 5000

// Whole-post story slides: every photo is a slide; contiguous prose between
// photos collapses into text slides. Other elements (videos, stats) are
// skipped and break a prose chunk.
const PROSE_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'UL',
  'OL',
  'BLOCKQUOTE',
])

export function buildStorySlides(): StorySlide[] {
  const container = document.querySelector('.blog')
  if (!container) return []
  const slides: StorySlide[] = []
  let proseBuf: Element[] = []
  // a chunk becomes one or more screens: headings start a new screen and
  // long runs split at paragraph boundaries so screens don't overflow
  const flush = () => {
    if (proseBuf.length === 0) return
    const chunks: Element[][] = []
    let cur: Element[] = []
    let curWords = 0
    const push = () => {
      if (cur.length > 0) chunks.push(cur)
      cur = []
      curWords = 0
    }
    const isHeading = (el: Element) => /^H[1-6]$/.test(el.tagName)
    for (const el of proseBuf) {
      const w = (el.textContent ?? '').trim().split(/\s+/).length
      // headings start a new screen but keep their first paragraph with
      // them even when it busts the word cap
      const headingAwaitsBody = cur.length === 1 && isHeading(cur[0])
      if (
        cur.length > 0 &&
        (isHeading(el) || (curWords + w > 90 && !headingAwaitsBody))
      )
        push()
      cur.push(el)
      curWords += w
    }
    push()
    for (const chunk of chunks) {
      const words = chunk
        .map((el) => el.textContent ?? '')
        .join(' ')
        .trim()
        .split(/\s+/).length
      slides.push({
        kind: 'prose',
        html: chunk.map((el) => el.outerHTML).join(''),
        ms: Math.min(10000, Math.max(4000, words * 150)),
      })
    }
    proseBuf = []
  }
  for (const child of Array.from(container.children)) {
    // videos are skipped in story mode; only image items become slides
    const imgs = itemsIn(child).filter((it) => it.kind === 'image')
    if (imgs.length > 0) {
      flush()
      imgs.forEach((item) => slides.push({ kind: 'image', item }))
    } else if (PROSE_TAGS.has(child.tagName)) {
      proseBuf.push(child)
    } else {
      flush()
    }
  }
  flush()
  return slides
}

type StoryProps = {
  slides: StorySlide[]
  index: number
  setIndex: (i: number) => void
  onClose: () => void
}

export default function StoryViewer({
  slides,
  index,
  setIndex,
  onClose,
}: StoryProps) {
  const slide = slides[index]
  const rootRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const lastTouch = useRef(0)
  const hold = useRef<null | {
    x0: number
    y0: number
    t0: number
    moved: boolean
  }>(null)
  const [paused, setPaused] = useState(false)
  const [offsetY, setOffsetY] = useState(0)
  const [dragging, setDragging] = useState(false)
  // bumped when tapping back on the first slide — restarts its progress
  const [run, setRun] = useState(0)
  // transient pinch zoom on photo slides: held while fingers are down,
  // springs back to fit on release
  const [zoomT, setZoomT] = useState({ s: 1, x: 0, y: 0 })
  const [zoomAnim, setZoomAnim] = useState(false)
  const zoomRef = useRef(zoomT)
  zoomRef.current = zoomT
  const pinch = useRef<null | {
    d0: number
    s0: number
    tx0: number
    ty0: number
    mx0: number
    my0: number
  }>(null)
  useScrollLock()
  useResizeBump()

  const clampZoom = (z: { s: number; x: number; y: number }) => {
    if (slide.kind !== 'image') return z
    const { w: vw, h: vh } = viewportSize()
    const size = fitTo(slide.item.el, vw, vh)
    const maxX = Math.max(0, (size.width * z.s - vw) / 2)
    const maxY = Math.max(0, (size.height * z.s - vh) / 2)
    return {
      s: z.s,
      x: Math.max(-maxX, Math.min(maxX, z.x)),
      y: Math.max(-maxY, Math.min(maxY, z.y)),
    }
  }

  useEffect(() => {
    rootRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 180,
    })
  }, [])

  const requestClose = () => {
    if (closing.current) return
    closing.current = true
    const el = rootRef.current
    if (!el) return onClose()
    el.animate(
      [
        { opacity: 1 },
        {
          opacity: 0,
          transform: `translateY(${offsetY || 40}px) scale(0.95)`,
        },
      ],
      { duration: 200, easing: 'ease-in', fill: 'forwards' },
    ).onfinish = onClose
  }

  const step = (d: number) => {
    if (closing.current) return
    pinch.current = null
    setZoomAnim(false)
    setZoomT({ s: 1, x: 0, y: 0 })
    const next = index + d
    if (next < 0) {
      setRun((r) => r + 1)
      return
    }
    if (next >= slides.length) {
      requestClose()
      return
    }
    setIndex(next)
  }

  useViewerKeys({ step, close: requestClose })

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2 && slide.kind === 'image') {
      // pinch begins: cancel the hold/drag so it can't navigate or dismiss
      hold.current = null
      setDragging(false)
      setOffsetY(0)
      setPaused(true)
      setZoomAnim(false)
      const [a, b] = [e.touches[0], e.touches[1]]
      const { w: vw, h: vh } = viewportSize()
      const cur = zoomRef.current
      pinch.current = {
        d0: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
        s0: cur.s,
        tx0: cur.x,
        ty0: cur.y,
        mx0: (a.clientX + b.clientX) / 2 - vw / 2,
        my0: (a.clientY + b.clientY) / 2 - vh / 2,
      }
      return
    }
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    hold.current = {
      x0: t.clientX,
      y0: t.clientY,
      t0: performance.now(),
      moved: false,
    }
    setPaused(true)
  }

  const onTouchMove = (e: TouchEvent) => {
    if (pinch.current && e.touches.length === 2) {
      const p = pinch.current
      const [a, b] = [e.touches[0], e.touches[1]]
      const { w: vw, h: vh } = viewportSize()
      const d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const mx = (a.clientX + b.clientX) / 2 - vw / 2
      const my = (a.clientY + b.clientY) / 2 - vh / 2
      const s = Math.max(1, Math.min(4, (p.s0 * d) / p.d0))
      setZoomT(
        clampZoom({
          s,
          x: mx - (p.mx0 - p.tx0) * (s / p.s0),
          y: my - (p.my0 - p.ty0) * (s / p.s0),
        }),
      )
      return
    }
    const g = hold.current
    if (!g) return
    const t = e.touches[0]
    const dx = t.clientX - g.x0
    const dy = t.clientY - g.y0
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) g.moved = true
    if (Math.abs(dy) > Math.abs(dx)) {
      setDragging(true)
      setOffsetY(dy)
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    lastTouch.current = performance.now()
    if (pinch.current) {
      if (e.touches.length >= 2) return
      // fingers released: spring back to fit and resume
      pinch.current = null
      setZoomAnim(true)
      setZoomT({ s: 1, x: 0, y: 0 })
      if (e.touches.length === 0) setPaused(false)
      return
    }
    const g = hold.current
    hold.current = null
    setDragging(false)
    if (e.touches.length === 0) setPaused(false)
    if (!g) return
    const dy = e.changedTouches[0].clientY - g.y0
    if (g.moved && Math.abs(dy) > 90) {
      requestClose()
      return
    }
    setOffsetY(0)
    // quick tap (not a hold, not a drag): left third back, rest forward
    if (!g.moved && performance.now() - g.t0 < 350) {
      step(g.x0 < window.innerWidth / 3 ? -1 : 1)
    }
  }

  const dim = 1 - Math.min(Math.abs(offsetY) / 400, 0.5)
  const shrink = 1 - Math.min(Math.abs(offsetY) / 1200, 0.12)
  const ms = slide.kind === 'image' ? IMAGE_SLIDE_MS : slide.ms

  return (
    <div
      ref={rootRef}
      tabindex={-1}
      class="fixed inset-0 z-[150] outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={slide.kind === 'image' ? slide.item.alt : 'Story text'}
      style={{ touchAction: 'none' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onClick={(e) => {
        // desktop tap zones (ignore synthesized post-touch clicks)
        if (performance.now() - lastTouch.current < 500) return
        step(e.clientX < window.innerWidth / 3 ? -1 : 1)
      }}
    >
      <style>{`@keyframes blog-story-fill { from { width: 0% } to { width: 100% } }`}</style>
      <div
        class="absolute inset-0 bg-background"
        style={{
          opacity: dim,
          transition: dragging ? 'none' : 'opacity 300ms',
        }}
      />
      <div
        class="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translateY(${offsetY}px) scale(${shrink})`,
          transition: dragging ? 'none' : `transform 300ms ${EASE}`,
        }}
      >
        {slide.kind === 'image' ? (
          <img
            key={index}
            src={srcOf(slide.item.el)}
            srcset={(slide.item.el as HTMLImageElement).srcset}
            sizes="100vw"
            alt={slide.item.alt}
            class="max-w-full max-h-full object-contain"
            draggable={false}
            style={{
              // explicit ratio: iOS Safari squishes flex images that are
              // capped by both max-width and max-height without it
              ...((slide.item.el as HTMLImageElement).naturalWidth > 0
                ? {
                    aspectRatio: `${(slide.item.el as HTMLImageElement).naturalWidth} / ${(slide.item.el as HTMLImageElement).naturalHeight}`,
                  }
                : null),
              transform: `translate(${zoomT.x}px, ${zoomT.y}px) scale(${zoomT.s})`,
              transition: zoomAnim ? `transform 250ms ${EASE}` : 'none',
            }}
          />
        ) : (
          <div
            key={index}
            class="prose prose-slate dark:prose-invert max-w-xl w-full max-h-[78%] overflow-hidden px-7"
            dangerouslySetInnerHTML={{ __html: slide.html }}
          />
        )}
      </div>
      {/* segmented progress bars — the current one fills over the slide's time */}
      <div class="absolute top-0 inset-x-0 z-20 flex gap-1 px-2 pt-[max(env(safe-area-inset-top),0.5rem)]">
        {slides.map((_, i) => (
          <div class="h-1 flex-1 rounded-full bg-zinc-900/20 dark:bg-white/25 overflow-hidden">
            {i < index ? (
              <div class="h-full w-full bg-zinc-900 dark:bg-white" />
            ) : i === index ? (
              <div
                key={`${index}:${run}`}
                class="h-full bg-zinc-900 dark:bg-white"
                style={{
                  animation: `blog-story-fill ${ms}ms linear forwards`,
                  animationPlayState:
                    paused || dragging || closing.current
                      ? 'paused'
                      : 'running',
                }}
                onAnimationEnd={() => step(1)}
              />
            ) : null}
          </div>
        ))}
      </div>
      <button
        aria-label="Close"
        class="absolute z-20 top-[max(env(safe-area-inset-top),1.25rem)] right-3 mt-2 rounded-full p-2 text-zinc-900/90 bg-zinc-900/10 hover:bg-zinc-900/20 dark:text-white/90 dark:bg-white/10 dark:hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation()
          requestClose()
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <XIcon />
      </button>
      {slide.kind === 'image' && slide.item.caption && (
        <div class="absolute bottom-0 inset-x-0 z-20 px-5 pt-12 pb-[max(env(safe-area-inset-bottom),1rem)] bg-gradient-to-t from-white/80 dark:from-black/70 to-transparent pointer-events-none">
          <p class="text-sm text-zinc-900/90 dark:text-white/90 text-center">
            {slide.item.caption}
          </p>
        </div>
      )}
    </div>
  )
}
