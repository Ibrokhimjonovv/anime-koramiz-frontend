"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "./search.scss";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { global_api } from "../_app";
import Loading from "@/components/loading/loading";
import Image from "next/image"

const SearchContent = ({ initialQuery = "" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || initialQuery;
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!urlQuery);
  const searchInputRef = useRef(null);
  const [savedFilms, setSavedFilms] = useState([]);
  const [accessT, setAccessT] = useState(null);

  // So'rov yuborishni oldini olish uchun flag
  const isSearchingRef = useRef(false);

  useEffect(() => {
    const accessT = localStorage.getItem("accessToken");
    if (accessT) {
      setAccessT(accessT)
    }
  }, []);

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AFD Platform",
    "url": "https://afd-platform.uz",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://afd-platform.uz/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const updateURL = (query) => {
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set('q', query);
    } else {
      params.delete('q');
    }

    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  const formatFilmNameForURL = (name) => {
    return name
      ?.toLowerCase()
      ?.replace(/'/g, "")
      ?.replace(/[^a-z0-9]+/g, "-")
      ?.replace(/^-+|-+$/g, "");
  };

  // useCallback bilan funksiyani memorizatsiya qilish
  const handleSearch = useCallback(async (query = searchQuery) => {
    // Agar allaqachon qidiruv bajarilayotgan bo'lsa, yangi so'rov yubormaslik
    if (isSearchingRef.current) return;

    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      updateURL('');
      return;
    }

    isSearchingRef.current = true;
    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`${global_api}/search/?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error("Qidiruvda xatolik yuz berdi");
      }

      const data = await response.json();
      setSearchResults(data.data || []);

      // URL ni yangilash
      updateURL(query);

    } catch (error) {
      console.error("Qidiruv xatosi:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  }, [searchQuery, searchParams, router]);

  // useEffect ni optimallashtirish
  useEffect(() => {
    // Faqat urlQuery mavjud bo'lganda va searchQuery bilan mos kelmaganda qidiruvni boshlash
    if (urlQuery && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      handleSearch(urlQuery);
    }
  }, [urlQuery]); // Faqat urlQuery o'zgarganda ishlaydi

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
  };

  const clearInput = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    updateURL('');
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const fetchSavedFilms = async () => {
      if (!accessT) return;

      try {
        const response = await fetch(`${global_api}/saved-films/`, {
          headers: { Authorization: `Bearer ${accessT}` }
        });
        if (response.ok) {
          const savedData = await response.json();
          setSavedFilms(savedData.map(film => film.id));
        }
      } catch (error) {
        console.error("Saqlangan filmlarni olishda xato:", error);
      }
    };

    fetchSavedFilms();
  }, [accessT]);

  const toggleSaveFilm = async (film) => {
    if (!accessT) {
      return;
    }
    try {
      if (savedFilms.includes(film.id)) {
        const response = await fetch(`${global_api}/saved-films/${film.id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessT}`,
          },
        });
        if (!response.ok) {
          throw new Error("Filmni o'chirishda xatolik");
        }
        setSavedFilms((prev) => prev.filter((id) => id !== film.id));
      } else {
        const response = await fetch(`${global_api}/saved-films/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessT}`,
          },
          body: JSON.stringify({ filmId: film.id }),
        });
        if (!response.ok) {
          throw new Error("Filmni saqlashda xatolik");
        }
        setSavedFilms((prev) => [...prev, film.id]);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div id="search-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Bosh sahifa",
                "item": "https://afd-platform.uz"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": searchQuery ? `"${searchQuery}" qidiruvi` : "Qidiruv",
                "item": searchQuery
                  ? `https://afd-platform.uz/search?q=${encodeURIComponent(searchQuery)}`
                  : "https://afd-platform.uz/search"
              }
            ]
          })
        }}
      />
      <div className="search">
        <div className="input-cont">
          <div className="input-x-btn">
            <input
              id="search-input"
              type="text"
              placeholder="Film nomini kiriting..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              autoComplete="off"
              ref={searchInputRef}
            />
            <button onClick={clearInput} className="clear-search">
              +
            </button>
          </div>
          <button className="search-btn" onClick={() => handleSearch()} disabled={loading}>
            {loading ? "Qidirilmoqda..." : "Qidirish"}
          </button>
        </div>

        <div className="suggest-films-users-cont">
          {/* Qidiruv boshlanmagan */}
          {!hasSearched && (
            <h2>
              Filmlarni qidiring va tomoshadan zavqlaning :<span>)</span>
            </h2>
          )}

          {/* Qidiruv boshlangan, lekin natija yo'q */}
          {!loading && hasSearched && searchResults.length === 0 && (
            <h2 className="search-result-text">
              "{searchQuery}" bo'yicha hech qanday film topilmadi :<span>(</span>
            </h2>
          )}

          {/* Yuklanayotganda */}
          {loading && (
            <div className="loading-container">
              <Loading />
              <p>Qidirilmoqda...</p>
            </div>
          )}

          {/* Natijalar topilgan */}
          {hasSearched && !loading && searchResults.length > 0 && (
            <div className="search-results">
              <div className="results-header">
                <h3>"{searchQuery}" bo'yicha {searchResults.length} ta film topildi</h3>
              </div>

              <div className="suggestions">
                {searchResults.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="film-result">
                    <Link
                      prefetch={false}
                      href={`/${item.department_id}/${formatFilmNameForURL(item.department_name)}/${item.id}/${formatFilmNameForURL(item.movies_name)}`}
                      onClick={clearInput}
                    >
                      <div className="content-inner content-inner-light">
                        <div className="image-container">
                          <Image
                            src={item.movies_preview_url}
                            alt={item.movies_name}
                            width={300}
                            height={400}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="views">
                          <div className="series">
                            {item.all_series === "Film" || !item.all_series
                              ? "Film"
                              : typeof item.all_series === "string" && item.all_series.includes("ta qism")
                                ? item.all_series
                                : item.series_count === parseInt(item.all_series)
                                  ? `${item.all_series} ta qism`
                                  : `${item.series_count}-${item.all_series}`}
                          </div>
                          <div className="count">
                            <svg
                              width="21"
                              height="20"
                              viewBox="0 0 21 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g clipPath="url(#clip0_1476_12332)">
                                <path
                                  d="M1.16699 10C1.16699 10 4.50033 3.33334 10.3337 3.33334C16.167 3.33334 19.5003 10 19.5003 10C19.5003 10 16.167 16.6667 10.3337 16.6667C4.50033 16.6667 1.16699 10 1.16699 10Z"
                                  stroke="#767676"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M10.3337 12.5C11.7144 12.5 12.8337 11.3807 12.8337 10C12.8337 8.6193 11.7144 7.50001 10.3337 7.50001C8.95295 7.50001 7.83366 8.6193 7.83366 10C7.83366 11.3807 8.95295 12.5 10.3337 12.5Z"
                                  stroke="#767676"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_1476_12332">
                                  <rect
                                    width="20"
                                    height="20"
                                    fill="white"
                                    transform="translate(0.333496)"
                                  />
                                </clipPath>
                              </defs>
                            </svg>
                            <span>{item.count}</span>
                          </div>
                          <div
                            className="save-mob"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSaveFilm(item);
                            }}
                          >
                            {accessT ? (
                              <span>
                                {savedFilms.includes(item.id) ? (
                                  <svg
                                    stroke="#f79623"
                                    fill="#FF8C22"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    height="1em"
                                    width="1em"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                  </svg>
                                ) : (
                                  <svg
                                    stroke="#f79623"
                                    fill="none"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    height="1em"
                                    width="1em"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                  </svg>
                                )}
                              </span>
                            ) : (
                              <Link href="/login" className="save-login">
                                <svg
                                  stroke="#f79623"
                                  fill="none"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  height="1em"
                                  width="1em"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="data">
                          <div className="texts">
                            <h1>{item.movies_name}</h1>
                            <p>Davlat: {item.country}</p>
                          </div>
                          <div
                            className="save"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSaveFilm(item);
                            }}
                          >
                            <div className="saved-contt">
                              {accessT ? (
                                <span>
                                  {savedFilms.includes(item.id) ? (
                                    <img src='/assets/saved.png' alt="" />
                                  ) : (
                                    <img src='/assets/save.png' alt="" />
                                  )}
                                </span>
                              ) : (
                                <Link href="/login" className="save-login">
                                  <img src='/assets/save.png' alt="" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchContent;