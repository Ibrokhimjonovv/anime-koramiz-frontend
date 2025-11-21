"use client";

import { global_api } from "@/app/_app";
import { createContext, useState, useEffect } from "react";

// For Provider
const AccessContext = createContext();

const AccessProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedFilms, setSavedFilms] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [alertNotification, setAlertNotification] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUserData(null);
        setUserLoading(false);
        return;
      }

      setUserLoading(true);
      try {
        const response = await fetch(`${global_api}/get_profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUserData(null);
          window.location.reload()
        }
      } catch (error) {
        console.error("Xatolik:", error);
        setUserData(null);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [global_api]);

   // notificationni vaqtinchalik ko'rsatish
  const showNotification = (message, duration = 3000) => {
    setAlertNotification(message);
    setTimeout(() => setAlertNotification(null), duration);
  };

  return (
    <AccessContext.Provider
      value={{
        savedFilms,
        setSavedFilms,
        isPlaying,
        setIsPlaying,
        userData,
        userLoading,
        alertNotification,
        setAlertNotification,
        showNotification
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};

export { AccessContext, AccessProvider };
