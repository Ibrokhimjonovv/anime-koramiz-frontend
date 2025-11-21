"use client"
import React, { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Style
import "../../../styles/login.scss";
// Global Api
import { global_api } from "../_app";
const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};
    if (!formData.username)
      validationErrors.username = "Foydalanuvchi nomi kiritilishi kerak";
    if (!formData.password)
      validationErrors.password = "Parol kiritilishi kerak";
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${global_api}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        window.location.href = "/";
      } else {
        setErrors({
          server:
            data.message ||
            "Kirishda xatolik yuz berdi || Login yoki parol xato",
        });
      }
    } catch (error) {
      setErrors({ server: "Server bilan ulanishda xatolik yuz berdi." });
    }
    setLoading(false);
  };

  return (
    <section id="login-section">
      <div className="login-container">
        <h1>Bu funksiya xali mavjud emas!</h1>
        {/* <h1>Kirish</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Foydalanuvchi nomi"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="error">{errors.username}</p>}
          <div id="pss">
            <input
              type={`${showPass ? "text" : "password"}`}
              name="password"
              placeholder="Parol"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              id="eye"
              type="button"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ionicon"
                    viewBox="0 0 512 512"
                  >
                    <path d="M432 448a15.92 15.92 0 01-11.31-4.69l-352-352a16 16 0 0122.62-22.62l352 352A16 16 0 01432 448zM255.66 384c-41.49 0-81.5-12.28-118.92-36.5-34.07-22-64.74-53.51-88.7-91v-.08c19.94-28.57 41.78-52.73 65.24-72.21a2 2 0 00.14-2.94L93.5 161.38a2 2 0 00-2.71-.12c-24.92 21-48.05 46.76-69.08 76.92a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416a239.13 239.13 0 0075.8-12.58 2 2 0 00.77-3.31l-21.58-21.58a4 4 0 00-3.83-1 204.8 204.8 0 01-51.16 6.47zM490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96a227.34 227.34 0 00-74.89 12.83 2 2 0 00-.75 3.31l21.55 21.55a4 4 0 003.88 1 192.82 192.82 0 0150.21-6.69c40.69 0 80.58 12.43 118.55 37 34.71 22.4 65.74 53.88 89.76 91a.13.13 0 010 .16 310.72 310.72 0 01-64.12 72.73 2 2 0 00-.15 2.95l19.9 19.89a2 2 0 002.7.13 343.49 343.49 0 0068.64-78.48 32.2 32.2 0 00-.1-34.78z" />
                    <path d="M256 160a95.88 95.88 0 00-21.37 2.4 2 2 0 00-1 3.38l112.59 112.56a2 2 0 003.38-1A96 96 0 00256 160zM165.78 233.66a2 2 0 00-3.38 1 96 96 0 00115 115 2 2 0 001-3.38z" />
                  </svg>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ionicon"
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeinejoin="round"
                      strokeWidth="32"
                    />
                    <circle
                      cx="256"
                      cy="256"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      strokeMiterlimit="10"
                      strokeWidth="32"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}
          {errors.server && <p className="error">{errors.server}</p>}
          <p>
            Ro’yxatdan o’tmagan bo’lsangiz{" "}
            <Link href="/signup">Ro’yxatdan o’tish</Link>
          </p>
          <p>
            Parolni unutgan bo’lsangiz{" "}
            <Link href="/pass-recovery">Parolni tiklash</Link>
          </p>

          <button type="submit" disabled={loading}>
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form> */}
      </div>
    </section>
  );
};

export default Login;
