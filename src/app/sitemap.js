import { global_api_ssr } from "@/app/_app";

export const revalidate = 3600; // 1 soatda bir yangilanish

const baseUrl = 'https://afd-platform.uz';

const formatUrlString = (name) => {
    return name
        .toLowerCase()
        .replace(/'/g, "")             // faqat apostrof belgilarini olib tashlaydi
        .replace(/[^a-z0-9]+/g, "-")   // qolgan belgilarni bitta "-" ga almashtiradi
        .replace(/^-+|-+$/g, "");      // boshida/oxiridagi "-" larni olib tashlaydi
};

async function fetchData(endpoint) {
    
    try {
        const res = await fetch(`${global_api_ssr}/${endpoint}`, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`${endpoint} yuklanmadi. Status: ${res.status}`);
        }
        
        const data = await res.json();
        
        return data;
    } catch (error) {
        throw error;
    }
}

function resolveRouteData(data) {
    if (!Array.isArray(data)) {
        console.error("Data is not an array, converting to array.");
        data = [data];
    }
    return data;
}

export default async function sitemap() {
    // Statik sahifalar
    const staticPages = [
        { url: baseUrl, lastModified: new Date('2025-01-13'), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/barcha-filmlar`, lastModified: new Date('2025-02-03'), changeFrequency: 'weekly', priority: 0.9 },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
    ];

    try {
        const [moviesResponse, departmentsResponse] = await Promise.all([
            fetchData('movies').catch(error => {
                console.error('Movies fetch error:', error);
                return [];
            }),
            fetchData('departments').catch(error => {
                console.error('Departments fetch error:', error);
                return { data: [] }; // departments strukturasi bilan mos keladigan default qiymat
            })
        ]);

        // Departments ma'lumotini to'g'ri olish
        const departments = departmentsResponse?.data || [];
        
        // Movies ma'lumotini to'g'ri olish
        const movies = Array.isArray(moviesResponse) ? moviesResponse : [];

        // Movies sahifalari
        const moviePages = movies.map(film => ({
            url: `${baseUrl}/${film?.add_departments}/${formatUrlString(film?.department_name || '')}/${film.id}/${formatUrlString(film.movies_name || '')}`,
            lastModified: new Date(film.created_at || new Date()),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // Departments sahifalari
        const departmentPages = departments.map(dep => ({
            url: `${baseUrl}/${dep.department_id}/${formatUrlString(dep.department_name || '')}`,
            lastModified: new Date(dep.created_at || "2024-12-30T20:26:26.922678Z"),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        const allPages = [...staticPages, ...moviePages, ...departmentPages];
        

        return allPages;
    } catch (error) {
        console.error('Sitemap yaratishda xatolik:', error);
        return staticPages;
    }
}