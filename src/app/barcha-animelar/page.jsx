// app/barcha-filmlar/page.js
import { Suspense } from "react";
import AllDepartmentsClientComponent from "./pageComponent";
import Loading from "@/components/loading/loading";

export const metadata = {
  title: 'AFD Platform - Tarjima filmlar, Anime, Animelar, Doramalar, Filmlar uzbek tilida',
  description: 'Uzbek tilida. Animelar uzbek tilida. Anime · Tarjima kino · Jahon filmlari · Hind kino · Koreys kino · AQSH seriallar · Turk seriallar. AFD - Anime, Film va doramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
  keywords: 'Anime, Film, Drama, Kdrama, Seriallar, O\'zbek tilida, Afd, AFD, AFD Platform, afd-platform, fantastika',
  openGraph: {
    title: 'AFD Platform - Barcha filmlar',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    url: 'https://afd-platform.uz/barcha-filmlar/',
    images: [
      {
        url: 'https://afd-platform.uz/preview.png',
        width: 800,
        height: 600,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AFD Platform - Barcha filmlar',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    images: ['https://afd-platform.uz/preview.png'],
  },
  alternates: {
    canonical: 'https://afd-platform.uz/barcha-filmlar',
  },
};

export default function AllDepartmentsPage() {
  return <Suspense fallback={<Loading />}>
    <AllDepartmentsClientComponent />
  </Suspense>
}