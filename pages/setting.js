import LoginLayout from "@/components/LoginLayout";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FiUser, FiPhone, FiLock, FiShield, FiCamera } from "react-icons/fi";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Settings() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [imagePreview, setImagePreview] = useState(null);

  const [profileForm, setProfileForm] = useState({
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  useEffect(() => {
    if (session?.user) {
      setProfileForm({
        phone: session.user.userPhone || "",
      });
    }
  }, [session]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: profileForm.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Something went wrong");
      }

      await updateSession({
        ...session,
        user: {
          ...session.user,
          userPhone: data.user.userPhone,
        },
      });

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Something went wrong");
      }

      setSuccess("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setImagePreview(reader.result);

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const res = await fetch("/api/user/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: reader.result,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || data.details || "Failed to upload image"
          );
        }

        await updateSession({
          ...session,
          user: {
            ...session.user,
            userImage: data.user.userImage,
          },
        });

        setSuccess("Profile image updated successfully");
        setImagePreview(null);
      } catch (err) {
        setError(err.message);
        setImagePreview(null);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the image file");
    };

    reader.readAsDataURL(file);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <LoginLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <FiUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Account Settings
                </h1>
                <p className="text-sm text-slate-400">
                  Manage your profile and security settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-slate-200">
              <nav className="flex">
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    router.push("/setting?tab=profile", undefined, {
                      shallow: true,
                    });
                  }}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === "profile"
                      ? "bg-slate-50 text-slate-900 border-b-2 border-amber-500"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <FiUser className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setActiveTab("security");
                    router.push("/setting?tab=security", undefined, {
                      shallow: true,
                    });
                  }}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === "security"
                      ? "bg-slate-50 text-slate-900 border-b-2 border-amber-500"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <FiShield className="w-4 h-4" />
                  Security
                </button>
              </nav>
            </div>

            <div className="p-6 md:p-8 bg-white">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                  {success}
                </div>
              )}

              {activeTab === "profile" ? (
                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Profile Information
                    </h3>
                    <p className="text-sm text-slate-600">
                      Update your profile information and email address.
                    </p>
                  </div>

                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-slate-200 bg-slate-100">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Profile Preview"
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="140px"
                            unoptimized={true}
                          />
                        ) : session?.user?.userImage ? (
                          <Image
                            src={session.user.userImage}
                            alt="Profile"
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="140px"
                            unoptimized={true}
                          />
                        ) : (
                          <Image
                            src="/img/default-avatar.jpg"
                            alt="Default Profile"
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="140px"
                            unoptimized={true}
                          />
                        )}
                      </div>
                      <label
                        htmlFor="image-upload"
                        className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 p-3 rounded-full cursor-pointer hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
                      >
                        <FiCamera className="w-5 h-5" />
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={loading}
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      Click the camera icon to change your profile picture
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={session?.user?.name || ""}
                        disabled
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={session?.user?.email || ""}
                        disabled
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        <FiPhone className="inline w-4 h-4 mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl font-bold hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Update Password
                    </h3>
                    <p className="text-sm text-slate-600">
                      Ensure your account is using a long, random password to
                      stay secure.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        <FiLock className="inline w-4 h-4 mr-1" />
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="current-password"
                        id="current-password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        <FiLock className="inline w-4 h-4 mr-1" />
                        New Password
                      </label>
                      <input
                        type="password"
                        name="new-password"
                        id="new-password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        <FiLock className="inline w-4 h-4 mr-1" />
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirm-password"
                        id="confirm-password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl font-bold hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </LoginLayout>
  );
}
