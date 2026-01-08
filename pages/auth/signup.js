// pages/auth/signup.js
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import Image from "next/image";
import {
  FiUserPlus,
  FiArrowLeft,
  FiUser,
  FiChevronDown,
  FiLock,
  FiShield,
  FiAlertCircle,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { RiShieldUserLine } from "react-icons/ri";
import { MdVerified } from "react-icons/md";
import Link from "next/link";
import { useCsrf } from "@/hooks/useCsrf";

export default function SignUp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getCsrfHeaders, fetchCsrfToken, csrfToken } = useCsrf();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "agent",
    phone: "",
  });
  const [error, setError] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "agent", label: "Agent" },
    { value: "agency", label: "Agency" },
    { value: "egecagent", label: "EduGate Agent" },
    { value: "studyagent", label: "Study Agent" },
    { value: "edugateagent", label: "Edugate Agent" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
    setShowRoleDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.phone
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(form.phone)) {
      setError("Please enter a valid phone number (minimum 8 digits)");
      setLoading(false);
      return;
    }

    try {
      // Ensure CSRF token is available before making request
      let csrfHeaders = getCsrfHeaders();
      if (!csrfHeaders["x-csrf-token"]) {
        // Try to fetch CSRF token if not available
        console.log("[Signup] CSRF token not found, fetching...");
        try {
          const token = await fetchCsrfToken();
          if (token) {
            csrfHeaders = getCsrfHeaders();
          }
        } catch (fetchError) {
          console.error("[Signup] Failed to fetch CSRF token:", fetchError);
          // Continue anyway - the server will handle validation
        }

        // Final check - if still no token, try one more time with a direct fetch
        if (!csrfHeaders["x-csrf-token"]) {
          try {
            const response = await fetch("/api/csrf-token", {
              method: "GET",
              credentials: "include",
            });
            if (response.ok) {
              const data = await response.json();
              if (data.token) {
                csrfHeaders = getCsrfHeaders();
              }
            }
          } catch (e) {
            console.error("[Signup] Direct CSRF token fetch failed:", e);
          }
        }

        if (!csrfHeaders["x-csrf-token"]) {
          setError(
            "Security token not available. Please refresh the page and try again."
          );
          setLoading(false);
          return;
        }
      }

      // Log in development only
      if (process.env.NODE_ENV === "development") {
        console.log("[Signup] Making request with CSRF token:", {
          hasToken: !!csrfHeaders["x-csrf-token"],
          tokenLength: csrfHeaders["x-csrf-token"]?.length,
        });
      }

      // Try alternative endpoint first, fallback to /api/signup
      const endpoint = "/api/create-user"; // Using alternative endpoint
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...csrfHeaders, // Add CSRF token
        },
        credentials: "include", // Include cookies for CSRF
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          sessionVersion: 1,
          phone: form.phone,
        }),
      });

      // Handle non-JSON responses (like 405 with no body)
      const contentType = res.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
        }
      }

      if (!res.ok) {
        // Use parsed data or create error object
        const errorData = data || {
          error: res.statusText || "Request failed",
          message: res.statusText || "Request failed",
        };

        if (res.status === 401) {
          setError(
            errorData.message || "Please sign in to create new accounts."
          );
          return;
        }
        if (res.status === 403) {
          // Handle CSRF errors specifically
          if (errorData.code === "CSRF_INVALID") {
            setError(
              "Security token expired. Please refresh the page and try again."
            );
            // Auto-refresh CSRF token
            try {
              await fetchCsrfToken();
            } catch (e) {
              console.error("Failed to refresh CSRF token:", e);
            }
          } else {
            const errorMsg =
              errorData.error || errorData.message || "Access denied";
            const roleMsg = errorData.sessionRole
              ? ` (Your role: ${errorData.sessionRole})`
              : "";
            setError(`Access denied: ${errorMsg}${roleMsg}`);
          }
          return;
        }
        if (res.status === 405) {
          const errorMsg =
            errorData.message ||
            errorData.error ||
            "Method not allowed. Please refresh the page and try again.";
          setError(errorMsg);
          return;
        }
        if (res.status === 429) {
          setError("Too many requests. Please wait a moment and try again.");
          return;
        }
        if (res.status === 400) {
          // Handle 400 errors (validation errors, user already exists, etc.)
          const errorMsg =
            errorData.message || errorData.error || "Invalid request";
          setError(errorMsg);
          return;
        }
        // For any other error, set the error message without throwing
        const errorMsg =
          errorData.message || errorData.error || "Registration failed. Please try again.";
        setError(errorMsg);
        return;
      }

      router.push("/auth/signin?success=Registration successful");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.query.error === "unauthorized") {
      setError("You need administrator privileges to create new accounts.");
    }
  }, [router.query]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Spinner />
      </div>
    );
  }

  // Show protected page for non-admin users or users without session
  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-2xl relative z-10">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-center border-b border-slate-700/50">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-rose-500/20 backdrop-blur-sm rounded-2xl border border-rose-500/30">
                  <FiShield className="text-4xl text-rose-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Protected Area
              </h2>
              <p className="text-slate-400 text-lg">
                {status !== "authenticated"
                  ? "Please sign in to access this page"
                  : "This area is restricted to administrators only"}
              </p>
            </div>

            {/* Content */}
            <div className="p-8 bg-white">
              <div className="max-w-2xl mx-auto">
                {/* Status Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <FiAlertCircle className="text-2xl text-amber-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">
                        {status !== "authenticated"
                          ? "Authentication Required"
                          : "Access Restricted"}
                      </h3>
                      <p className="text-amber-700">
                        {status !== "authenticated"
                          ? "You need to be signed in to access this page. Please sign in to continue."
                          : "This page is restricted to administrators only. This is a security measure to ensure only authorized personnel can create new user accounts."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                      Security Features
                    </h3>
                    <ul className="space-y-3 text-slate-600">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Role-based access control</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Secure user management</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Protected admin features</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                      Next Steps
                    </h3>
                    <ul className="space-y-3 text-slate-600">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>
                          {status !== "authenticated"
                            ? "Sign in to your account"
                            : "Contact your administrator"}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Use existing account</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Request access if needed</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-800 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200 border border-slate-200"
                  >
                    <FiArrowLeft /> Back to Home
                  </Link>
                  {status !== "authenticated" ? (
                    <Link
                      href="/auth/signin"
                      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl font-bold hover:from-amber-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-amber-500/25"
                    >
                      <FiUser /> Sign In
                    </Link>
                  ) : (
                    <Link
                      href="/"
                      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl font-bold hover:from-amber-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-amber-500/25"
                    >
                      <FiUser /> Go to Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show signup form for admin users
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]"></div>
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
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-full blur-md"></div>
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-500/50 shadow-lg flex items-center justify-center bg-slate-700">
                  <RiShieldUserLine className="text-3xl text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center ring-2 ring-slate-800">
                  <MdVerified className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-slate-400 mt-1">Add a new user to EduGate Now</p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 bg-white">
            {error && (
              <div className="mb-4 px-4 py-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

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
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex justify-between items-center px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  >
                    <span>
                      {roles.find((r) => r.value === form.role)?.label ||
                        "Select Role"}
                    </span>
                    <FiChevronDown
                      className={`transition-transform text-slate-400 ${
                        showRoleDropdown ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showRoleDropdown && (
                    <div className="absolute z-10 mt-2 w-full bg-white shadow-xl rounded-xl py-1 border border-slate-200 overflow-hidden">
                      {roles.map((role) => (
                        <div
                          key={role.value}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-700 hover:text-slate-900 transition-colors"
                          onClick={() => handleRoleSelect(role.value)}
                        >
                          {role.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiPhone className="text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
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
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 py-3.5 rounded-xl font-bold transition-all duration-200 disabled:opacity-70 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 mt-6"
              >
                {loading ? (
                  <Spinner size="small" />
                ) : (
                  <>
                    <FiUserPlus className="text-lg" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              <Link
                href="/auth/signin"
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
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
