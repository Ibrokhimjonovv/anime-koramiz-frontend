import { global_api_ssr } from "@/app/_app";

function escapeXML(value = "") {
    if (!value) return "";

    return value
        .replace(/[‘’]/g, "'")   // single quote
        .replace(/[“”]/g, '"')   // double quote
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
        .replace(/[\uD800-\uDFFF]/g, "");
}

function getMimeType(url = "") {
    const ext = url.split(".").pop().toLowerCase();
    switch (ext) {
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "webp":
            return "image/webp";
        case "gif":
            return "image/gif";
        default:
            return "image/*";
    }
}

const formatFilmNameForURL = (name) => {
    return name
        .toLowerCase()
        .replace(/'/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};



// Fayl hajmini olish uchun HEAD so‘rovi
async function getFileSize(url) {
    try {
        const res = await fetch(url, { method: "HEAD" });
        const length = res.headers.get("content-length");
        return length ? parseInt(length, 10) : 0;
    } catch (err) {
        console.error("Fayl hajmini olishda xatolik:", err);
        return 0; // fallback
    }
}

export async function getRssData() {
    const [moviesRes, depRes] = await Promise.all([
        fetch(`${global_api_ssr}/movies`, { cache: "no-store" }),
        fetch(`${global_api_ssr}/departments`, { cache: "no-store" }),
    ]);

    if (!moviesRes.ok || !depRes.ok) throw new Error("API dan ma’lumot olinmadi");

    const movies = await moviesRes.json();
    
    const departmentsData = await depRes.json();
    const departments = departmentsData.data || [];

    const depMap = {};
    departments.forEach((dep) => {
        depMap[dep.department_id] = dep.department_name;
    });

    // Har bir rasm hajmini olish
    const rssItems = await Promise.all(
        movies.map(async (movie) => {
            const imageUrl = escapeXML(movie.movies_preview_url) || null;
            const fileSize = imageUrl ? await getFileSize(movie.movies_preview_url) : 0;

            return {
                title: `${escapeXML(movie.movies_name || "")} Uzbek tilida`,
                link: escapeXML(`https://afd-platform.uz/${movie.add_departments}/${formatFilmNameForURL(movie.department_name)}/${movie.id}/${formatFilmNameForURL(movie.movies_name)}`),
                guid: escapeXML(`https://afd-platform.uz/${movie.add_departments}/${formatFilmNameForURL(movie.department_name)}/${movie.id}/${formatFilmNameForURL(movie.movies_name)}`),
                description: escapeXML((movie.movies_description || "").substring(0, 200)) + "...",
                category: escapeXML(movie.department_name),
                pubDate: new Date(movie.created_at).toUTCString(),
                image: imageUrl,
                mimeType: imageUrl ? getMimeType(imageUrl) : null,
                length: fileSize, // ✅ qo‘shildi
                fullText: escapeXML(movie.movies_description || ""),
            };
        })
    );

    return rssItems;
}
