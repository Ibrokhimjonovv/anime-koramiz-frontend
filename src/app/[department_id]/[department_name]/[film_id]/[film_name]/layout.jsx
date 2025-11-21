import { global_api_ssr } from "@/app/_app";

// Global cache obyekti
const metadataCache = new Map();
const CACHE_TTL = 3600000; // 1 soat (ms)

export const dynamic = 'auto'; // Har doim auto rejimida ishlaydi

export async function generateMetadata({ params }) {
  // 1. Parametrlarni tekshirish va standart qiymatlar
  if (!params || !params.film_id) {
    return getDefaultMetadata();
  }

  const {
    department_id = '',
    department_name = '',
    film_id,
    film_name = ''
  } = params;

  // 2. Cache'dan ma'lumot olish
  const cacheKey = `${film_id}-${department_id}`;
  const cachedData = metadataCache.get(cacheKey);

  if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
    return cachedData.metadata;
  }

  // 3. Ma'lumotlarni API dan olish
  let video;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 soniya timeout

    const res = await fetch(`${global_api_ssr}/movies/${film_id}/`, {
      signal: controller.signal,
      next: {
        revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600,
        tags: [`movie-${film_id}`]
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    video = await res.json();
  } catch (error) {
    console.error("❌ Ma'lumot olishda xato:", error.message);
    return getDefaultMetadata();
  }

  // 4. Metadata generatsiyasi
  const metadata = generateFullMetadata(video, {
    department_id,
    department_name,
    film_id,
    film_name
  });

  // 5. Cache'ga saqlash
  metadataCache.set(cacheKey, {
    metadata,
    timestamp: Date.now()
  });

  return metadata;
}
function generateFullMetadata(video, { department_id, department_name, film_id, film_name }) {
  const pageUrl = `https://afd-platform.uz/${department_id}/${department_name}/${film_id}/${film_name}`;
  const optimizedImage = video.movies_preview_url
    ? `${video.movies_preview_url}?width=1200&height=630&fit=cover&quality=85&v=${Date.now()}`
    : "https://afd-platform.uz/preview.png";

  // Media turini aniqlash
  const mediaType = video.all_series === "Film" ? "Filmi" : "Seriali";
  
  // Countrydan faqat birinchi qiymatni olish
  const firstCountry = video.country 
    ? video.country.split(',')[0].trim() 
    : '';

  const countryPrefix = firstCountry ? `${firstCountry} ` : '';

  const title = `${video.movies_name} uzbek tilida` || "Uzbek tilida kinolar - AFD Platform";
  
  const description = `${video.movies_name} uzbek tilida. ${video.movies_description?.substring(0, 150)}...` || "Eng yangi va mashhur filmlar uzbek tilida to'liq versiyada. Bepul tomosha qiling!";

  return {
    title,
    description,
    keywords: generateKeywords(video.movies_name, department_name, firstCountry, mediaType),
    openGraph: getOpenGraphMetadata(title, description, pageUrl, optimizedImage, video),
    twitter: getTwitterMetadata(title, description, optimizedImage, video),
    alternates: getAlternatesMetadata(pageUrl),
    other: getOtherMetadata(optimizedImage, video, pageUrl),
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': 'large',
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
  };
}

function getOpenGraphMetadata(title, description, pageUrl, imageUrl, video) {
  return {
    title,
    description,
    url: pageUrl,
    siteName: "AFD Platform - Tomoshadan zavqlaning do'stim!",
    images: [{ url: imageUrl, width: 1200, height: 630, alt: video.movies_name || "Film rasmi" }],
    videos: video.video_url ? [{
      url: video.video_url,
      width: 1280,
      height: 720,
      type: 'video/mp4'
    }] : undefined,
    type: 'video.movie',
    locale: 'uz_UZ'
  };
}

function getTwitterMetadata(title, description, imageUrl, video) {
  return {
    title,
    description,
    card: video.video_url ? "player" : "summary_large_image",
    site: "@AFDPlatform",
    creator: "@AFDPlatform",
    images: [imageUrl],
    players: video.video_url ? [{
      url: video.video_url,
      width: 1280,
      height: 720,
      stream: video.video_url
    }] : undefined
  };
}

function getAlternatesMetadata(pageUrl) {
  return {
    canonical: pageUrl,
    languages: { 'uz': pageUrl }
  };
}

function getOtherMetadata(imageUrl, video, pageUrl) {
  return {
    "telegram:image": imageUrl,
    "viewport": "width=device-width, initial-scale=1.0, maximum-scale=5.0",
    "theme-color": "#000000",
    "structured-data": JSON.stringify(getStructuredData(video, pageUrl, imageUrl)),
    "breadcrumb-data": JSON.stringify(getBreadcrumbSchema(
      video.movies_name,
      pageUrl,
      video.department_name,
      video.department_id
    )),
    "video-data": JSON.stringify(getVideoSchema(video, pageUrl, imageUrl))
  };
}

function getDefaultMetadata() {
  return {
    title: "Uzbek tilida filmlar - AFD Platform",
    description: "Eng yaxshi filmlar uzbek tilida to'liq versiyada. Bepul tomosha qiling!",
  };
}
function generateKeywords(movieName, department, country, mediaType) {
  const baseKeywords = [
    'animelar uzbek tilida',
    'amedia tv animelar',
    'anibla tv animelar',
    'idub tv',
    'uzmovi',
    'aslmedia',
    'animelar uzbek tilida',
    "naruto uzbek tilida",
    "iblislar qotili uzbek tilida",
    "uzbek tilida film",
    "bepul tomosha qilish",
    "hd film",
    "onlayn kinolar",
    "afd platform",
    "o'zbek tilida kinolar",
    "uzbekcha filmlar",
    "to'liq film",
    "bepul kino",
    "koreys seriallari",
    "k dramalar",
    "jahon filmlari",
    department,
    country,
    mediaType === "Filmi" ? "kinolar" : "seriallar"
  ];

  if (!movieName) return baseKeywords.join(', ');

  const movieKeywords = [
    `${movieName} uzbek tilida`,
    `${movieName} amedia tv`,
    `${movieName} anibla tv`,
    `${movieName} anibla`,
    `${movieName} uzmovi`,
    `${movieName} aslmedia`,
    `${movieName} idub tv`,
    `amedia tv ${movieName}`,
    `anibla tv ${movieName}`,
    `anibla ${movieName}`,
    `uzmovi ${movieName}`,
    `aslmedia ${movieName}`,
    `idub tv ${movieName} `,
    `${movieName} o'zbek tilida`,
    `${movieName} to'liq ${mediaType.toLowerCase()}`,
    `${movieName} hd sifat`,
    `${movieName} tomosha qilish`,
    `${movieName} online`,
    `${movieName} yuklab olish`,
    `${country} ${mediaType.toLowerCase()} uzbek tilida`,
  ];

  return [...baseKeywords, movieName, ...movieKeywords].join(', ');
}

function getStructuredData(video, pageUrl, imageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": video.movies_name,
    "description": video.movies_description,
    "image": imageUrl,
    "datePublished": video.year || new Date().toISOString(),
    "potentialAction": {
      "@type": "WatchAction",
      "target": pageUrl
    },
    "aggregateRating": video.rating ? {
      "@type": "AggregateRating",
      "ratingValue": video.rating,
      "bestRating": "10",
      "ratingCount": video.rating_count || "10",
    } : undefined
  };
}

function getBreadcrumbSchema(movieName, pageUrl, departmentName, departmentId) {
  const items = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Bosh sahifa",
      "item": "https://afd-platform.uz"
    }
  ];

  if (departmentName && departmentId) {
    items.push({
      "@type": "ListItem",
      "position": 2,
      "name": departmentName,
      "item": `https://afd-platform.uz/${departmentId}/${departmentName}`
    });
  }

  items.push({
    "@type": "ListItem",
    "position": items.length + 1,
    "name": movieName || "Film",
    "item": pageUrl
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
}

function getVideoSchema(video, pageUrl, imageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.movies_name,
    "description": video.movies_description,
    "thumbnailUrl": imageUrl,
    "uploadDate": video.created_at || new Date().toISOString(),
    "duration": formatDuration(video.duration),
    "contentUrl": video.video_url,
    "embedUrl": `${pageUrl}`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": video.count || "1000"
    }
  };
}

function formatDuration(duration) {
  if (!duration) return "PT1H30M";
  if (typeof duration === 'number') {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `PT${hours}H${minutes}M`;
  }
  return duration;
}

export default function RootLayout({ children }) {
  return <>{children}</>;
}