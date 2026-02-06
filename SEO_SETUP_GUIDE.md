# SEO Setup Guide for Daily Word Chain

## Files Created

### 1. `/app/sitemap.ts`
SEO-optimized sitemap that automatically generates sitemap.xml at build time.

**Key Features:**
- Dynamic generation using Next.js 14 App Router metadata API
- Daily changeFrequency (matches your daily puzzle updates)
- Priority 1.0 for homepage (highest importance)
- Automatic lastModified date updates
- Ready for future page additions (commented examples included)

**Access URL:** `https://word-chain-game.vercel.app/sitemap.xml`

### 2. `/app/robots.ts`
Crawler-friendly robots.txt configuration optimized for AdSense.

**Key Features:**
- Allows all major search engines
- Special rules for Googlebot (AdSense partner)
- Blocks Next.js internal directories
- Points to sitemap location
- Optimized for ad contextual targeting

**Access URL:** `https://word-chain-game.vercel.app/robots.txt`

## Testing Locally

```bash
# Build the project
npm run build

# Start production server
npm start

# Test sitemap
curl http://localhost:3000/sitemap.xml

# Test robots.txt
curl http://localhost:3000/robots.txt
```

## After Deployment to Vercel

### 1. Submit Sitemap to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://word-chain-game.vercel.app`
3. Navigate to **Sitemaps** in left sidebar
4. Add sitemap URL: `https://word-chain-game.vercel.app/sitemap.xml`
5. Click **Submit**

### 2. Verify robots.txt

Visit `https://word-chain-game.vercel.app/robots.txt` to ensure it's publicly accessible.

### 3. Test Sitemap

Visit `https://word-chain-game.vercel.app/sitemap.xml` to verify proper XML generation.

## Future Enhancements

### Add More Pages to Sitemap

When you add new pages, update `/app/sitemap.ts`:

```typescript
return [
  {
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  },
  {
    url: `${baseUrl}/about`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${baseUrl}/how-to-play`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${baseUrl}/leaderboard`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.6,
  },
];
```

### Priority Guidelines

- **1.0**: Homepage only
- **0.8-0.9**: Important static pages (About, How to Play)
- **0.6-0.7**: Secondary pages (Leaderboard, Stats)
- **0.4-0.5**: Tertiary pages (Privacy, Terms)

### Change Frequency Guidelines

- **always**: Real-time content (unlikely for this project)
- **hourly**: Very frequently updated content
- **daily**: Daily puzzles, leaderboards
- **weekly**: Blog posts, news
- **monthly**: Static pages, documentation
- **yearly**: Legal pages, rarely updated content
- **never**: Archived content

## SEO Best Practices Already Implemented

✅ **Semantic HTML Structure**
- Proper H1, H2, H3 hierarchy in page.tsx
- Meaningful section elements

✅ **Meta Tags** (in layout.tsx)
- Title with target keywords
- Description optimized for CTR
- OpenGraph tags for social sharing
- Twitter Card metadata

✅ **Mobile Optimization**
- Responsive viewport settings
- Mobile-first Tailwind CSS

✅ **Performance**
- Next.js 14 App Router (fast rendering)
- Vercel Analytics integration

## Additional SEO Recommendations

### 1. Add Structured Data (Schema.org)

Add to `/app/layout.tsx` or create a new component:

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Daily Word Chain',
  applicationCategory: 'Game',
  description: 'Play Daily Word Chain, a free 60-second word association puzzle game.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
};

// Add to <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### 2. Add FAQ Schema

For the "How It Works" section:

```typescript
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do you play Daily Word Chain?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chain words together where each word starts with the last letter of the previous word. You have 60 seconds to create the longest chain possible.',
      },
    },
    // Add more FAQs
  ],
};
```

### 3. Create a Blog for Content Marketing

Add `/app/blog/page.tsx` for SEO-friendly blog posts:
- "10 Tips to Master Word Chain Games"
- "Best Strategies for 60-Second Word Puzzles"
- "Daily Brain Games: Why Word Chains Improve Vocabulary"

### 4. Add Internal Linking

Once you have more pages, update the footer with links:
- About Us
- How to Play
- Privacy Policy
- Terms of Service
- Blog

### 5. Create a /stats or /leaderboard Page

- Shows top scores
- Updates daily
- Encourages repeat visits
- Creates shareable content

## AdSense Optimization Tips

### Content Requirements for AdSense Approval

✅ **Already Done:**
- Original, valuable content
- Clear navigation
- Professional design
- Fast loading speed

🔄 **Recommended Before Applying:**
- Add 2-3 static pages (About, How to Play, Privacy Policy)
- Add Privacy Policy page (required for AdSense)
- Add Terms of Service page
- Ensure 15-20+ pages or daily content updates

### Ad Placement Recommendations

Based on your current layout:

1. **Top Banner (Desktop)**: 728x90 Leaderboard
   - Already has placeholder in page.tsx

2. **Sidebar (Desktop)**: 300x250 Medium Rectangle
   - Add next to game on wider screens

3. **In-content (Mobile)**: 320x50 Mobile Banner
   - Below game results

4. **Anchor Ads (Mobile)**: Auto-placement
   - Sticky bottom banner

### Auto Ads Setup

Easiest option for beginners:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
     crossorigin="anonymous"></script>
```

Add to `/app/layout.tsx` in the `<head>` section.

## Monitoring & Analytics

### Google Search Console Checklist

- [ ] Submit sitemap
- [ ] Monitor coverage issues
- [ ] Check mobile usability
- [ ] Review Core Web Vitals
- [ ] Track search queries
- [ ] Fix any indexing errors

### Performance Monitoring

Already integrated:
- ✅ Vercel Analytics

Recommended additions:
- Google Analytics 4
- Google PageSpeed Insights monitoring
- Bing Webmaster Tools

## Next Steps

1. **Deploy to Vercel** (if not already done)
2. **Submit sitemap to Google Search Console**
3. **Add Privacy Policy page** (required for AdSense)
4. **Add 2-3 more static pages** (About, How to Play)
5. **Apply for AdSense** (after 15-30 days of consistent traffic)
6. **Create blog content** for long-tail keyword targeting
7. **Build backlinks** through social media sharing

## Files Overview

```
/app
├── sitemap.ts          # ✅ SEO sitemap (NEW)
├── robots.ts           # ✅ Robots.txt (NEW)
├── layout.tsx          # ✅ Already has good meta tags
├── page.tsx            # ✅ Already has semantic HTML
└── globals.css         # ✅ Styling
```

## Support

For questions or issues:
- Next.js Sitemap Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Google Search Console: https://search.google.com/search-console
- AdSense Help: https://support.google.com/adsense

---

**Generated on:** 2026-02-06
**Framework:** Next.js 14.2.0
**Status:** ✅ Ready for Production
