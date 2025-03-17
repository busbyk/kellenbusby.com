import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../../keystatic.config'
import { createGitHubReader } from '@keystatic/core/reader/github'

export const reader =
  process.env.NODE_ENV === 'production'
    ? createGitHubReader(keystaticConfig, {
        repo: 'busbyk/kellenbusby.com',
        token: process.env.GITHUB_PAT,
      })
    : createReader(process.cwd(), keystaticConfig)
