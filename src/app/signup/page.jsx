// app/barcha-filmlar/page.js

import Signup from "./signupComponent";

export const metadata = {
  title: 'AFD Platform - Ro\'yxatdan o\'tish',
  description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
  keywords: 'Ro\'yxatdan o\'tish, signup, Anime, Film, Drama, Kdrama, Seriallar, O\'zbek tilida, Afd, AFD, AFD Platform, afd-platform, fantastika',
  openGraph: {
    title: 'AFD Platform - Ro\'yxatdan o\'tish',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    url: 'https://afd-platform.uz/signup/',
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
    title: 'AFD Platform - Ro\'yxatdan o\'tish',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    images: ['https://afd-platform.uz/preview.png'],
  },
  alternates: {
    canonical: 'https://afd-platform.uz/signup/',
  },
};


export default function AllDepartmentsPage() {
  return <Signup />;
}