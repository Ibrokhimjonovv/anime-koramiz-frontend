"use client";
import { usePathname, useRouter } from 'next/navigation';
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import "../../styles/global.scss"
import { useEffect, useState } from 'react';
import { global_api } from './_app';
import Loading from '@/components/loading/loading';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
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

  const isAdminRoute = pathname?.startsWith('/site/__site_admin_');

  useEffect(() => {
    if (!userLoading && isAdminRoute && !userData?.is_superuser) {
      router.replace("/404");
    }
  }, [userLoading, isAdminRoute, userData, router]);

  if (userLoading && isAdminRoute) {
    return <Loading />;
  }

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
}