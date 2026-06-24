import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      }
    ],
    sitemap: 'https://pdf-master-virid.vercel.app/sitemap.xml',
  }
}
