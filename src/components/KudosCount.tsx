import { useEffect, useState } from 'preact/hooks'

interface Props {
  embedId: string
  embedToken: string
  /** Build-time kudos count, shown until (and unless) the live fetch lands */
  initial?: number
}

/** Live kudos count, fetched through the /strava-embed/* proxy (vercel.json
 * rewrite in prod, Vite dev proxy locally) since strava-embeds.com sends no
 * CORS headers. Any failure just leaves the build-time number in place. */
export default function KudosCount({ embedId, embedToken, initial }: Props) {
  const [kudos, setKudos] = useState<number | undefined>(initial)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/strava-embed/activity/${embedId}?token=${embedToken}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
      .then((html) => {
        const match = html.match(/(\d+) kudos/)
        if (match) setKudos(Number(match[1]))
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  return (
    <span class="text-sm text-muted">
      {typeof kudos === 'number' ? `${kudos} kudos` : ''}
    </span>
  )
}
