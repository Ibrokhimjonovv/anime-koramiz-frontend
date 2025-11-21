"use client";

import React, { useState, useEffect } from 'react';
// import { Link } from "react-router-dom";
import Link from 'next/link';

// Style
import "./films-container.scss";

// Images
import FilmsCarousel from '../fim-carousel/filmCarousel';

const FilmsContainer = () => {
  const [accessT, setAccessT] = useState(null);
  useEffect(() => {
    const accessT = localStorage.getItem("accessToken");
    if (accessT) {
      setAccessT(accessT)
    }
  }, []);

  return (
    <section id='films-container'>
      <div id="q">
        <div className="top-inner">
          <div className="top-inner-left">
            <h1>ENG SARA VA QIZIQARLI <span>ANIMELAR</span></h1>
            <p>Yangi va qiziqarli animelarni bizning saytdan topishingiz mumkin. Eng so‘nggi anime seriyalari, anime filmlari, Ongoing epizodlar, OVA va ONA loyihalar — barchasi bizda!</p>
            {
              accessT ? (
                <Link href="/profile"><img src="/assets/user.png" alt="" />Shaxsiy kabinet</Link>
              ) : (
                <Link href="/signup"><img src="/assets/user.png" alt="" /> Ro’yxatdan o’tish</Link>
              )
            }
          </div>
          <div className="top-inner-right"></div>
        </div>
        <div className="bottom-inner">
          <FilmsCarousel />
        </div>
      </div>
    </section>
  )
}

export default FilmsContainer