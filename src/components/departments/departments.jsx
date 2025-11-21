"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import "./departments.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import Loading from "../loading/loading";
import { global_api } from "../../app/_app"; // ✅ Global API import

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  // ✅ Departments API dan ma'lumot olish
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${global_api}/departments/`); // ✅ API endpoint

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setDepartments(data.data); // ✅ data ichida yoki to'g'ridan-to'g'ri
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const formatFilmNameForURL = (name) => {
    return name
      ?.toLowerCase()
      ?.replace(/'/g, "")
      ?.replace(/[^a-z0-9]+/g, "-")
      ?.replace(/^-+|-+$/g, "");
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Bo'limlarni yuklashda xatolik</h3>
      </div>
    );
  }

  return (
    <div id="departments-container">
      <div className="btns">
        <h1>Bo'limlar</h1>
        <div className="btns-inner">
          <div className="prev-btn" ref={prevBtnRef}>
            <img src="/assets/prev-btn.png" alt="Previous" />
          </div>
          <div className="next-btn" ref={nextBtnRef}>
            <img src="/assets/prev-btn.png" alt="Next" />
          </div>
          <Link href="/barcha-animelar" className="all-btn">
            <img src="/assets/grid.png" alt="" />
            Barchasi
          </Link>
          <Link href="/filter" className="all-btn">
            <img src="/assets/filter.png" alt="" />
            Filterlash
          </Link>
        </div>
      </div>
      <Swiper
        spaceBetween={30}
        slidesPerView={3}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        navigation={{
          prevEl: prevBtnRef.current,
          nextEl: nextBtnRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevBtnRef.current;
          swiper.params.navigation.nextEl = nextBtnRef.current;
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          863: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          }
        }}
        loop={true}
        modules={[Navigation, Autoplay]}
        className="mySwiper mySwiper_2"
      >
        {loading ? (
          <SwiperSlide>
            <div className="loading-container">
              <Loading />
            </div>
          </SwiperSlide>
        ) : departments.length ? (
          departments
            .filter(item => item.department_name !== "Treylerlar (Tez kunda)") // ✅ Array ustida filter
            .map((item) => (
              <SwiperSlide key={item.department_id}>
                <Link href={`/${item.department_id}/${formatFilmNameForURL(item.department_name)}/`}>
                  <img src={item.image} alt={item.department_name} />
                  <div className="texts">
                    <h1>{item.department_name}</h1>
                    <p className="de">{item.description}</p>
                    <p>
                      <span>Barchasi</span>
                      <span>
                        <span className="color">{item.movies}</span> ta
                      </span>
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))
        ) : (
          <SwiperSlide>
            <div className="alerts">
              <h3>Hech qanday bo'lim topilmadi</h3>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};

export default Departments;