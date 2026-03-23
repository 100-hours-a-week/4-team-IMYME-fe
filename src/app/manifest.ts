import type { MetadataRoute } from 'next'

const APP_NAME = 'MINE'
const APP_DESCRIPTION = "IMYME's Project"
const APP_START_URL = '/main'
const APP_BACKGROUND_COLOR = '#ffffff'
const APP_THEME_COLOR = '#000000'
const APP_ICON_PATH = '/logo.png'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: APP_START_URL,
    display: 'standalone',
    background_color: APP_BACKGROUND_COLOR,
    theme_color: APP_THEME_COLOR,
    icons: [
      {
        src: APP_ICON_PATH,
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
