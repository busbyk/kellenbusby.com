export {}

declare global {
  interface Window {
    ENV: {
      NODE_ENV?: string
      MAPBOX_TOKEN?: string
    }
  }
}
