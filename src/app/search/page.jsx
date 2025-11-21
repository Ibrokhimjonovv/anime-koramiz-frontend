import Loading from "@/components/loading/loading";
import { Suspense } from "react";
import SearchContent from "./searchContent";

export async function generateMetadata({ searchParams }) {
  const query = searchParams?.q || '';

  // Agar query bo'sh bo'lsa, asosiy search sahifasi metadata
  if (!query) {
    return {
      title: 'Film qidiruv - Uzbek tilida filmlar | AFD Platform',
      description: 'Filmlarni qidiring va tomoshadan zavqlaning. Eng yangi va mashhur filmlar uzbek tilida to\'liq versiyada. Bepul tomosha qiling!',
      keywords: 'film qidiruv, uzbek tilida kinolar, afd platform, online kino, bepul filmlar',
      openGraph: {
        title: 'Film qidiruv - AFD Platform',
        description: 'Filmlarni qidiring va tomoshadan zavqlaning',
        type: 'website',
        url: 'https://afd-platform.uz/search',
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: 'https://afd-platform.uz/search'
      }
    };
  }

  // Agar query mavjud bo'lsa, dinamik metadata
  const encodedQuery = encodeURIComponent(query);

  return {
    title: `"${query}" qidiruvi - Uzbek tilida filmlar | AFD Platform`,
    description: `"${query}" bo'yicha filmlar qidiruvi. Eng yangi va mashhur filmlar uzbek tilida to'liq versiyada. Bepul tomosha qiling!`,
    keywords: `${query}, film qidiruv, uzbek tilida kinolar, afd platform, ${query} film, ${query} kino`,
    openGraph: {
      title: `"${query}" qidiruvi - AFD Platform`,
      description: `"${query}" bo'yicha filmlar qidiruvi natijalari`,
      type: 'website',
      url: `https://afd-platform.uz/search?q=${encodedQuery}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://afd-platform.uz/search?q=${encodedQuery}`
    }
  };
}

export default function SearchPage({ searchParams }) {
  const query = searchParams?.q || '';

  return (
    <Suspense fallback={<Loading />}>
      <SearchContent initialQuery={query} />
    </Suspense>
  );
}