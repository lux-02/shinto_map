import "../styles/globals.css";
import Script from "next/script";
import { LanguageProvider } from "../contexts/LanguageContext";

function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly&language=ja&region=JP`}
        strategy="beforeInteractive"
        onReady={() => {
          console.log("Google Maps script is ready");
        }}
      />
      <Component {...pageProps} />
    </LanguageProvider>
  );
}

export default MyApp;
