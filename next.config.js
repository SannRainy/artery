module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',

        hostname: 'weuskrczzjbswnpsgbmp', 
        port: '',
        pathname: '/storage/v1/object/public/**',
      },

      {
        protocol: 'https',
        hostname: '*.up.railway.app',
      }
    ],
    domains: ['localhost', 'via.placeholder.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*'
      }
    ]
  }
} 