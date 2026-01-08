// pages/_app.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import Loading from "@/components/Loading";
import ErrorBoundary from "@/components/ErrorBoundary";
import Script from "next/script";
import { Nunito, Outfit } from "next/font/google";
import { validateEnvWithWarnings } from "@/lib/validateEnv";
import "@/styles/globals.css";

// Validate environment variables on app startup (only in production)
if (typeof window === "undefined") {
  // Server-side only
  try {
    validateEnvWithWarnings();
  } catch (error) {
    console.error("Environment validation failed:", error.message);
    // Don't throw in development to allow easier setup
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
  
  // Initialize Redis cache on server startup
  import("@/lib/cache").then((cacheModule) => {
    cacheModule.initCache().then(() => {
      console.log("🚀 Cache initialization complete");
    }).catch((err) => {
      console.error("Cache initialization error:", err.message);
    });
  });
}

// Optimize font loading with next/font
const nunito = Nunito({
  weight: ["200", "300", "400", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const outfit = Outfit({
  weight: ["300", "900"],
  subsets: ["latin"],
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

function App({ Component, pageProps }) {
  const [asideOpen, setAsideOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const loading = useRouteChangeLoading();
  const router = useRouter();

  // Optimize loading timeout - reduce from 3500ms to 2000ms for better UX
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, 2000); // Reduced from 3500ms

      return () => clearTimeout(timeout);
    } else {
      setShowLoading(false);
    }
  }, [loading]);

  const toggleAside = useCallback(() => {
    setAsideOpen((prev) => !prev);
  }, []);

  // Memoize container class to avoid recalculation
  const containerClass = useMemo(
    () => (asideOpen ? "mycontainer active" : "mycontainer"),
    [asideOpen]
  );

  return (
    <div className={`${nunito.variable} ${outfit.variable}`}>
      <ErrorBoundary>
        <SessionProvider session={pageProps.session}>
        {/* Load fonts asynchronously */}
        <Script id="font-loader" strategy="afterInteractive">
          {`
            // Load fonts asynchronously to prevent render blocking
            const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"][media="print"]');
            fontLinks.forEach(link => {
              link.media = 'all';
            });
          `}
        </Script>
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
              <div className={containerClass}>
                <Component {...pageProps} />
              </div>
            </main>
          </>
        )}
      </SessionProvider>
    </ErrorBoundary>
    </div>
  );
}

export default App;
