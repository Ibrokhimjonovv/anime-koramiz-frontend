"use client";
import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import "../../../styles/filter.scss";
import { global_api } from "../../app/_app";
import Loading from "../../components/loading/loading";

const FilmFilter = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savedFilms, setSavedFilms] = useState([]);
    const [accessT, setToken] = useState(null);
    const [allContent, setAllContent] = useState([]);
    const [allGenres, setAllGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [showMovies, setShowMovies] = useState(true);
    const [showSeries, setShowSeries] = useState(true);
    const [filteredContent, setFilteredContent] = useState([]);

    // Pagination uchun state'lar
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const accessT = localStorage.getItem("accessToken");
        if (accessT) {
            setToken(accessT);
        }
    }, []);

    const formatFilmNameForURL = (name) => {
        return name
            ?.toLowerCase()
            .replace(/'/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "unknown";
    };

    // Chiqarib tashlanadigan janrlar
    const EXCLUDED_GENRES = [
        'tarjima kino', 'Tarjima kino', 'Tarjima kinolar',
        'serial', 'Serial', 'Seriallar', 'fentezi', 'Fentezi',
        "Tarjima-kino", "Tarjima-kinolar", "Anime film",
        "Anime", "Xorij filmi", "Hind-kino", "Tarjima", "Triller", "G'arb", "Harakat", "Anim film", "Boevik", "romantika", "Ujas"
    ];

    // Barcha ma'lumotlarni yuklash
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const filmsRes = await fetch(`${global_api}/movies/`);
                if (!filmsRes.ok) {
                    throw new Error("Filmlarni olishda xato");
                }
                const filmsData = await filmsRes.json();

                // Treylerlarni filter qilish
                const cleanedFilms = filmsData.filter(item => {
                    return item.department_name?.toLowerCase() !== "treylerlar (tez kunda)";
                });

                const genresSet = new Set();
                const filmsWithCleanedGenres = cleanedFilms.map(item => {
                    if (item.genre) {
                        let genres = [];

                        if (typeof item.genre === 'string') {
                            genres = item.genre.split(',').map(g => g.trim());
                        } else if (Array.isArray(item.genre)) {
                            genres = item.genre;
                        }

                        // Chiqarib tashlanadigan janrlarni olib tashlash
                        const cleanedGenres = genres.filter(genre =>
                            !EXCLUDED_GENRES.includes(genre) &&
                            !EXCLUDED_GENRES.includes(genre?.toLowerCase())
                        );

                        // Tozalangan janrlarni set ga qo'shish
                        cleanedGenres.forEach(g => {
                            if (g && g.trim() !== '') {
                                genresSet.add(g);
                            }
                        });

                        // Filmni tozalangan janrlar bilan yangilash
                        return {
                            ...item,
                            genre: cleanedGenres,
                            cleanedGenres: cleanedGenres // Qo'shimcha property
                        };
                    }
                    return item;
                });

                setAllContent(filmsWithCleanedGenres);
                setAllGenres(Array.from(genresSet).sort());
            } catch (error) {
                setError(error.message);
                console.error("Ma'lumotlarni yuklashda xato:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []); // departments dependency qo'shildi

    // Saqlangan filmlarni olish
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

    // Filter qilish funksiyasi
    useEffect(() => {
        if (loading) return;
        if (allContent.length === 0) {
            setFilteredContent([]);
            setTotalPages(1);
            return;
        }
        const content = allContent.filter(item => {
            // Kontent turi bo'yicha filter
            const isSeriesContent = (item.series && item.series_count > 0) ||
                (item.series_count > 0) ||
                (item.all_series && item.all_series !== "Film");

            const isMovieContent = !isSeriesContent;

            const typeMatch =
                (showMovies && isMovieContent) ||
                (showSeries && isSeriesContent);

            // Janrlar bo'yicha filter
            let itemGenres = [];
            if (item.cleanedGenres && item.cleanedGenres.length > 0) {
                itemGenres = item.cleanedGenres;
            } else if (item.genre) {
                if (typeof item.genre === 'string') {
                    itemGenres = item.genre.split(',').map(g => g.trim());
                } else if (Array.isArray(item.genre)) {
                    itemGenres = item.genre;
                }
            }

            const genreMatch =
                selectedGenres.length === 0 ||
                (itemGenres.length > 0 && itemGenres.some(g => selectedGenres.includes(g)));

            return typeMatch && genreMatch;
        });


        // Saralash (oxirgi yangilangan bo'yicha)
        const sortedContent = [...content].sort((a, b) => {
            const getSafeDate = (item) => {
                try {
                    // 1. Asosiy sana
                    if (item?.created_at) {
                        const baseDate = new Date(item.created_at);
                        if (!isNaN(baseDate.getTime())) return baseDate;
                    }

                    // 2. Series sanalari
                    if (Array.isArray(item?.series) && item.series_count > 0) {
                        const validDates = item.series
                            .filter(s => s?.created_at)
                            .map(s => {
                                try {
                                    return new Date(s.created_at);
                                } catch {
                                    return null;
                                }
                            })
                            .filter(d => d && !isNaN(d.getTime()));

                        if (validDates.length > 0) {
                            return new Date(Math.max(...validDates.map(d => d.getTime())));
                        }
                    }

                    // 3. Boshqa alternativ sanalar
                    if (item?.updated_at) {
                        const updatedDate = new Date(item.updated_at);
                        if (!isNaN(updatedDate.getTime())) return updatedDate;
                    }

                    return new Date(0);
                } catch (error) {
                    console.error('Date parsing error:', error);
                    return new Date(0);
                }
            };

            return getSafeDate(b) - getSafeDate(a);
        });

        setFilteredContent(sortedContent);
        setTotalPages(Math.ceil(sortedContent.length / itemsPerPage));
        setCurrentPage(1); // Filter o'zgarganda 1-sahifaga qaytish
    }, [showMovies, showSeries, selectedGenres, allContent, loading, itemsPerPage]);

    // Joriy sahifadagi filmlarni olish
    const getCurrentItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredContent.slice(startIndex, endIndex);
    };

    // Sahifalash funksiyalari
    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0 });
    };

    const goToPrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0 });
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
        window.scrollTo({ top: 0 });
    };

    // Saqlash funksiyasi
    const toggleSaveFilm = async (film) => {
        if (!accessT) return;

        try {
            if (savedFilms.includes(film.id)) {
                await fetch(`${global_api}/saved-films/${film.id}/`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${accessT}` }
                });
                setSavedFilms(prev => prev.filter(id => id !== film.id));
            } else {
                await fetch(`${global_api}/saved-films/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessT}`
                    },
                    body: JSON.stringify({ filmId: film.id })
                });
                setSavedFilms(prev => [...prev, film.id]);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    if (loading) return <Loading />;

    return (
        <section id="films-section">
            <h3 id="tit">Filterlash</h3>

            {/* Filter qismi */}
            <div className="filter-cont">
                <div className="filter-controls">
                    <div className="filter-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={showMovies}
                                onChange={() => setShowMovies(!showMovies)}
                            />
                            <span className="custom-checkbox"></span>
                            Filmlar
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={showSeries}
                                onChange={() => setShowSeries(!showSeries)}
                            />
                            <span className="custom-checkbox"></span>
                            Seriallar
                        </label>
                    </div>

                    <div className="filter-group">
                        <h3>Janrlar</h3>
                        <div className="genre-filters">
                            {allGenres.map(genre => (
                                <label key={genre}>
                                    <input
                                        type="checkbox"
                                        checked={selectedGenres.includes(genre)}
                                        onChange={() => setSelectedGenres(prev =>
                                            prev.includes(genre)
                                                ? prev.filter(g => g !== genre)
                                                : [...prev, genre]
                                        )}
                                    />
                                    <span className="custom-checkbox"></span>
                                    {genre}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="row-cont">
                    <div className="contents">
                        {getCurrentItems().length > 0 ? (
                            getCurrentItems().map((item, index) => {
                                return (
                                    <Link
                                        key={item.id || index}
                                        prefetch={false}
                                        href={`/${item.add_departments}/${formatFilmNameForURL(item.department_name)}/${item.id}/${formatFilmNameForURL(item.movies_name)}`}
                                    >
                                        <div className={`content-inner content-inner-light ${savedFilms.includes(item.id) ? "saved" : ""}`}>
                                            <img
                                                src={item.movies_preview_url || "/assets/fnotfound.png"}
                                                alt={item.movies_name}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/assets/fnotfound.png";
                                                    e.target.style.objectFit = "cover";
                                                }}
                                            />

                                            <div className="views">
                                                <div className="series">
                                                    {item.all_series === "Film"
                                                        ? "Film"
                                                        : typeof item.all_series === "string" && item.all_series.includes("ta qism")
                                                            ? item.all_series
                                                            : item.series_count === parseInt(item.all_series)
                                                                ? `${item.all_series} ta qism`
                                                                : `${item.series_count || 0}-${item.all_series}`}
                                                </div>

                                                <div className="count">
                                                    <svg
                                                        width="21"
                                                        height="20"
                                                        viewBox="0 0 21 20"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        {/* SVG content */}
                                                    </svg>
                                                    <span>{item.count || 0}</span>
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
                                                                    <img src="/assets/saved.png" alt="" />
                                                                ) : (
                                                                    <img src="/assets/save.png" alt="" />
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <Link href="/login" className="save-login">
                                                                <img src="/assets/save.png" alt="" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="no-films">
                                <h1 className="alerts">Filmlar topilmadi</h1>
                                <p>Filter sozlamalarini o'zgartirib ko'ring</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination controls */}
                    {filteredContent.length > itemsPerPage && (
                        <div className="pagination">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="pagination-button"
                            >
                                &lt;
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="pagination-button"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FilmFilter;