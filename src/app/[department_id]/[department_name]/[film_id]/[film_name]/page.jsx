"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./filmInner.scss";
import Link from "next/link";
import { global_api, global_proxy } from "../../../../_app";
import Loading from "../../../../../components/loading/loading";
import MovieComments from "../../../../../components/moviesComments/moviesComments";
import GetVotes from "../../../../../components/getVotes/getVotes";
import { useParams } from "next/navigation";
import NotFound from "@/app/not-found";
import soon from "./soon.png"
import Image from 'next/image';

const FilmInner = () => {
  const params = useParams();
  if (!params) {
    return <div>Loading...</div>;
  }


  const [devToolsOpen, setDevToolsOpen] = useState(false);

  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const newDevToolsOpen = window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;
      setDevToolsOpen(newDevToolsOpen);
      // window.location.href = '/'
    };

    const intervalId = setInterval(detectDevTools, 1000); 

    return () => clearInterval(intervalId);
  }, []);


  const [state, setState] = useState({
    loading: true,
    error: "",
    filmData: null,
    selectedSeries: null,
    suggestedFilms: [],
    savedFilms: [],
    isBlocked: false,
    accessT: null
  });

  const hasIncrementedCount = React.useRef(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setState(prev => ({ ...prev, accessT: accessToken }));
    }
  }, []);

  const formatFilmNameForURL = useCallback((name) => {
    return name
      ?.toLowerCase()
      ?.replace(/'/g, "")
      ?.replace(/[^a-z0-9]+/g, "-")
      ?.replace(/^-+|-+$/g, "");
  }, []);

  const formatEpisodeTitle = useCallback((title) => {
    return title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.film_id || devToolsOpen) return;

      setState(prev => ({ ...prev, loading: true, error: "" }));

      try {
        // Count ni oshirish (faqat bir marta)
        if (!hasIncrementedCount.current && !params.episode) {
          try {
            await fetch(`${global_api}/movies/${params.film_id}/increment-count/`, {
              method: 'POST', // Metodni aniq belgilash
              headers: {
                'Content-Type': 'application/json',
              },
            });
            hasIncrementedCount.current = true;
          } catch (error) {
            console.error('Count oshirishda xatolik:', error);
          }
        }

        // Film ma'lumotlarini olish
        const filmResponse = await fetch(`${global_api}/movies/${params.film_id}/`);

        if (!filmResponse.ok) {
          if (filmResponse.status === 403) {
            const errorData = await filmResponse.json();
            setState(prev => ({
              ...prev,
              error: errorData.error,
              isBlocked: true,
              loading: false
            }));
            return;
          }
          throw new Error("Film ma'lumotlarini olishda xatolik");
        }

        const filmData = await filmResponse.json();

        // O'xshash filmlarni olish
        const similarResponse = await fetch(
          `${global_api}/similar-movies/?movie_id=${params.film_id}&limit=30`
        );
        const similarData = similarResponse.ok ? await similarResponse.json() : [];

        // Seriyalarni sozlash
        let selectedSeries = null;
        if (filmData.series && filmData.series.length > 0) {
          const sortedSeries = filmData.series.sort((a, b) => a.id - b.id);
          if (params.episode) {
            const formattedEpisode = formatEpisodeTitle(params.episode);
            selectedSeries = sortedSeries.find(
              s => formatEpisodeTitle(s.title) === formattedEpisode
            ) || sortedSeries[0];
          } else {
            selectedSeries = sortedSeries[0];
          }
        }

        setState(prev => ({
          ...prev,
          filmData,
          selectedSeries,
          suggestedFilms: similarData,
          loading: false
        }));

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
        console.error("Film yuklash xatosi:", error);
      }
    };

    fetchData();
  }, [params.film_id, params.episode, formatEpisodeTitle]);

  useEffect(() => {
    const fetchSavedFilms = async () => {
      if (!state.accessT || devToolsOpen) return;

      try {
        const response = await fetch(`${global_api}/saved-films/`, {
          headers: { Authorization: `Bearer ${state.accessT}` },
        });

        if (response.ok) {
          const savedData = await response.json();
          setState(prev => ({
            ...prev,
            savedFilms: savedData.map(film => film.id)
          }));
        }
      } catch (error) {
        console.log("Saqlangan filmlar xatosi:", error.message);
      }
    };

    fetchSavedFilms();
  }, [state.accessT]);

  const toggleSaveFilm = async (film) => {
    if (!state.accessT || !film || devToolsOpen) return;

    try {
      const isCurrentlySaved = state.savedFilms.includes(film.id);

      if (isCurrentlySaved) {
        // O'chirish - URL parametri bilan
        const response = await fetch(`${global_api}/saved-films/${film.id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${state.accessT}`,
          },
        });

        if (response.ok) {
          setState(prev => ({
            ...prev,
            savedFilms: prev.savedFilms.filter(id => id !== film.id)
          }));
        } else {
          const errorData = await response.json();
          console.error("O'chirishda xatolik:", errorData);
        }
      } else {
        // Qo'shish - Body bilan
        const response = await fetch(`${global_api}/saved-films/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.accessT}`,
          },
          body: JSON.stringify({ filmId: film.id }),
        });

        if (response.ok) {
          setState(prev => ({
            ...prev,
            savedFilms: [...prev.savedFilms, film.id]
          }));
        } else {
          const errorData = await response.json();
          console.error("Qo'shishda xatolik:", errorData);
        }
      }
    } catch (error) {
      console.error("Film saqlash xatosi:", error.message);
    }
  };

  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = "/assets/fnotfound.png";
    e.target.style.objectFit = "cover";
  }, []);

  const pageLink = useMemo(() =>
    `https://afd-platform.uz/${params?.department_id}/${params?.department_name}/${params?.film_id}/${params?.film_name}`,
    [params]
  );

  const movieType = useMemo(() => {
    const types = {
      15: "k-drama", 2: "film", 3: "anime",
      4: "multfilm", 5: "j-drama"
    };
    return types[params.department_id] || "film";
  }, [params.department_id]);

  const playerTitle = useMemo(() => {
    if (!state.filmData) return "";
    const baseTitle = state.filmData.movies_name;
    if (!state.selectedSeries) return baseTitle;

    const hasEpisodeWord = state.selectedSeries.title.toLowerCase().includes("qism") ||
      state.selectedSeries.title.toLowerCase().includes("episode");

    return hasEpisodeWord
      ? `${baseTitle} - ${state.selectedSeries.title}`
      : `${baseTitle} - Qism ${state.selectedSeries.title}`;
  }, [state.filmData, state.selectedSeries]);

  if (state.loading) return <Loading />;
  if (state.isBlocked) {
    return (
      <div className="not-available-message">
        <p>USHBU FILMNI TOMOSHA QILISH UCHUN SAYTIMIZGA VPN ORQALI KIRISHINGIZ KERAK!</p>
        <p>HAR QANDAY VPN BILAN KIRISHINGIZ MUMKIN!</p>
        <p>SHUNDA FILMNI TOMOSHA QILA OLASIZ!</p>
      </div>
    );
  }
  if (state.error) return <p>Xato: {state.error}</p>;
  if (!state.filmData) return <NotFound />;

  return (
    <div className="film-inner-container">

      <div className="width">
        <div className="film-item">
          <div className="player-films">
            {/* Player mantiqi */}
            {Number(params.department_id) === 20 ? (
              <img id="soon-img" src={soon.src} alt="" />
            ) : state.selectedSeries?.title.toLowerCase().includes('filler') ? (
              <img id="filler-img" src="/assets/filler.jpg" alt="" />
            ) : (
              <div className="react-player-wrapper">
                {state.selectedSeries?.video_url ? (
                  state.selectedSeries.video_url.includes("<iframe") ? (
                    <div
                      className="for-iframe"
                      dangerouslySetInnerHTML={{ __html: state.selectedSeries.video_url }}
                    />
                  ) : (
                    <h1>Video yuklashda xatolik!</h1>
                  )
                ) : state.filmData?.movies_url ? (
                  state.filmData.movies_url.includes("<iframe") ? (
                    <div
                      className="for-iframe"
                      dangerouslySetInnerHTML={{ __html: state.filmData.movies_url }}
                    />
                  ) : (
                    <h1>Video yuklashda xatolik!</h1>
                  )
                ) : (
                  <p>Video mavjud emas</p>
                )}
              </div>
            )}
          </div>

          {/* O'xshash filmlar */}
          <SuggestedFilms
            films={state.suggestedFilms}
            movieType={movieType}
            formatFilmNameForURL={formatFilmNameForURL}
            handleImageError={handleImageError}
            isDesktop={true}
          />
        </div>

        <div className="about-container">
          <div className="about-left">
            <FilmInfo
              filmData={state.filmData}
              params={params}
              selectedSeries={state.selectedSeries}
              accessT={state.accessT}
              savedFilms={state.savedFilms}
              toggleSaveFilm={toggleSaveFilm}
              formatEpisodeTitle={formatEpisodeTitle}
              formatFilmNameForURL={formatFilmNameForURL}
            />

            {/* <GetVotes
              movieId={state.filmData.id}
              department={params.department_id}
              initialLikes={state.filmData.like_count}
              initialDislikes={state.filmData.dislike_count}
              userVote={state.filmData.user_vote}
            />

            <MovieComments
              movieId={state.filmData.id}
              id={params.film_id}
              initialComments={state.filmData.comments}
            /> */}

            <SuggestedFilms
              films={state.suggestedFilms}
              movieType={movieType}
              formatFilmNameForURL={formatFilmNameForURL}
              handleImageError={handleImageError}
              isDesktop={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SuggestedFilms = ({ films, movieType, formatFilmNameForURL, handleImageError, isDesktop }) => (
  <div className={`suggested-films ${isDesktop ? 'deskt-ver' : 'mob-ver'}`}>
    <h3>O'xshash {movieType}lar</h3>
    {films.length > 0 ? (
      films.map((film) => (
        <Link
          key={film.id}
          href={`/${film.add_departments}/${formatFilmNameForURL(film.department_name)}/${film.id}/${formatFilmNameForURL(film.movies_name)}`}
          prefetch={false} // Prefetch ni o'chirish
        >
          <div className="suggested-item">
            <div className="img">
              <Image
                src={film.movies_preview_url}
                alt={film.movies_name}
                layout="fill" // yoki "fill", "intrinsic"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={(e) => {
                  e.target.src = "/assets/fnotfound.png";
                  e.target.style.objectFit = "cover";
                }}
              />
            </div>
            <div className="text">
              <h3>{film.movies_name}</h3>
              <p>{film.movies_description}</p>
              <div className="country">
                <span>{film.country || "Noma'lum"}</span>
              </div>
            </div>
          </div>
        </Link>
      ))
    ) : (
      <p>O'xshash filmlar topilmadi</p>
    )}
  </div>
);

const FilmInfo = ({ filmData, params, selectedSeries, accessT, savedFilms, toggleSaveFilm, formatEpisodeTitle, formatFilmNameForURL }) => {
  const formatDate = (date) => {
    const dateObj = new Date(date);
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
  };

  return (
    <div className="about-film">
      <h1 className="film-title">{filmData.movies_name}</h1>

      {/* <div
        className={`save-container ${savedFilms.includes(filmData.id) ? "saved" : ''}`}
        onClick={(e) => {
          e.preventDefault();
          toggleSaveFilm(filmData);
        }}
      >
        {accessT ? (
          <p className={savedFilms.includes(filmData.id) ? "saved" : 'save'}>
            {savedFilms.includes(filmData.id) ? "Film saqlangan" : "Filmni saqlash"}
          </p>
        ) : (
          <Link href="/login">Saqlash uchun xisobingizga kiring</Link>
        )}
      </div> */}

      <div className="my-telegram">
        <Link href="https://t.me/afdplatformuz" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="32" viewBox="0 0 32 32" width="32">
            <path d="m0 16c0 8.8366 7.16344 16 16 16 8.8366 0 16-7.1634 16-16 0-8.83656-7.1634-16-16-16-8.83656 0-16 7.16344-16 16z" fill="#08c" />
            <path d="m8.09992 15.7083c4.29498-1.8712 7.15898-3.1049 8.59198-3.7009 4.0915-1.7018 4.9416-1.9974 5.4958-2.0073.1218-.00205.3943.0282.5709.1714.149.1209.19.2843.2097.399.0196.1146.044.3759.0246.58-.2217 2.3296-1.1811 7.983-1.6692 10.5922-.2065 1.1041-.6132 1.4743-1.0069 1.5105-.8555.0787-1.5052-.5654-2.3339-1.1086-1.2967-.85-2.0292-1.3792-3.2879-2.2086-1.4546-.9586-.5116-1.4854.3174-2.3464.2169-.2253 3.9866-3.6541 4.0595-3.9652.0092-.0389.0176-.1839-.0685-.2605-.0862-.0765-.2133-.0503-.3051-.0295-.13.0295-2.2015 1.3987-6.2144 4.1075-.588.4038-1.1206.6005-1.5977.5902-.5261-.0114-1.53798-.2975-2.29022-.542-.92265-.2999-1.65596-.4585-1.5921-.9678.03326-.2653.3986-.5367 1.09604-.814z" fill="#fff" />
          </svg>
          Bizga telegramda qo'shiling
        </Link>
      </div>
      <div className="my-telegram">
        <Link href="https://t.me/afdplatformuz" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="32" viewBox="0 0 32 32" width="32">
            <path d="m0 16c0 8.8366 7.16344 16 16 16 8.8366 0 16-7.1634 16-16 0-8.83656-7.1634-16-16-16-8.83656 0-16 7.16344-16 16z" fill="#08c" />
            <path d="m8.09992 15.7083c4.29498-1.8712 7.15898-3.1049 8.59198-3.7009 4.0915-1.7018 4.9416-1.9974 5.4958-2.0073.1218-.00205.3943.0282.5709.1714.149.1209.19.2843.2097.399.0196.1146.044.3759.0246.58-.2217 2.3296-1.1811 7.983-1.6692 10.5922-.2065 1.1041-.6132 1.4743-1.0069 1.5105-.8555.0787-1.5052-.5654-2.3339-1.1086-1.2967-.85-2.0292-1.3792-3.2879-2.2086-1.4546-.9586-.5116-1.4854.3174-2.3464.2169-.2253 3.9866-3.6541 4.0595-3.9652.0092-.0389.0176-.1839-.0685-.2605-.0862-.0765-.2133-.0503-.3051-.0295-.13.0295-2.2015 1.3987-6.2144 4.1075-.588.4038-1.1206.6005-1.5977.5902-.5261-.0114-1.53798-.2975-2.29022-.542-.92265-.2999-1.65596-.4585-1.5921-.9678.03326-.2653.3986-.5367 1.09604-.814z" fill="#fff" />
          </svg>
          Animeni telegram orqali tomosha qiling
        </Link>
      </div>

      {/* Seriyalar */}
      <h3>Qismlar</h3>
      <div className="series">
        {filmData.series && filmData.series.length > 0 ? (
          filmData.series.map((seriesItem) => (
            <Link
              key={seriesItem.id}
              href={`/${params?.department_id}/${params?.department_name}/${params?.film_id}/${params?.film_name}/${formatEpisodeTitle(seriesItem.title)}`}
              className={
                selectedSeries?.id === seriesItem.id
                  ? "series-item selected"
                  : "series-item"
              }
            >
              {seriesItem.title}
            </Link>
          ))
        ) : (
          <Link
            href={`#`}
            onClick={() => {
              setSelectedSeries(null);
              window.scrollTo(0, 0);
            }}
            className="series-item selected single"
          >
            Film
          </Link>
        )}
      </div>

      <h3>Haqida</h3>
      <p id="country">
        Davlati: <Link href="/filter">{filmData.country}</Link>
      </p>
      <p id="year">
        Yili: {filmData.year ? (
          filmData.year
            .split(",")
            .map((year, index) => (
              <Link
                key={index}
                href={`/filter`}
                className="year-link"
              >
                {year.trim()}
              </Link>
            ))
        ) : (
          "Mavjud emas"
        )}
      </p>
      <p id="genres">
        Janri: {filmData.genre ? (
          filmData.genre
            .split(" ")
            .map((genre, index) => (
              <Link
                key={index}
                href={`/filter`}
                className="genre-link"
              >
                {genre.trim()}
              </Link>
            ))
        ) : (
          "Janrlar mavjud emas"
        )}
      </p>
      <p id="des">Qisqacha: <span>{filmData.movies_description}</span></p>
      <p id="oth">
        Boshqalar:
        <Link href="#">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IArs4c6QAAAWBJREFUSEu91L9Lw0AUB/Dvq22ki4OTIDoJzi6ddBL88R846aKDQ4dCHXKB9jVtr6DoIP0L7CS4OwjudnZyFMHFgosoUvIkQqP9EeOlxtuSu/e57x3JIyQ4KEEbobjDtZxI6gaEK81qbTCEzbpIgiMIlbRrV0eF/D9ccWMXIiUAczGu6wWQlq44+73aIHmhcJLNTr09A7BiwEFJimi1xva1/yLAD8qHMxl0H8eBP2tJdjQ7Z2H4K4C28SaEBQhmRbDdcFUrDL/TFbVoiivWpxDko5Inj/vfuYfU/G9O0GB1YZQ8+ImidJGSdp1qDHxiL8qGePfGeCQ6sMA8uUcrYZto1zn+PmeO+41rxCCgWa+o/Hi4R+s/JO/rhEbJE73zP8WZefpdrA6ADkiapjiENgHkSGir7trnfb3Ff3DK+lKADWP4q+DBImuJufg0hDNzuovJ5bh4GpnbHjyEx0XD6j4ArW8PJ+hpmPYAAAAASUVORK5CYII=" alt="" />
          {formatDate(filmData.created_at)}
        </Link>
        <Link href="#">
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
          {filmData.count}
        </Link>
      </p>
    </div>
  );
};

export default FilmInner;