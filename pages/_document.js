// pages/_domcument.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ✅ ضبط إعدادات الموقع الأساسية */}
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <title>Egec Information System - نظام المعلومات</title>
        <meta
          name="description"
          content="نظام معلومات شامل للجامعات والتخصصات"
        />
        <meta
          name="keywords"
          content="الجامعات, التخصصات, الدراسة, المعلومات الأكاديمية"
        />
        <meta name="author" content="Egec Team" />

        <meta property="og:title" content="Egec Information System" />
        <meta
          property="og:description"
          content="نظام معلومات شامل للجامعات والتخصصات"
        />
        <meta property="og:image" content="/img/egec.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://egec-db.vercel.app/" />

        <link rel="icon" type="image/png" href="/img/egec.png" />
        <link rel="apple-touch-icon" href="/img/egec.png" />
        <meta name="msapplication-TileImage" content="/img/egec.png" />

        {/* Fonts are loaded via next/font in _app.js for better performance */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
