// // pages/auth/signin.js
// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { signIn, useSession } from "next-auth/react";
// import Spinner from "@/components/Spinner";
// import { FiLogIn } from "react-icons/fi";

// export default function SignIn() {
//   const { data: session, status } = useSession();
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "authenticated") {
//       router.push("/");
//     }
//   }, [status, router]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const result = await signIn("credentials", {
//         redirect: false,
//         email: form.email,
//         password: form.password,
//       });

//       if (!result.error) {
//         router.push("/");
//       } else {
//         setError("Email or password is incorrect, or session expired.");
//         setTimeout(() => setError(""), 4000);
//       }
//     } catch (error) {
//       setError("An unexpected error occurred. Please try again.");
//       setTimeout(() => setError(""), 4000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (status === "loading") {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Spinner />
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-center min-h-full items-center py-10 px-4 bg-gray-50">
//       <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100 h-fit">
//         {/* ✅ ثابت دائمًا لتحسين LCP */}
//         <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
//           Admin Panel Login
//         </h2>

//         {/* ✅ نترك العنوان موجود دائمًا، والباقي ديناميكي */}
//         {loading && (
//           <div className="flex justify-center">
//             <Spinner />
//           </div>
//         )}

//         {!loading && (
//           <>
//             {error && (
//               <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg shadow-sm">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <input
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="Email address"
//                 className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//               <input
//                 type="password"
//                 name="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 placeholder="Password"
//                 className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//               <button
//                 type="submit"
//                 className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition duration-200"
//               >
//                 <FiLogIn className="text-lg" />
//                 Sign In
//               </button>
//             </form>

//             <p className="mt-6 text-center text-sm text-gray-500">
//               <a href="#" className="hover:text-indigo-600 transition">
//                 View Admin License Agreement
//               </a>
//             </p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// pages/auth/signin.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Spinner from "@/components/Spinner";
import { FiLogIn } from "react-icons/fi";

export default function SignIn() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const redirectUrl = router.query.redirect || "/";
      router.push(redirectUrl);
    }
  }, [status, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-full items-center py-10 px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100 h-fit">
        <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
          Admin Panel Login
        </h2>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-70"
          >
            {loading ? (
              <Spinner size="small" />
            ) : (
              <>
                <FiLogIn className="text-lg" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <a href="#" className="hover:text-indigo-600 transition">
            View Admin License Agreement
          </a>
        </p>
      </div>
    </div>
  );
}
