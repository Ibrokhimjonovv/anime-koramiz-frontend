"use client";
import React, { useState, useEffect } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

// Style
import "./filmCarousel.scss";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

// Global API
import Loading from "../loading/loading";
import { global_api } from "@/app/_app";

const FilmsCarousel = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSwiperMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${global_api}/sprmvs/`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        setFilms(data.data);
      } catch (err) {
        console.error('Error fetching swiper movies:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSwiperMovies();
  }, []);

  const formatFilmNameForURL = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // ✅ Error holati
  if (error) {
    return (
      <div className="error-container">
        <h3>Xatolik yuz berdi</h3>
      </div>
    );
  }

  return (
    <Swiper
      slidesPerView={6}
      spaceBetween={20}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      loop={films.length > 1}
      modules={[Autoplay, Pagination]}
      className="mySwiper mySwiper_1"
      breakpoints={{
        320: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        840: {
          slidesPerView: 4,
          spaceBetween: 0,
        },
        1024: {
          slidesPerView: 5,
          spaceBetween: 30,
        },
        1200: {
          slidesPerView: 6,
          spaceBetween: 30,
        },
        1400: {
          slidesPerView: 6,
          spaceBetween: 30,
        },
      }}
    >
      {loading ? (
        <SwiperSlide>
          <div className="loading-container">
            <Loading />
          </div>
        </SwiperSlide>
      ) : films.length > 0 ? (
        films.map((item) => (
          <SwiperSlide key={item.dcrntindx}>
            <Link
              href={`/${item.dindx}/${formatFilmNameForURL(item.dnme)}/${item.mcrntindx}/${formatFilmNameForURL(item.mnme)}`}
              className="carousel-link"
            >
              <div>
                <Image
                  src={item.image}
                  alt={item.mnme}
                  layout="fill"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/assets/fnotfound.png";
                    e.target.style.objectFit = "cover";
                  }}
                />
              </div>
            </Link>
          </SwiperSlide>
        ))
      ) : (
        <SwiperSlide>
          <div className="alerts none">
            <h3>Hech qanday film topilmadi</h3>
            <p>Keyinroq qayta urinib ko'ring</p>
          </div>
        </SwiperSlide>
      )}
    </Swiper>
  );
};

export default FilmsCarousel;