import { getCollection, type CollectionEntry } from 'astro:content'

export type ProjectEntry = CollectionEntry<'projects'>
export type Project = ProjectEntry['data'] & { slug: string }
export type ProjectStatus = Project['status']

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projects')
  return entries
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({ slug: entry.id, ...entry.data }))
}

export const byStatus = (projects: Project[], status: ProjectStatus) =>
  projects.filter((p) => p.status === status)
