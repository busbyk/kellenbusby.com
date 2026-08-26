import type { ImageMetadata } from 'astro'

import avyobs from '../assets/avyobs.png'
import backcountrychecklist from '../assets/backcountrychecklist.png'
import myfirstinstapost from '../assets/myfirstinstapost.png'
import bhamhoods from '../assets/bhamhoods-shot.png'

export type ProjectStatus = 'live' | 'in-progress'

export interface Project {
  /** Stable id — becomes the detail-page route if projects graduate to a content collection */
  slug: string
  name: string
  oneLiner: string
  status: ProjectStatus
  /** Human status shown on the badge, e.g. "In development", "Early days" */
  statusLabel: string
  url?: string
  image?: ImageMetadata
  imageAlt?: string
  stack?: string[]
  /** Featured projects get hero treatment on /projects and appear on the landing page */
  featured: boolean
  /** Show the "interested?" call to action (mailto + Plausible for now, Loops later) */
  cta: boolean
}

export const projects: Project[] = [
  {
    slug: 'avyobs',
    name: 'AvyObs',
    oneLiner:
      "A snow and avalanche observations notification service. Always know what's going on in the mountains.",
    status: 'live',
    statusLabel: 'Live',
    url: 'https://www.avyobs.com/?utm_source=kellenbusby.com',
    image: avyobs,
    imageAlt: 'AvyObs screenshot',
    stack: ['Remix', 'Postgres', 'Resend'],
    featured: true,
    cta: false,
  },
  {
    slug: 'bhamhoods',
    name: 'Bellingham Neighborhoods',
    oneLiner:
      'A free, community-driven, map-based guide to the neighborhoods of Bellingham, WA.',
    status: 'live',
    statusLabel: 'Live',
    url: 'https://bellinghamneighborhoods.com/?utm_source=kellenbusby.com',
    image: bhamhoods,
    imageAlt: 'Bellingham Neighborhoods interactive map screenshot',
    stack: ['Astro', 'MapLibre', 'Cloudflare'],
    featured: true,
    cta: false,
  },
  {
    slug: 'backcountrychecklist',
    name: 'BackcountryChecklist',
    oneLiner:
      'A lighthearted checklist for a fun and safe day of skiing, snowboarding, or snowmobiling in the backcountry.',
    status: 'live',
    statusLabel: 'Live',
    url: 'https://www.backcountrychecklist.com/?utm_source=kellenbusby.com',
    image: backcountrychecklist,
    imageAlt: 'Backcountry checklist screenshot',
    featured: false,
    cta: false,
  },
  {
    slug: 'myfirstinstapost',
    name: 'MyFirstInstaPost',
    oneLiner:
      "A silly website that shows you your first Instagram post. It's a fun stroll down memory lane.",
    status: 'live',
    statusLabel: 'Live',
    url: 'https://www.myfirstinstapost.com/?utm_source=kellenbusby.com',
    image: myfirstinstapost,
    imageAlt: 'MyFirstInstaPost screenshot',
    featured: false,
    cta: false,
  },
  {
    slug: 'trashlane',
    name: 'Trash Lane',
    oneLiner:
      'A platform for waste collection companies to manage customers, billing, and operations.',
    status: 'in-progress',
    statusLabel: 'Nearly ready',
    stack: ['React', 'Cloudflare', 'Stripe'],
    featured: false,
    cta: true,
  },
  {
    slug: 'toku',
    name: 'Toku',
    oneLiner:
      'A Strava companion app — search your entire activity history and see all your places on a map.',
    status: 'in-progress',
    statusLabel: 'In development',
    stack: ['React', 'Cloudflare', 'MapLibre'],
    featured: true,
    cta: true,
  },
  {
    slug: 'guess-golf',
    name: 'Guess Golf',
    oneLiner:
      'Golf scoring for the daily puzzle games you already play. Compete in 9- or 18-day rounds with friends.',
    status: 'in-progress',
    statusLabel: 'Early days',
    stack: ['Expo', 'React Native'],
    featured: false,
    cta: true,
  },
  {
    slug: 'thats-a-bingo',
    name: "That's a Bingo",
    oneLiner:
      'Custom social bingo games for trips, road trips, and friend groups. Make a board, share it, play together.',
    status: 'in-progress',
    statusLabel: 'In development',
    stack: ['Expo', 'React Native'],
    featured: false,
    cta: true,
  },
]

export const liveProjects = projects.filter((p) => p.status === 'live')
export const inProgressProjects = projects.filter(
  (p) => p.status === 'in-progress',
)
export const featuredProjects = projects.filter((p) => p.featured)
