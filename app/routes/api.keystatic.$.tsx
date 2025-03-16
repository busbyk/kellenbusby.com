import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { handleLoader } from '@keystatic/remix/api'
import config from '../../keystatic.config'

export const loader: LoaderFunction = (args) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Response('Not found', { status: 404 })
  }

  return handleLoader({ config }, args)
}
export const action: ActionFunction = (args) => {
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return handleLoader({ config }, args)
}
