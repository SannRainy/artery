module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',

        hostname: 'weuskrczzjbswnpsgbmp.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**',
      },

      {
        protocol: 'https',
        hostname: '*.up.railway.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },

};
