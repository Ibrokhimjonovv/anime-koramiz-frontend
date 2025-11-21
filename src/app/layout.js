// import { Geist, Geist_Mono } from "next/font/google";
import { Poppins, Luckiest_Guy, Roboto_Slab } from 'next/font/google'
import { AccessProvider } from "@/context/context";
import "../../styles/global.scss";
import ClientLayout from './ClientLayout';
import SecurityProtection from '@/components/security/security';

// Poppins fontini turli vaznlar bilan sozlash
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], // Faqat kerakli vaznlarni qoldiring
  display: 'swap',
  variable: '--font-poppins',
  preload: true, // Faqat asosiy fontni preload qiling
  adjustFontFallback: false, // Fallback ni optimallashtirish
})

export const luckiestGuy = Luckiest_Guy({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-luckiest-guy',
  preload: false,
})

export const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-roboto-slab',
  preload: false,
})

export const metadata = {
  title: "AFD Platform - Eng yaxshi filmlar va seriallar",
  description: "AFD Platform - Uzbek tilidagi filmlar va seriallar. Yangi kinolarni hozir tomosha qiling!",
};

export default function RootLayout({ children }) {
  
  return (
    <AccessProvider>
      <html lang="en" className={`${poppins.variable}`}>
        <head>
          <script>window.yaContextCb=window.yaContextCb||[]</script>
          <script src="https://yandex.ru/ads/system/context.js" async></script>
          <link rel="alternate" type="application/rss+xml" title="AFD Platform RSS" href="https://afd-platform.uz/rss" />
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"></link>
        </head>
        <body id='__next'>
          {/* <SecurityProtection /> */}
          <ClientLayout>{children}</ClientLayout>
        </body>
      </html>
    </AccessProvider>
  );
}