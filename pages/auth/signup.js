// pages/auth/signup.js
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { FiUserPlus, FiArrowLeft, FiUser, FiChevronDown, FiLock, FiShield, FiAlertCircle, FiPhone } from "react-icons/fi";
import { RiShieldUserLine } from "react-icons/ri";
import Link from "next/link";

export default function SignUp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "agent", // default role
    phone: "", // Add phone field
  });
  const [error, setError] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "agent", label: "Agent" },
    { value: "agency", label: "Agency" },
    { value: "egecagent", label: "Egec Agent" },
    { value: "studyagent", label: "Study Agent" },
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

    if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.phone) {
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

    // Add phone number validation
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(form.phone)) {
      setError("Please enter a valid phone number (minimum 8 digits)");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          sessionVersion: 1,
          phone: form.phone, // Add phone to request
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError("Please sign in to create new accounts.");
          return;
        }
        if (res.status === 403) {
          setError(`Access denied: ${data.error} (Your role: ${data.sessionRole})`);
          return;
        }
        throw new Error(data.error || "Registration failed");
      }

      router.push("/auth/signin?success=Registration successful");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check for unauthorized error in URL
  useEffect(() => {
    if (router.query.error === "unauthorized") {
      setError("You need administrator privileges to create new accounts.");
    }
  }, [router.query]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Spinner />
      </div>
    );
  }

  // Show protected page for non-admin users or users without session
  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
            {/* Header with animated gradient */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-center relative overflow-hidden animate-gradient">
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
              <div className="relative">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full animate-pulse">
                    <FiShield className="text-4xl text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Protected Area</h2>
                <p className="text-white/90 text-lg">
                  {status !== "authenticated" 
                    ? "Please sign in to access this page" 
                    : "This area is restricted to administrators only"}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                {/* Status Card */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FiAlertCircle className="text-2xl text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                        {status !== "authenticated" 
                          ? "Authentication Required" 
                          : "Access Restricted"}
                      </h3>
                      <p className="text-indigo-700">
                        {status !== "authenticated"
                          ? "You need to be signed in to access this page. Please sign in to continue."
                          : "This page is restricted to administrators only. This is a security measure to ensure only authorized personnel can create new user accounts."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Security Features</h3>
                    <ul className="space-y-3 text-purple-700">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Role-based access control</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Secure user management</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Protected admin features</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">Next Steps</h3>
                    <ul className="space-y-3 text-indigo-700">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>{status !== "authenticated" ? "Sign in to your account" : "Contact your administrator"}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Use existing account</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Request access if needed</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <FiArrowLeft /> Back to Home
                  </Link>
                  {status !== "authenticated" ? (
                    <Link
                      href="/auth/signin"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                    >
                      <FiUser /> Sign In
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
        >
          <FiArrowLeft className="text-lg" />
          <span>Back to home</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <RiShieldUserLine className="text-3xl text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-white/90 mt-1">Join EGEC Knowledge Base</p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex justify-between items-center px-4 py-3 rounded-lg border border-gray-300 bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  >
                    <span>
                      {roles.find((r) => r.value === form.role)?.label ||
                        "Select Role"}
                    </span>
                    <FiChevronDown
                      className={`transition-transform ${
                        showRoleDropdown ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showRoleDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 border border-gray-200">
                      {roles.map((role) => (
                        <div
                          key={role.value}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-70"
              >
                {loading ? (
                  <Spinner size="small" white />
                ) : (
                  <>
                    <FiUserPlus className="text-lg" />
                    Sign Up
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
