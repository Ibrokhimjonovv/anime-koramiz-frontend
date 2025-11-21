"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { global_api } from "../../_app";
import "./departmentsDetail.scss";
import Loading from "../../../components/loading/loading";
import Image from "next/image"

const FilmDepartmentContainer = () => {
  const { department_id, department_name } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [films, setFilms] = useState([]);
  const [savedFilms, setSavedFilms] = useState([]);
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
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // URL ni yangilash funksiyasi
  const updateURL = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNum === 1) {
      params.delete('page');
    } else {
      params.set('page', pageNum.toString());
    }

    router.replace(`/${department_id}/${department_name}?${params.toString()}`, { scroll: false });
  };

  // Department filmlarini olish
  const fetchDepartmentFilms = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${global_api}/departments/${department_id}/movies/?page=${pageNum}`);

      if (!response.ok) {
        throw new Error("Tarmoq xatosi (Filmlar olishda xatolik)");
      }

      const data = await response.json();
      setFilms(data.data);
      setPagination(data.pagination);

      // URL ni yangilash
      updateURL(pageNum);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // URL o'zgarganda filmlarni yangilash
  useEffect(() => {
    if (department_id) {
      fetchDepartmentFilms(currentPageFromURL);
    }
  }, [department_id, currentPageFromURL]);

  // Pagination tugmalari
  const getPaginationButtons = () => {
    const { current_page, total_pages } = pagination;
    const buttons = [];

    // Har doim 1-chi sahifa
    buttons.push(1);

    // Joriy sahifa va uning atrofidagilar
    if (current_page > 2) {
      buttons.push(current_page - 1);
    }
    if (current_page !== 1 && current_page !== total_pages) {
      buttons.push(current_page);
    }
    if (current_page < total_pages - 1) {
      buttons.push(current_page + 1);
    }

    // Har doim oxirgi sahifa
    if (total_pages > 1) {
      buttons.push(total_pages);
    }

    // ... qo'shish
    const result = [];
    for (let i = 0; i < buttons.length; i++) {
      result.push(buttons[i]);
      if (buttons[i + 1] && buttons[i + 1] - buttons[i] > 1) {
        result.push('...');
      }
    }

    return result;
  };

  const changePage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= pagination.total_pages && pageNum !== pagination.current_page) {
      // Faqat URL ni yangilaymiz, useEffect avtomatik filmlarni yangilaydi
      updateURL(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Saqlangan filmlarni olish
  useEffect(() => {
    const fetchSavedFilms = async () => {
      if (!accessT) {
        setSavedFilms([]);
        return;
      }

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
        setSavedFilms([]);
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

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <p>Xato: {error}</p>;
  }

  return (
    <section className="padd helper">
      <h1 id="title">
        Top Animelar
      </h1>

      <div className="contents">
        {films.length ? (
          films.map((item, index) => (
            <div key={`${item.id}-${index}`} className="content-inner content-inner-light">
              <Link
                href={`/${item.department_id}/${formatFilmNameForURL(item.dmdnme)}/${item.id}/${formatFilmNameForURL(item.dmnme)}`}
              >
                <Image
                  src={item.dmimage || "/assets/fnotfound.png"}
                  alt={item.dmnme}
                  layout="fill"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/assets/fnotfound.png";
                    e.target.style.objectFit = "cover";
                  }}
                />
                <div className="views">
                  <div className="series">
                    {item.dmllsrs === "Film" || !item.dmllsrs
                      ? "Film"
                      : typeof item.dmllsrs === "string" && item.dmllsrs.includes("ta qism")
                        ? item.dmllsrs
                        : item.dmscnt === parseInt(item.dmllsrs)
                          ? `${item.dmllsrs} ta qism`
                          : `${item.dmscnt}-${item.dmllsrs}`}
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
                    <span>{item.dmcnt}</span>
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
                    <h1>{item.dmnme}</h1>
                    <p>Davlat: {item.dmcont}</p>
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
          <h1>Filmlar mavjud emas</h1>
        )}
      </div>

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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"></path></svg>
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default FilmDepartmentContainer;