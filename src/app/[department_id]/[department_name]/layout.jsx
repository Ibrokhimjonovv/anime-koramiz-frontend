import { global_api_ssr } from "@/app/_app";

export const dynamic = "auto";

export async function generateMetadata({ params }) {
  if (!params) {
    return getDefaultMetadata();
  }

  const { department_id = null, department_name = null } = params || {};

  let department;
  try {
    const res = await fetch(`${global_api_ssr}/departments/${department_id}/`, {
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Bo'lim topilmadi");
    const data = await res.json();
    department = data.data
  } catch (error) {
    console.error(error);
    return getDefaultMetadata("AFD Platform  Uz", "Animelar uzbek tilida, Multfilmlar uzbek tilida, Kinolar uzbek tilida, Doramalar uzbek tilida");
  }

  // URL va rasm optimallashtirish
  const pageUrl = `https://afd-platform.uz/${department_id}/${department_name}`;
  const optimizedImage = "https://afd-platform.uz/preview.png";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: department.department_name,
    description: `${department.description} uzbek tilida` || "AFD Platform kinolar bo'limi",
    image: optimizedImage,
    url: pageUrl,
    publisher: {
      "@type": "Organization",
      name: "AFD Platform",
      logo: {
        "@type": "ImageObject",
        url: "https://afd-platform.uz/assets/pf-logo.png"
      }
    }
  };

  return {
    title: `${department.department_name == "Animelar" ? "Anime uzbek tilida, Animelar, Anime filmlar, Uzbekcha animelar, tarjima animelar" : department.department_name} uzbek tilida - AFD Platform`,
    description: `${department.description}, Uzbek tilida. Animelar uzbek tilida. Anime · Tarjima kino · Jahon filmlari · Hind kino · Koreys kino · AQSH seriallar · Turk seriallar. Anime uzbek tilida, animelar, filmlar, kinolar`,
    keywords: [
      department.department_name,
      "kino online",
      "anime ko'rish",
      "animelar uzbek tilida",
      "seriallar",
      "filmlar",
      "AFD Platform",
      "anime",
      "kino",
    ],
    openGraph: {
      title: `${department.department_name} uzbek tilida - AFD Platform`,
      description: `${department.description} uzbek tilida` || "AFD Platform bo'limi",
      url: pageUrl,
      siteName: "AFD Platform",
      images: [
        {
          url: optimizedImage,
          width: 800,
          height: 600,
          alt: department.department_name || "Bo'lim rasmi",
        },
      ],
      type: "website"
    },
    twitter: {
      title: `${department.department_name} - AFD Platform`,
      description: `${department.description} uzbek tilida` || "AFD Platform bo'limi",
      card: "summary_large_image",
      images: [optimizedImage],
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      "script:type:application/ld+json": JSON.stringify(jsonLd)
    },
  };
}

// Standart meta
function getDefaultMetadata(title = "Xatolik", description = "Ma'lumot yuklanmadi.") {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://afd-platform.uz",
      siteName: "AFD Platform",
      images: [
        {
          url: "https://afd-platform.uz/preview.png",
          width: 1200,
          height: 630,
          alt: "AFD Platform",
        },
      ],
      type: "website"
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: ["https://afd-platform.uz/preview.png"],
    },
  };
}

export default function RootLayout({ children }) {
  return <>{children}</>;
}
