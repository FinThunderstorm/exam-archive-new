/** @type {import('next').NextConfig} */
const path = require('path')

const csp =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? ''
    : "default-src 'self'; img-src 'self'; media-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"

const nextConfig = {
  distDir: `dist/${process.env.NODE_ENV}`,
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '25mb' }
  },
  devIndicators: {
    buildActivityPosition: 'bottom-right'
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Permissions-Policy',
            // Permissions-Policy is blacklist-based, so we need to explicitly set all features we want to disable
            value:
              'microphone=(), geolocation=(), usb=(), payment=(), autoplay=(), display-capture=(), encrypted-media=(), gamepad=(), gyroscope=(), midi=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=()'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: csp
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/archive',
        destination: '/',
        permanent: true
      },
      {
        source: '/archive/:path*',
        destination: '/courses/:path*',
        permanent: true
      },
      {
        source: '/download/:path*',
        destination: '/files/:path*',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
