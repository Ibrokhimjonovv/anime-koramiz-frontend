"use client";

import React, { useRef, useEffect, useContext, useState } from 'react';
import Link from 'next/link';
import emailjs from '@emailjs/browser';
import { AccessContext } from '@/context/context';
// Boxicons icons
import 'boxicons/css/boxicons.min.css';

// Styles
import "./footer.scss";
import { global_api } from '@/app/_app';

const Footer = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null)
  const { userData, } = useContext(AccessContext);
  const [accessT, setAccessT] = useState(null);
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    const accessT = localStorage.getItem("accessToken");
    if (accessT) {
      setAccessT(accessT);
    }
  }, []);


  useEffect(() => {
    const getDepartments = async () => {
      try {
        const fetchFilms = await fetch(`${global_api}/departments/`);
        if (!fetchFilms.ok) {
          throw new Error("Tarmoq xatosi (Bo'limlar olishda xatolik)");
        }
        const data = await fetchFilms.json();
        setDepartments(data.data);
      } catch (error) {
        console.log(error.message);
      }
    };

    getDepartments();
  }, [global_api]);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .sendForm('service_w4uolpe', 'template_4gnygdy', form.current, {
        publicKey: 'RfZSmz37rPGgTvK98',
      })
      .then(
        () => {
          setSuccess("Xabar yuborildi!");
          setLoading(false);
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        },
        (error) => {
          setLoading(false)
        },
      );
  };

  const formatFilmNameForURL = (name) => {
    return name
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-item">
          <div className="logo">
            <Link href="/">
              <img className="logo-dark" src='/assets/logo-dark.png' alt="" />
            </Link>
          </div>
          <p>
            Ushbu sayt dublaj studiosi uchun emas balki boshqa studialarni animelarini joylab boradi. Albatta film olingan manba ham ko'rsatib o'tiladi!
          </p>
        </div>
        <div className="footer-item">
          <ul>
            <li>
              <h3>Bo'limlar</h3>
            </li>
            {
              departments
                .filter((item) => item.department_name.toLowerCase() !== "treylerlar (tez kunda)")
                .map((item, index) => (
                  <li key={index}>
                    <Link href={`/${item.department_id}/${formatFilmNameForURL(item.department_name)}/`}>{item.department_name}</Link>
                  </li>
                ))
            }
          </ul>
        </div>
        <div className="footer-item">
          <ul>
            <li>
              <h3>Internet tarmoqlarimiz</h3>
            </li>
            <div className="links">
            <Link href="https://t.me/afdplatformuz" target='_blank'>
              <i className="bx bxl-telegram" style={{ color: '#777e90' }}></i>
            </Link>
            <script id="_waug62">var _wau = _wau || []; _wau.push(["small", "2wo2ao08dg", "g62"]);</script><script async src="//waust.at/s.js"></script>
          </div>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer