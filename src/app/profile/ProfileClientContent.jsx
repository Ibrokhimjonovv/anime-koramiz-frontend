// app/profile/ProfileClientComponent.js
'use client';

import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { AccessContext } from "../../../src/context/context";
import "./profile.scss";
import Loading from "../../components/loading/loading";
import { global_api, global_domen } from "../_app";
import Logout from "@/components/logout/logout";

const ProfileClientComponent = () => {
    const [savedFilms, setSavedFilms] = useState([]);
    const { userData, userLoading } = useContext(AccessContext);
    const [accessT, setAccessT] = useState(null);

    useEffect(() => {
        const accessT = localStorage.getItem("accessToken");
        if (accessT) {
            setAccessT(accessT);
        }
    }, []);

    const formatFilmNameForURL = (name) => {
        return name
            .toLowerCase()
            .replace(/'/g, "")             // faqat apostrof belgilarini olib tashlaydi
            .replace(/[^a-z0-9]+/g, "-")   // qolgan belgilarni bitta "-" ga almashtiradi
            .replace(/^-+|-+$/g, "");      // boshida/oxiridagi "-" larni olib tashlaydi
    };

    useEffect(() => {
        window.addEventListener("scroll", reveal);
        function reveal() {
            let reveals = document.querySelectorAll(".right-reveal");

            for (let i = 0; i < reveals.length; i++) {
                let windowheight = window.innerHeight;
                let revealTop = reveals[i].getBoundingClientRect().top;
                let revealpoint = 0;

                if (revealTop < windowheight - revealpoint) {
                    reveals[i].classList.add("active");
                } else {
                    reveals[i].classList.remove("active");
                }
            }
        }

        return () => window.removeEventListener("scroll", reveal);
    }, []);

    useEffect(() => {
        const fetchSavedFilms = async () => {
            if (!accessT) return;

            try {
                const response = await fetch(`${global_api}/saved-films/`, {
                    headers: {
                        Authorization: `Bearer ${accessT}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Xatolik: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                setSavedFilms(data);
            } catch (error) {
                console.error("API chaqiruvidagi xatolik:", error);
            }
        };

        fetchSavedFilms();
    }, [accessT]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}.${month}.${year}`;
    };

    const toggleSaveFilm = async (film) => {
        if (!accessT) {
            return;
        }

        const isFilmSaved = savedFilms.some(
            (savedFilm) => savedFilm.id === film.id
        );

        try {
            if (isFilmSaved) {
                const response = await fetch(`${global_api}/saved-films/${film.id}/`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessT}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Filmni o'chirishda xatolik");
                }
                setSavedFilms((prevSavedFilms) =>
                    prevSavedFilms.filter((savedFilm) => savedFilm.id !== film.id)
                );
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

                const newSavedFilm = await response.json();
                setSavedFilms((prevSavedFilms) => [...prevSavedFilms, newSavedFilm]);
            }
        } catch (error) {
            console.error("Xatolik:", error);
        }
    };

    if (userLoading) {
        return (
            <div id="re-login" style={{ display: "flex", flexDirection: "column" }}>
                <Loading />
            </div>
        );
    }

    if (accessT === null) {
        return (
            <div style={{ marginTop: "90px" }} className="err-container">
                <div className="err-card">
                    <h3 style={{ textAlign: "center", color: "#fff" }}>
                        Iltimos avval shaxsiy xisobingizga kiring!
                    </h3>
                </div>
            </div>
        );
    }

    return (
        <section id="profile-section">
            <div id="pp">
                <div className="width">
                    <div className="profile-container">
                        <div className="profile-content">
                            <div className="img-container">
                                <img
                                    src={
                                        userData?.profile_image
                                            ? `${global_domen}${userData.profile_image}`
                                            : userData.profileImageUrl || "/assets/pf-logo.png"
                                    }
                                    alt="Profile"
                                />
                            </div>
                            <p id="name">
                                {userData.is_superuser ? (
                                    <Link href="/site/__site_admin__">User is Admin !</Link>
                                ) : (
                                    `${userData?.first_name} ${userData?.last_name}`
                                )}
                            </p>
                        </div>
                        <div className="profile-datas">
                            <p id="username">
                                <span>Foydalanuvchi nomi:</span>
                                <span>{userData?.name || userData?.username}</span>
                            </p>
                            <p id="phone-number">
                                <span>Email:</span>
                                <span>{userData?.email}</span>
                            </p>
                            <p id="created-date">
                                {userData?.dateJoined ? formatDate(userData.dateJoined) : ""}
                            </p>
                            <Link href="/edit-profile" className="edit-profile">
                                Profilni taxrirlash
                            </Link>
                            <Logout />
                        </div>
                    </div>
                    <div className="big-ads">
                        <span>Bu yerda sizning reklamangiz bo'lishi mumkun edi :)</span>
                    </div>
                </div>
                <div className="title-line">
                    <div className="line"></div>
                    <h1>Saqlanganlar</h1>
                </div>
                <div className="saved-container">
                    {savedFilms.length ? (
                        savedFilms.map((item, index) => (
                            <div key={index} className="saved-item right-reveal">
                                <Link
                                    href={`/${item.add_departments}/${formatFilmNameForURL(
                                        item.department_name
                                    )}/${item.id}/${formatFilmNameForURL(
                                        item.movies_name
                                    )}`}
                                >
                                    <img
                                        src={item.movies_preview_url}
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
                                            <span>{item.count}</span>{" "}
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
                                                    {savedFilms.some(
                                                        (savedFilm) => savedFilm.id === item.id
                                                    ) ? (
                                                        <svg
                                                            stroke="currentColor"
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
                                            <p>Davlat: {item.country || "N/A"}</p>
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
                                                        {savedFilms.some(
                                                            (savedFilm) =>
                                                                savedFilm.id === item.id
                                                        ) ? (
                                                            <img src="/assets/saved.png" alt="Saved" />
                                                        ) : (
                                                            <img src="/assets/save.png" alt="Save" />
                                                        )}
                                                    </span>
                                                ) : (
                                                    <Link href="/login">
                                                        <img src="/assets/save.png" alt="Save" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <h1 className="alerts">Saqlangan filmlar mavjud emas</h1>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProfileClientComponent;