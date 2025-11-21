// pages/_app.js
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import "../../styles/global.scss";

export const global_api = "https://bk.tarjima-animelar.uz/watch-anime/api";
export const global_proxy = "https://proxy.afd-platform.uz/proxy?url=";
export const global_domen = "http://192.168.1.15:8000";
export const global_api_ssr = 'https://bk.tarjima-animelar.uz/watch-anime/api'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
