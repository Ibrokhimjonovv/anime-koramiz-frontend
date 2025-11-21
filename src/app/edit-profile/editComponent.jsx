
"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { global_api, global_domen } from "../_app";
// Style
import "../../../styles/edit_profile.scss";
import Loading from "../../components/loading/loading";
import NotFound from "../not-found";
import Head from "next/head";
const EditProfile = () => {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_image: null,
  });
  const [userDataIMG, setUserDataIMG] = useState();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const router = useRouter();
  const [accessT, setAccessT] = useState(null);
  useEffect(() => {
    const accessT = localStorage.getItem("accessToken");
    if (accessT) {
      setAccessT(accessT);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      try {
        const response = await fetch(`${global_api}/get_profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Tarmoq xatosi");
        }

        const data = await response.json();
        setUserData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          profile_image: data.profile_imageUrl,
        });
        setUserDataIMG(data.profile_image);
        setIsLoading(false); // Set loading to false once the data is fetched
      } catch (error) {
        setError(error);
        setIsLoading(false); // Set loading to false if there is an error
      }
    };

    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    if (type === "file") {
      setUserData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Set loading to true when form is submitted
    setPasswordError(""); // Xatolikni tozalash

    // ✅ Parol uzunligini tekshirish
    if (newPassword && newPassword.length < 6) {
      setNewPasswordError(
        "Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak!"
      );
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("accessToken");

    const formData = new FormData();
    formData.append("first_name", userData.first_name);
    formData.append("last_name", userData.last_name);
    formData.append("email", userData.email);
    if (userData.profile_image) {
      formData.append("profile_image", userData.profile_image);
    }

    // ✅ To'g'ri ishlashi uchun oldPassword va newPassword'ni tekshiramiz
    if (oldPassword && newPassword) {
      formData.append("old_password", oldPassword);
      formData.append("new_password", newPassword);
    }

    try {
      const response = await fetch(`${global_api}/edit_profile/`, {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.old_password) {
          setPasswordError(data.old_password); // Backenddan kelgan xatolikni chiqarish
          setNewPasswordError("")
        } else {
          throw new Error("Tahrirlashda xatolik yuz berdi.");
        }
        return;
      }

      window.location.href = "/profile";
      // window.location.reload();
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false); // Set loading to false after the request is completed
    }
  };

  return (
    <div>
      <Head>
        <title>AFD Platform - Profilni taxrirlash</title>
      </Head>
      {accessT ? (
        <div className="edit-container">
          <h1>Profilni tahrirlash</h1>
          {/* <h1>Edit profile</h1> */}
          {isLoading ? (
            <div>
              <Loading />
            </div> // Display loading indicator while fetching or submitting
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="first_name"
                value={userData.first_name}
                maxLength={15}
                placeholder="Ism kiriting"
                onChange={handleChange}
              />
              <input
                type="text"
                name="last_name"
                value={userData.last_name}
                maxLength={15}
                placeholder="Familiya kiriting"
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                value={userData.email}
                placeholder="Email manzilini kiriting"
                onChange={handleChange}
              />
              <input
                type="password"
                placeholder="Eski parol"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              {passwordError && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {passwordError}
                </p>
              )}
              <input
                type="password"
                placeholder="Yangi parol"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPasswordError && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {newPasswordError}
                </p>
              )}
              <label htmlFor="file-inp">
                Iltimos rasm tanlang
                {/* Please select image */}
                <input
                  id="file-inp"
                  type="file"
                  name="profile_image"
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3 style={{ color: "#fff" }}>Hozirgi rasm:</h3>
                {/* <h3 style={{ color: "#fff" }}>Current image:</h3> */}
                {/* <img
                  style={{ width: "100px", height: "100px", margin: "0 auto", objectFit: "cover" }}
                  src={`${global_domen}${userDataIMG}`}
                  alt="Profile"
                /> */}
                <img
                  style={{
                    width: "100px",
                    height: "100px",
                    margin: "0 auto",
                    objectFit: "cover",
                  }}
                  src={`${global_domen}${userDataIMG}`}
                  alt="User"
                  onError={(e) => {
                    e.target.onerror = null; // Infinit loopni oldini olish uchun
                    e.target.src = "/assets/pf-logo.png"; // Default rasmga o'zgartirish
                  }}
                />
              </div>
              {userData.profile_image && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h3 style={{ color: "#fff" }}>Yangi rasm:</h3>
                  {/* <h3 style={{ color: "#fff" }}>New image:</h3> */}
                  <img
                    id="prev"
                    src={URL.createObjectURL(userData.profile_image)}
                    alt="Profile preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <button type="submit">Saqlash</button>
              {/* <button type="submit">Save</button> */}
            </form>
          )}
        </div>
      ) : (
        <NotFound />
      )}
    </div>
  );
};

export default EditProfile;
