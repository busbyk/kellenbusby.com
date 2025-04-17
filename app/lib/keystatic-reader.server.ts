import keystaticConfig from '../../keystatic.config'
import { createGitHubReader } from '@keystatic/core/reader/github'

export const reader = createGitHubReader(keystaticConfig, {
  repo: 'busbyk/kellenbusby.com',
  token: process.env.GITHUB_PAT,
  ref: process.env.VERCEL_GIT_COMMIT_REF || process.env.LOCAL_GIT_REF || 'dev',
})
