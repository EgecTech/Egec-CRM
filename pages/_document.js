// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ✅ ضبط إعدادات الموقع الأساسية */}
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Note: viewport and title should be in _app.js or individual pages, not _document.js */}
        <meta
          name="description"
          content="نظام معلومات شامل للجامعات والتخصصات"
        />
        <meta
          name="keywords"
          content="الجامعات, التخصصات, الدراسة, المعلومات الأكاديمية"
        />
        <meta name="author" content="EduGate Now Team" />

        <meta property="og:title" content="EduGate Now" />
        <meta
          property="og:description"
          content="نظام معلومات شامل للجامعات والتخصصات"
        />
        {/* Logo versioning - Update this timestamp when changing logo */}
        {(() => {
          const LOGO_VERSION = process.env.NEXT_PUBLIC_LOGO_VERSION || "v2"; // Change this when updating logo
          const logoUrl = `https://edugatenow.com/img/edugate_now_1-compressed.jpg?${LOGO_VERSION}`;
          return (
            <>
              <meta property="og:image" content={logoUrl} />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:image:type" content="image/png" />
              <meta property="og:image:alt" content="EduGate Now Logo" />
              <meta property="og:type" content="website" />
              <meta property="og:url" content="https://edugatenow.com/" />
              <meta property="og:site_name" content="EduGate Now" />
              <meta property="og:locale" content="ar_AR" />
              <meta property="og:locale:alternate" content="en_US" />

              {/* Twitter Card tags for better Twitter sharing */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="EduGate Now" />
              <meta
                name="twitter:description"
                content="نظام معلومات شامل للجامعات والتخصصات"
              />
              <meta name="twitter:image" content={logoUrl} />

              <link
                rel="icon"
                type="image/png"
                href={`/img/edugate_now_1-compressed.jpg?${LOGO_VERSION}`}
              />
              <link
                rel="apple-touch-icon"
                href={`/img/edugate_now_1-compressed.jpg?${LOGO_VERSION}`}
              />
              <meta
                name="msapplication-TileImage"
                content={`/img/edugate_now_1-compressed.jpg?${LOGO_VERSION}`}
              />
            </>
          );
        })()}

        {/* Fonts are loaded via next/font/google in _app.js - no need for preload links */}
        {/* The preload links have been removed as Next.js handles font optimization automatically */}

        {/* Resource hints for faster external resource loading */}
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Prefetch API routes for faster navigation */}
        <link rel="dns-prefetch" href="/api" />

        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Preload critical logo image - without query string for Next.js Image compatibility */}
        <link
          rel="preload"
          href="/img/edugate_now_1-compressed.jpg"
          as="image"
          type="image/jpeg"
        />

        {/* Critical CSS to prevent layout shift */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Prevent layout shift for header */
            header { min-height: 64px; }
            /* Prevent layout shift for images */
            img[data-nimg] { display: block; }
            /* Reserve space for dynamic content */
            .skeleton-loader { min-height: 200px; background: #f0f0f0; }
          `,
          }}
        />

        {/* Preconnect to MongoDB Atlas (if using cloud) */}
        {process.env.NODE_ENV === "production" && (
          <>
            <link rel="preconnect" href="https://cloud.mongodb.com" />
            <link rel="dns-prefetch" href="https://cloud.mongodb.com" />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
