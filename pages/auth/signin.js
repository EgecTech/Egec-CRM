// pages/auth/signin.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Spinner from "@/components/Spinner";
import { FiLogIn, FiArrowLeft, FiLock, FiMail } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";

export default function SignIn() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const { success } = router.query;

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
            <FiArrowLeft className="text-lg" />
          </div>
          <span>Back to home</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-center border-b border-slate-700/50">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-emerald-500/30 rounded-full blur-md"></div>
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-amber-500/50 shadow-lg">
                  <Image
                    src="/img/edugate_now_1-compressed.jpg"
                    alt="EduGate Now Logo"
                    width={64}
                    height={64}
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center ring-2 ring-slate-800">
                  <MdVerified className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-400 mt-1">Sign in to EduGate Now</p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 bg-white">
            {success && (
              <div className="mb-4 px-4 py-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-200">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 px-4 py-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 bg-white text-amber-500 focus:ring-amber-500/50"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-600"
                  >
                    Remember me
                  </label>
                </div>

                {/* <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div> */}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 py-3.5 rounded-xl font-bold transition-all duration-200 disabled:opacity-70 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
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
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} EduGate Now. All rights reserved.
        </p>
      </div>
    </div>
  );
}
