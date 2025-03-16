import { makePage } from '@keystatic/remix/ui'
import config from '../../keystatic.config'

export function loader() {
  if (process.env.NODE_ENV === 'production') {
    throw new Response('Not found', { status: 404 })
  }

  return
}

export default makePage(config)
