import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { handleLoader } from '@keystatic/remix/api'
import config from '../../keystatic.config'

export const loader: LoaderFunction = (args) => {
  console.log('GET request to /api/keystatic')

  return handleLoader({ config }, args)
}
export const action: ActionFunction = (args) => {
  console.log('non-GET request to /api/keystatic')

  return handleLoader({ config }, args)
}
