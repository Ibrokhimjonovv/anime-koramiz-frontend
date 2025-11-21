"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";

// Style
import "./header.scss";
import { global_domen } from "../../app/_app";
import { AccessContext } from "@/context/context";

const Header = () => {
  const { showNotification, userData, userLoading } =
    useContext(AccessContext);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [canvas, setCanvas] = useState(false);
  const [accessT, setAccessT] = useState(null);

  useEffect(() => {
    setIsDarkMode(true);
    document.body.className = "dark-mode";
    localStorage.setItem("theme", "dark");
  }, []);

  useEffect(() => {
    const accessT = localStorage.getItem("accessToken");
    if (accessT) {
      setAccessT(accessT)
    }
  }, []);

  const handleClickCanvas = (e) => {
    e.stopPropagation();
    setCanvas(!canvas);
  };

  const handleCanvasClick = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleBodyClick = () => {
      setCanvas(false);
    };

    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  useEffect(() => {
    if (canvas) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [canvas]);

  const handleClick = (e) => {
    e.preventDefault()
    showNotification("Bu funksiya vaqtinchalik ishlamaydi!");
    console.log('Bu funksiya vaqtinchalik ishlamaydi!');
    
  };
  

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <Link href="/">
            <img className="logo-dark" src="/assets/logo-dark.png" alt="" />
          </Link>
        </div>
        <div className="right-line">
          <div className="search-btns search-btns-desk">
            <Link href="/search">
              Anime qidirish
              <img className="logo-dark" src="/assets/search-dark.png" alt="" />
            </Link>
          </div>
          <div className="mid-line"></div>
          <div className="profile">
            {accessT ? (
              <>
                <Link href="/profile">
                  <span>{userLoading ? "Yuklanmoqda..." : userData?.username}</span>
                  <img
                    src={
                      userData?.profile_image
                        ? `${global_domen}${userData.profile_image}`
                        : userData?.profileImageUrl || "/assets/pf-logo.png"
                    }
                    alt="Profile"
                  />
                </Link>
              </>
            ) : (
              <Link href="/login" onClick={handleClick}>
                <span>Kirish</span>
                <img src="/assets/pf-logo.png" alt="" />
              </Link>
            )}
          </div>

          <div className="qr">
            <div className="menu-icon" onClick={handleClickCanvas}>
              <img className="logo-dark" src='/assets/hamburger.png' alt="Menu Icon" />
            </div>
          </div>
        </div>
        <div
          className={
            canvas
              ? "active-canvas menu-offcanvas-container"
              : "menu-offcanvas-container"
          }
          onClick={handleCanvasClick}
        >
          <div className="profile">
            {accessT ? (
              <Link href="/profile" onClick={() => setCanvas(false)}>
                <span>{userData?.name || userData?.username}</span>
                <img
                  src={
                    userData?.profile_image
                      ? `${global_domen}${userData.profile_image}`
                      : userData?.profileImageUrl || "/assets/pf-logo.png"
                  }
                  alt="Profile"
                />
              </Link>
            ) : (
              <Link href="/login" onClick={() => setCanvas(!canvas)}>
                <span>Kirish</span>
                <img src="/assets/pf-logo.png" alt="" />
              </Link>
            )}
          </div>
          <div className="search-btns search-btns-mob">
            <Link href="/search">
              Film qidirish
              <img className="logo-dark" src="/assets/search-dark.png" alt="" />
            </Link>
          </div>
          <div className="social">
            <Link href="https://t.me/afdplatformuz" target="_blank">
              <i className="bx bxl-telegram" style={{ color: "#777e90" }}></i>
              Telegram
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
