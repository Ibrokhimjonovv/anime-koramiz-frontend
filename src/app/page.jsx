import Home from "@/components/HomePageComponent/home";

export const metadata = {
  title: 'AFD Platform - Bosh sahifa, Anime, Animelar, Doramalar, Filmlar uzbek tilida',
  description: 'Uzbek tilida. Animelar uzbek tilida. Anime · Tarjima kino · Jahon filmlari · Hind kino · Koreys kino · AQSH seriallar · Turk seriallar. AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
  keywords: 'Anime, Film, Drama, Kdrama, Seriallar, O\'zbek tilida, Afd, AFD, AFD Platform, afd-platform, fantastika, uzbek tilida, Cdrama, Jdrama, kinolar, jahon filmlari, animelar',
  openGraph: {
    title: 'AFD Platform - Bosh sahifa',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    url: 'https://afd-platform.uz/',
    siteName: "AFD Platform",
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
    title: 'AFD Platform - Bosh sahifa',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    images: ['https://afd-platform.uz/preview.png'],
  },
  alternates: {
    canonical: 'https://afd-platform.uz',
  },
};


const HomePage = () => {
    return <Home />
};

export default HomePage;
