/**
 * Story mode island for blog posts.
 *
 * The "View as story" button is rendered statically by the blog post page
 * (id="view-as-story") so there's no layout shift; this island builds the
 * slide list from the rendered article, wires the button, and mounts the
 * StoryViewer when clicked. The button is hidden if the post has no photo
 * slides (a text-only story isn't worth playing).
 */
import { useEffect, useState } from 'preact/hooks'
import StoryViewer, {
  buildStorySlides,
  type StorySlide,
} from './lightbox/StoryViewer'

export default function BlogStory() {
  const [slides, setSlides] = useState<StorySlide[]>([])
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    const built = buildStorySlides()
    setSlides(built)
    const btn = document.getElementById('view-as-story')
    if (!btn) return
    if (!built.some((s) => s.kind === 'image')) {
      btn.style.display = 'none'
      return
    }
    const onClick = () => setIndex(0)
    btn.addEventListener('click', onClick)
    return () => btn.removeEventListener('click', onClick)
  }, [])

  if (index === null || slides.length === 0) return null
  return (
    <StoryViewer
      slides={slides}
      index={index}
      setIndex={setIndex}
      onClose={() => setIndex(null)}
    />
  )
}
