import { NextResponse } from "next/server";
import { getRssData } from "./rss";

export async function GET() {
    try {
        const items = await getRssData();

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:yandex="http://news.yandex.ru" version="2.0">
  <channel>
    <title>AFD Platform - Uzbek tilida filmlar</title>
    <link>https://afd-platform.uz</link>
    <language>uz</language>
    <description>AFD Platform - Eng so‘ngi kinolar, animelar va k-drama Uzbek tilida</description>
    <generator>Next.js RSS Generator</generator>
    ${items
        .map(
            (item) => `
      <item>
        <title>${item.title}</title>
        <link>${item.link}</link>
        <description>${item.description}</description>
        <category>${item.category}</category>
        <pubDate>${item.pubDate}</pubDate>
        <guid isPermaLink="true">${item.guid}</guid>
        ${
            item.image
                ? `<enclosure url="${item.image}" length="${item.length || 0}" type="${item.mimeType}" />`
                : ""
        }
        <yandex:full-text>${item.fullText}</yandex:full-text>
      </item>`
        )
        .join("")}
  </channel>
</rss>`;

        return new NextResponse(xml, {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    } catch (err) {
        console.error("❌ RSS yaratishda xato:", err);
        return new NextResponse("RSS error", { status: 500 });
    }
}
