"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
// Styles
import "./films.scss";
// Images
// Global API
import { global_api } from "../../app/_app";
import Loading from "../loading/loading";

const Films = () => {
  const [savedFilms, setSavedFilms] = useState([]);
  const [accessT, setAccessT] = useState(null);
  const [films, setFilms] = useState([]); // ✅ Yangi state
  const [loading, setLoading] = useState(true); // ✅ Yangi state

  useEffect(() => {
    const accessT = localStorage.getItem("accessToken");
    if (accessT) {
      setAccessT(accessT)
    }
  }, []);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${global_api}/hmvs/`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setFilms(data.data); // ✅ Yangi formatdagi filmlar
      } catch (error) {
        console.error("Filmlarni olishda xato:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  const formatFilmNameForURL = (name) => {
    return name
      ?.toLowerCase()
      ?.replace(/'/g, "")
      ?.replace(/ʻ/g, "")
      ?.replace(/[^a-z0-9]+/g, "-")
      ?.replace(/^-+|-+$/g, "");
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
      if (savedFilms.includes(film.id)) { // ✅ Yangi ID format
        const response = await fetch(`${global_api}/saved-films/${film.id}/`, { // ✅ Yangi ID
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessT}`,
          },
        });
        if (!response.ok) {
          throw new Error("Filmni o'chirishda xatolik");
        }
        setSavedFilms((prev) => prev.filter((id) => id !== film.id)); // ✅ Yangi ID
      } else {
        const response = await fetch(`${global_api}/saved-films/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessT}`,
          },
          body: JSON.stringify({ filmId: film.id }), // ✅ Yangi ID
        });
        if (!response.ok) {
          throw new Error("Filmni saqlashda xatolik");
        }
        setSavedFilms((prev) => [...prev, film.id]); // ✅ Yangi ID
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", reveal);

    function reveal() {
      let reveals = document.querySelectorAll(".right-reveal");

      for (let i = 0; i < reveals.length; i++) {
        let windowheight = window.innerHeight;
        let revealTop = reveals[i].getBoundingClientRect().top;
        let revealpoint = windowheight * 0.1;

        if (revealTop < windowheight - revealpoint) {
          reveals[i].classList.add("active");
        } else {
          reveals[i].classList.remove("active");
        }
      }
    }
    return () => window.removeEventListener("scroll", reveal);
  }, []);

  return (
    <section id="films-section">
      <h1 id="title">Top Animelar</h1>
      <div className="contents">
        {loading ? (
          <Loading />
        ) : films.length ? (
          films.slice(0, 16).map((item, index) => (
            <Link
              key={index}
              prefetch={false}
              href={`/${item.hfsdindx}/${formatFilmNameForURL(item?.hfsdnme)}/${item.id}/${formatFilmNameForURL(item.hfsnme)}`} // ✅ Yangi fieldlar
              className=""
            >
              <div
                className={`content-inner content-inner-light right-reveal ${savedFilms.includes(item.id) ? "saved" : "" // ✅ Yangi ID
                  }`}
              >
                <Image
                  src={item.hfsimage} // ✅ Yangi field
                  alt={item.hfsnme} // ✅ Yangi field
                  layout="fill"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/assets/fnotfound.png";
                    e.target.style.objectFit = "cover";
                  }}
                />
                <div className="views">
                  <div className="series">
                    {item.hfsllsrs === "Film" || !item.hfsllsrs
                      ? "Film"
                      : typeof item.hfsllsrs === "string" && item.hfsllsrs.includes("ta qism")
                        ? item.hfsllsrs
                        : item.hfsscnt === parseInt(item.hfsllsrs)
                          ? `${item.hfsllsrs} ta qism`
                          : `${item.hfsscnt}-${item.hfsllsrs}`} 
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
                    <span>{item.hfscnt}</span> {/* ✅ Yangi field */}
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
                        {savedFilms.includes(item.id) ? ( // ✅ Yangi ID
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
                    <h1>{item.hfsnme}</h1> {/* ✅ Yangi field */}
                    <p>Davlat: {item.hfscont}</p> {/* ✅ Yangi field */}
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
                          {savedFilms.includes(item.id) ? ( // ✅ Yangi ID
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
          ))
        ) : (
          <h1 className="alerts"></h1>
        )}
      </div>
      <div className="divider"></div>
      <div id="see-all">
        <Link href="/barcha-animelar">Barchasini ko'rish</Link>
      </div>
    </section>
  );
};

export default Films;