import { MetadataRoute } from 'next';

/**
 * SEO-Optimized Sitemap for Daily Word Chain Game
 *
 * This sitemap helps search engines discover and index all pages of the site.
 * For a single-page game application, we focus on the main page with optimal
 * settings for daily content updates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://word-chain-game-zw8l.vercel.app';

  // Current date for lastModified
  const currentDate = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      // Daily content changes (new word puzzle every day)
      changeFrequency: 'daily',
      // Homepage priority - highest for single-page apps
      priority: 1.0,
    },
    // Future pages can be added here as the site grows
    // Example for future expansion:
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/how-to-play`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.7,
    // },
    // {
    //   url: `${baseUrl}/leaderboard`,
    //   lastModified: currentDate,
    //   changeFrequency: 'daily',
    //   priority: 0.6,
    // },
  ];
}
