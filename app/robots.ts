import { MetadataRoute } from 'next';

/**
 * SEO-Optimized Robots.txt for Daily Word Chain Game
 *
 * This file tells search engine crawlers which pages they can access.
 * For AdSense compliance and optimal SEO, we allow all major search engines
 * and provide the sitemap location.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://word-chain-game-zw8l.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow Next.js internal directories
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      // Special rules for Google (AdSense partner)
      {
        userAgent: 'Googlebot',
        allow: '/',
        // Allow Google to crawl everything for better AdSense contextual ads
        disallow: ['/api/', '/_next/'],
      },
      // Allow Googlebot-Image for potential image indexing
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
