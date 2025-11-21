import Login from "./loginComponent";

export const metadata = {
  title: 'AFD Platform - Kirish',
  description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
  keywords: 'Kirish, login, Anime, Film, Drama, Kdrama, Seriallar, O\'zbek tilida, Afd, AFD, AFD Platform, afd-platform, fantastika',
  openGraph: {
    title: 'AFD Platform - Kirish',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    url: 'https://afd-platform.uz/login/',
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
    title: 'AFD Platform - Kirish',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    images: ['https://afd-platform.uz/preview.png'],
  },
  alternates: {
    canonical: 'https://afd-platform.uz/login/',
  },
};


export default function AllDepartmentsPage() {
  return <Login />;
}