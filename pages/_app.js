// pages/_app.js
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { SessionProvider } from "next-auth/react";
import { Nunito, Outfit } from "next/font/google";
import Loading from "@/components/Loading";
import "@/styles/globals.css";

// Optimize font loading with next/font
// Note: Nunito doesn't support Arabic subset, using latin-ext for better coverage
const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  display: "swap",
  variable: "--font-nunito",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "900"],
  display: "swap",
  variable: "--font-outfit",
});

// Dynamically import ParentComponent with loading fallback
const ParentComponent = dynamic(() => import("@/components/ParentComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <Loading />
      <h1 className="mt-1">Loading...</h1>
    </div>
  ),
});

// Custom hook to handle route change loading state
function useRouteChangeLoading() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => setLoading(true);
    const handleRouteChangeComplete = () => setLoading(false);
    const handleRouteChangeError = () => setLoading(false);

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router.events]);

  return loading;
}

export default function App({ Component, pageProps }) {
  const [asideOpen, setAsideOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const loading = useRouteChangeLoading();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      setShowLoading(true);
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, 3500);

      return () => clearTimeout(timeout);
    } else {
      setShowLoading(false);
    }
  }, [loading]);

  const toggleAside = useCallback(() => {
    setAsideOpen((prev) => !prev);
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <div className={`${nunito.variable} ${outfit.variable}`}>
        {showLoading ? (
          <div
            className="flex flex-col items-center justify-center min-h-screen w-full"
            aria-live="polite"
            aria-busy={loading}
          >
            <Loading />
            <h1 className="mt-1">Loading...</h1>
          </div>
        ) : (
          <>
            <ParentComponent appOpen={asideOpen} appAsideOpen={toggleAside} />
            <main className="flex min-h-screen">
              <div className={asideOpen ? "mycontainer active" : "mycontainer"}>
                <Component {...pageProps} />
              </div>
            </main>
          </>
        )}
      </div>
    </SessionProvider>
  );
}
