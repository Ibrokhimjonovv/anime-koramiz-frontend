import sitemap from './sitemap';

export async function GET() {
  try {
    const pages = await sitemap(); // sitemap.js dan ma'lumot olish
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
        .map(({ url, lastModified, changeFrequency, priority }) => {
          return `
        <url>
          <loc>${url}</loc>
          <lastmod>${lastModified.toISOString()}</lastmod>
          <changefreq>${changeFrequency}</changefreq>
          <priority>${priority}</priority>
        </url>
      `;
        })
        .join('')}
</urlset>`;

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error("Sitemapni yaratishda xato:", error);
    return new Response('Sitemap yaratishda xato', { status: 500 });
  }
}
