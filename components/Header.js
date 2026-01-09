// components/Header.js
import React, { useState, useCallback, useEffect } from "react";
import { RiMenuLine } from "react-icons/ri";
import { BiFullscreen, BiExitFullscreen, BiBell } from "react-icons/bi";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdVerified } from "react-icons/md";
import { FiLogOut, FiUser, FiShield, FiUserPlus } from "react-icons/fi";
import { getLogoUrl } from "@/lib/logo";

const EduGateHeader = React.memo(({ handleAsideOpen }) => {
  const [isFullScreen, setIsFullscreen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest(".user-dropdown-container")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleProfileClick = useCallback(() => {
    setDropdownOpen(false);
    router.push("/setting");
  }, [router]);

  const handleSecurityClick = useCallback(() => {
    setDropdownOpen(false);
    router.push("/setting?tab=security");
  }, [router]);

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  return (
    <header className="w-full h-16 md:h-[72px] lg:h-20 flex justify-between items-center px-3 sm:px-4 md:px-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white fixed top-0 left-0 right-0 z-50 shadow-2xl border-b border-slate-700/50">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

      {/* Left Section: Logo & Sidebar Toggle */}
      <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4">
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-emerald-500/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-amber-500/50 shadow-lg">
              <Image
                src={getLogoUrl()}
                alt="EduGate Now Logo"
                width={40}
                height={40}
                className="object-cover"
                priority={true}
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center ring-2 ring-slate-900">
              <MdVerified className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </div>
          </div>

          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white">
              EduGate Now
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 -mt-0.5">Information Hub</p>
          </div>
        </div>

        {session && (
          <button
            onClick={handleAsideOpen}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 transition-all duration-200 group"
            aria-label="Toggle Sidebar"
          >
            <RiMenuLine
              className="text-base sm:text-lg text-slate-300 group-hover:text-amber-400 transition-colors"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Right Section */}
      <div className="relative flex items-center gap-1.5 sm:gap-2">
        {session ? (
          <>
            {/* Fullscreen Button - Hidden on small screens */}
            <button
              onClick={toggleFullScreen}
              className="hidden lg:block p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 transition-all group"
              aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullScreen ? (
                <BiExitFullscreen
                  className="text-base sm:text-lg text-slate-300 group-hover:text-amber-400 transition-colors"
                  aria-hidden="true"
                />
              ) : (
                <BiFullscreen
                  className="text-base sm:text-lg text-slate-300 group-hover:text-amber-400 transition-colors"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Notifications */}
            <button
              className="p-2 sm:p-2.5 relative rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 transition-all group"
              aria-label="Notifications"
            >
              <BiBell
                className="text-base sm:text-lg text-slate-300 group-hover:text-amber-400 transition-colors"
                aria-hidden="true"
              />
              <span
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-full ring-1 sm:ring-2 ring-slate-900 animate-pulse"
                aria-hidden="true"
              ></span>
            </button>

            {/* Create User - Only for Super Admin */}
            {session?.user?.role === "superadmin" && (
              <Link
                href="/crm/users"
                className="hidden lg:flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 rounded-lg md:rounded-xl transition-all font-medium text-xs md:text-sm text-amber-300 border border-amber-500/30 hover:border-amber-500/50"
              >
                <FiUserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Create User</span>
              </Link>
            )}

            {/* User Dropdown */}
            <div className="relative user-dropdown-container">
              <button
                className="flex items-center gap-2 sm:gap-2.5 md:gap-3 p-1 sm:p-1.5 pr-2 sm:pr-2.5 md:pr-3 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="relative">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg overflow-hidden ring-1 sm:ring-2 ring-amber-500/50">
                    <Image
                      src={
                        session?.user?.userImage || "/img/default-avatar.jpg"
                      }
                      alt="User Avatar"
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, 36px"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-900"></span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs sm:text-sm font-semibold text-white leading-tight truncate max-w-[80px] sm:max-w-[100px]">
                    {session?.user?.name ||
                      session?.user?.email?.split("@")[0] ||
                      "User"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 leading-tight">
                    {session?.user?.role || "User"}
                  </p>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-52 md:w-56 bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden ring-2 ring-amber-500/30">
                        <Image
                          src={
                            session?.user?.userImage ||
                            "/img/default-avatar.jpg"
                          }
                          alt="User"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 36px, 40px"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px]">
                          {session?.user?.name ||
                            session?.user?.email ||
                            "User"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400">
                          {session?.user?.role || "User"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1 sm:py-2">
                    <button
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                      onClick={handleProfileClick}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                      </div>
                      My Profile
                    </button>
                    <button
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                      onClick={handleSecurityClick}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <FiShield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                      </div>
                      Security
                    </button>
                    {(session?.user?.role === "admin" ||
                      session?.user?.role === "superadmin") && (
                      <>
                        <div className="border-t border-slate-700/50 my-1 sm:my-2"></div>
                        <Link
                          href="/admin/users"
                          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                          </div>
                          User Management
                        </Link>
                        {session?.user?.role === "superadmin" && (
                          <Link
                            href="/admin/superadmin-users"
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                              <FiShield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                            </div>
                            Super Admin Panel
                          </Link>
                        )}
                      </>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-700/50 py-1 sm:py-2">
                    <button
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                      onClick={handleSignOut}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <FiLogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                      </div>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/signin"
              className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
});
EduGateHeader.displayName = "EduGateHeader";

export default EduGateHeader;
