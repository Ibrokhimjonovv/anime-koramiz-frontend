"use client"
import { useContext, useEffect, useState } from "react";
import "../../../../styles/admin-panel.scss";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading/loading";
import { AccessContext } from "@/context/context";
import { global_api } from "@/app/_app";

export default function AdminLayout({ children }) {
  const [userLoading, setUserLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setUserLoading(false);
        return;
      }

      try {
        const response = await fetch(`${global_api}/get_profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Network error");
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userLoading && !userData?.is_superuser) {
      router.replace("/404");
    }
  }, [userLoading, userData, router]);

  if (userLoading) {
    return <Loading />;
  }

  return (
    <div className="admin-root" style={{ backgroundColor: "#10131c", minHeight: "100vh" }}>
      {children}
    </div>
  );
}