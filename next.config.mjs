/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    minimumCacheTTL: 60,
  },
  
  // SEO uchun muhim sozlamalar
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Redirect sozlamalari - {search_term_string} muammosini hal qilish uchun
  async redirects() {
    return [
      {
        source: '/search/q=:query*',
        destination: '/search?q=:query*',
        permanent: true,
      },
      {
        source: '/search/:path*{search_term_string}',
        destination: '/search',
        permanent: true,
      }
    ]
  },
  
  // Rewrites - SEO uchun toza URL lar
  async rewrites() {
    return [
      {
        source: '/q/:query',
        destination: '/search?q=:query',
      },
      {
        source: '/search/:query',
        destination: '/search?q=:query',
      }
    ]
  },
  
  // Headers - Cache va SEO optimallashtirish
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=60',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          }
        ],
      },
      // Search sahifalari uchun maxsus cache
      {
        source: '/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
          }
        ],
      },
      // Search query bilan sahifalar uchun
      {
        source: '/search/:query*',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, max-age=1800, stale-while-revalidate=3600',
          }
        ],
      }
    ]
  },

  // Eslatma: allowedDevOrigins Next.js da standart property emas
  // Uni quyidagicha almashtiring:
  experimental: {
    turbo: false,
    // Development uchun trusted domains
    allowedDevOrigins: [
      'http://localhost:3000',
      'https://afd-platform.uz',
    ],
  },

  webpack: (config, { isServer }) => {
    config.experiments = {
      topLevelAwait: true,
      layers: true
    };
    
    // Production build uchun optimallashtirish
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        sideEffects: false,
      };
    }
    
    return config;
  },

  // SEO uchun qo'shimcha sozlamalar
  env: {
    SITE_URL: 'https://afd-platform.uz',
  },
};

export default nextConfig;