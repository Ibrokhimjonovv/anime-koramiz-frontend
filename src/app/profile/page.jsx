// app/profile/page.js

export const metadata = {
  title: 'AFD Platform - Shaxsiy xisob',
  description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
  keywords: 'Shaxsiy xisob, Profil, Profile, Anime, Film, Drama, Kdrama, Seriallar',
  openGraph: {
    title: 'AFD Platform - Shaxsiy xisob',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    url: 'https://afd-platform.uz/profile/',
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
    title: 'AFD Platform - Shaxsiy xisob',
    description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
    images: ['https://afd-platform.uz/preview.png'],
  },
  alternates: {
    canonical: 'https://afd-platform.uz/profile/',
  },
};

import ProfileClientComponent from './ProfileClientContent';

export default function ProfilePage() {
  return <ProfileClientComponent />;
}