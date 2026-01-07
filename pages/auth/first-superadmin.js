// pages/auth/first-superadmin.js
// TEMPORARY PAGE - Create first superadmin, then delete this file
import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import Spinner from "@/components/Spinner";
import {
  FiUserPlus,
  FiUser,
  FiLock,
  FiShield,
  FiMail,
  FiPhone,
} from "react-icons/fi";

export default function FirstSuperAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/setup/first-superadmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Failed to create superadmin");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin?success=Superadmin created successfully");
      }, 2000);
    } catch (err) {
      console.error("Error creating superadmin:", err);
      setError("Failed to create superadmin. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-emerald-200">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Success!</h2>
          <p className="text-slate-600 mb-4">
            Super Admin account created successfully.
          </p>
          <p className="text-sm text-amber-600 font-semibold mb-4">
            ⚠️ IMPORTANT: Delete the file `pages/auth/first-superadmin.js` now!
          </p>
          <p className="text-sm text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create First Super Admin - EduGate CRM</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-rose-900 p-8 text-center">
              <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Create First Super Admin
              </h2>
              <p className="text-rose-300 mt-2">
                One-time setup for CRM system
              </p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border-b border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 mt-0.5">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    Security Notice
                  </p>
                  <p className="text-xs text-amber-700">
                    This page allows creating a superadmin WITHOUT
                    authentication.
                    <br />
                    <strong>
                      DELETE this file immediately after creating your first
                      superadmin!
                    </strong>
                    <br />
                    File:{" "}
                    <code className="bg-amber-100 px-1 rounded">
                      pages/auth/first-superadmin.js
                    </code>
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiPhone className="text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      placeholder="+966501234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Use a strong password with uppercase, lowercase, numbers,
                    and symbols
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      placeholder="Confirm password"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg mt-6"
                >
                  {loading ? (
                    <>
                      <Spinner size="small" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="w-5 h-5" />
                      Create Super Admin
                    </>
                  )}
                </button>
              </form>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  📝 After Creating Super Admin:
                </p>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Login with your new superadmin account</li>
                  <li>
                    Delete this file:{" "}
                    <code className="bg-slate-200 px-1 rounded">
                      pages/auth/first-superadmin.js
                    </code>
                  </li>
                  <li>Create other users from User Management page</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
