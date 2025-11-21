'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./barcha-filmlar.scss";
import { global_api } from "../_app";
import Loading from "../../components/loading/loading";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const AllDepartmentsClientComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedFilms, setSavedFilms] = useState([]);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessT, setAccessT] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    count: 0,
    page_size: 16
  });

  // URL dan page parametrini olish
  const currentPageFromURL = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const accessT = localStorage.getItem("accessToken");
    if (accessT) {
      setAccessT(accessT);
    }
  }, []);

  const formatFilmNameForURL = (name) => {
    return name
      ?.toLowerCase()
      ?.replace(/'/g, "")
      ?.replace(/[^a-z0-9]+/g, "-")
      ?.replace(/^-+|-+$/g, "");
  };

  // URL ni yangilash funksiyasi
  const updateURL = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNum === 1) {
      params.delete('page');
    } else {
      params.set('page', pageNum.toString());
    }

    router.replace(`/barcha-filmlar?${params.toString()}`, { scroll: false });
  };

  // Filmlarni olish
  const fetchFilms = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${global_api}/all-movies/?page=${pageNum}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setFilms(data.data);
      setPagination(data.pagination);

      // URL ni yangilash
      updateURL(pageNum);

    } catch (error) {
      console.error("Filmlarni olishda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  // URL o'zgarganda filmlarni yangilash
  useEffect(() => {
    fetchFilms(currentPageFromURL);
  }, [currentPageFromURL]);

  // Pagination tugmalari uchun funksiya
  const getPaginationButtons = () => {
    const { current_page, total_pages } = pagination;
    const buttons = [];
    const maxVisibleButtons = 3;

    if (total_pages <= maxVisibleButtons) {
      for (let i = 1; i <= total_pages; i++) {
        buttons.push(i);
      }
    } else {
      let startPage = Math.max(1, current_page - 1);
      let endPage = Math.min(total_pages, current_page + 1);

      if (current_page === 1) {
        startPage = 1;
        endPage = 3;
      } else if (current_page === total_pages) {
        startPage = total_pages - 2;
        endPage = total_pages;
      }

      if (startPage > 1) {
        buttons.push(1);
        if (startPage > 2) {
          buttons.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }

      if (endPage < total_pages) {
        if (endPage < total_pages - 1) {
          buttons.push('...');
        }
        buttons.push(total_pages);
      }
    }

    return buttons;
  };

  const changePage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= pagination.total_pages && pageNum !== pagination.current_page) {
      updateURL(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  // Scroll animatsiyasi
  useEffect(() => {
    const checkVisibility = () => {
      const elements = document.querySelectorAll(".right-reveal");
      const windowHeight = window.innerHeight;

      elements.forEach(element => {
        const elementRect = element.getBoundingClientRect();
        const elementHeight = elementRect.height;

        const visibleHeight = Math.min(elementRect.bottom, windowHeight) - Math.max(elementRect.top, 0);

        if (visibleHeight >= elementHeight * 0.1) {
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      });
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility);
    window.addEventListener("resize", checkVisibility);

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [films]);

  if (loading) return <Loading />;

  return (
    <section id="films-section" className="all-department">
      <h1 id="title">Top kino va multfilmlar</h1>
      <div className="contents">
        {films.length > 0 ? (
          films.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="content-inner content-inner-light right-reveal"
            >
              <Link
                href={`/${item.aldindx}/${formatFilmNameForURL(
                  item.aldnme
                )}/${item.id}/${formatFilmNameForURL(item.alnme)}`}
              >
                <Image
                  src={item.alimage || "/assets/fnotfound.png"}
                  alt={item.alnme}
                  layout="fill"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/assets/fnotfound.png";
                    e.target.style.objectFit = "cover";
                  }}
                />
                <div className="views">
                  <div className="series">
                    {item.alllsrs === "Film" || !item.alllsrs
                      ? "Film"
                      : typeof item.alllsrs === "string" && item.alllsrs.includes("ta qism")
                        ? item.alllsrs
                        : item.alscnt === parseInt(item.alllsrs)
                          ? `${item.alllsrs} ta qism`
                          : `${item.alscnt}-${item.alllsrs}`}
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
                    <span>{item.alcnt}</span>
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
                    <h1>{item.alnme}</h1>
                    <p>Davlat: {item.alcont}</p>
                  </div>
                  <div
                    className="save"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSaveFilm(item);
                    }}
                  >
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
              </Link>
            </div>
          ))
        ) : (
          <h1 className="alerts">Filmlar yo'q</h1>
        )}
      </div>

      {/* Load More tugmasi */}
      <div className="divider"></div>
      {pagination.total_pages > 1 && (
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              onClick={() => changePage(pagination.current_page - 1)}
              disabled={!pagination.previous}
              className="pagination-btn prev-next"
            >
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"></path></svg>
              </span>
              <span>Oldingi</span>
            </button>

            <div className="pagination-numbers">
              {getPaginationButtons().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? changePage(page) : null}
                  className={`pagination-btn ${page === pagination.current_page ? 'active' : ''} ${typeof page !== 'number' ? 'ellipsis' : ''}`}
                  disabled={typeof page !== 'number'}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => changePage(pagination.current_page + 1)}
              disabled={!pagination.next}
              className="pagination-btn prev-next"
            >
              <span>Keyingi</span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"></path></svg>
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AllDepartmentsClientComponent;