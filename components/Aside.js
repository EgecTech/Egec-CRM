import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { IoSettingsOutline } from "react-icons/io5";
import { FaFlask, FaHome } from "react-icons/fa";
import { FiUsers, FiShield, FiSettings } from "react-icons/fi";

const Aside = React.memo(({ asideOpen }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeLink, setActiveLink] = useState("/");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveLink(router.pathname);
  }, [router.pathname]);

  const handleLinkClick = useCallback(
    async (link) => {
      if (router.pathname === link) return;
      setLoading(true);
      try {
        await router.push(link);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  if (!session) return null;

  const navItems = [
    {
      href: "/crm/dashboard",
      label: "Dashboard",
      icon: FaHome,
      isActive: activeLink === "/" || activeLink.includes("/crm/dashboard"),
      gradient: "from-blue-500 to-indigo-600",
      bgActive: "bg-blue-500/10",
      borderActive: "border-blue-500/30",
    },
    {
      href: "/crm/customers",
      label: "Customers",
      icon: FiUsers,
      isActive: activeLink.includes("/crm/customers"),
      gradient: "from-amber-500 to-orange-600",
      bgActive: "bg-amber-500/10",
      borderActive: "border-amber-500/30",
    },
  ];

  // Add follow-ups for agents and admins
  if (session?.user?.role === "agent" || session?.user?.role === "egecagent" || 
      session?.user?.role === "studyagent" || session?.user?.role === "edugateagent" ||
      session?.user?.role === "admin" || session?.user?.role === "superadmin") {
    navItems.push({
      href: "/crm/followups",
      label: "Follow-ups",
      icon: FaFlask,
      isActive: activeLink.includes("/crm/followups"),
      gradient: "from-emerald-500 to-teal-600",
      bgActive: "bg-emerald-500/10",
      borderActive: "border-emerald-500/30",
    });
  }

  // Add admin navigation items
  if (session?.user?.role === "admin" || session?.user?.role === "superadmin") {
    navItems.push({
      href: "/crm/users",
      label: "User Management",
      icon: FiUsers,
      isActive: activeLink.includes("/crm/users"),
      gradient: "from-violet-500 to-purple-600",
      bgActive: "bg-violet-500/10",
      borderActive: "border-violet-500/30",
    });
    
    navItems.push({
      href: "/crm/reports",
      label: "Reports",
      icon: IoSettingsOutline,
      isActive: activeLink.includes("/crm/reports"),
      gradient: "from-pink-500 to-rose-600",
      bgActive: "bg-pink-500/10",
      borderActive: "border-pink-500/30",
    });
  }
  
  // Add audit logs (Superadmin only)
  if (session?.user?.role === "superadmin") {
    navItems.push(
      {
        href: "/crm/system-control",
        label: "System Control",
        icon: FiSettings,
        isActive: activeLink.includes("/crm/system-control"),
        gradient: "from-purple-500 to-pink-600",
        bgActive: "bg-purple-500/10",
        borderActive: "border-purple-500/30",
      },
      {
        href: "/crm/audit-logs",
        label: "Audit Logs",
        icon: FiShield,
        isActive: activeLink.includes("/crm/audit-logs"),
        gradient: "from-rose-500 to-red-600",
        bgActive: "bg-rose-500/10",
        borderActive: "border-rose-500/30",
      }
    );
  }

  return (
    <aside
      className={`fixed top-[64px] z-40 h-[calc(100vh-64px)] w-[240px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300 ease-in-out flex flex-col border-r border-slate-700/50 ${
        asideOpen ? "left-0" : "-left-[240px]"
      }`}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

      {loading && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Navigation */}
      <div className="relative flex-1 py-3 sm:py-4">
        {/* Section Header */}
        <div className="px-3 sm:px-4 mb-2 sm:mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Navigation
          </p>
        </div>

        <ul className="flex flex-col gap-1.5 sm:gap-2 px-2 sm:px-3">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group flex items-center gap-2 sm:gap-3 py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium border ${
                  item.isActive
                    ? `${item.bgActive} ${item.borderActive} text-white`
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10"
                }`}
                onClick={() => handleLinkClick(item.href)}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    item.isActive
                      ? `bg-gradient-to-br ${item.gradient}`
                      : "bg-slate-700/50 group-hover:bg-slate-700"
                  }`}
                >
                  <item.icon
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      item.isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-xs sm:text-sm">{item.label}</span>
                {item.isActive && (
                  <div className="ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"></div>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Settings */}
      <div className="relative p-2 sm:p-3 border-t border-slate-700/50 bg-slate-900/50">
        <Link
          href="/setting"
          className={`group flex items-center gap-[15px] py-2.5 px-3 rounded-xl transition-all duration-200 font-medium border ${
            activeLink.includes("/setting")
              ? "bg-violet-500/10 border-violet-500/30 text-white"
              : "border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10"
          }`}
          onClick={() => handleLinkClick("/setting")}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              activeLink.includes("/setting")
                ? "bg-gradient-to-br from-violet-500 to-purple-600"
                : "bg-slate-700/50 group-hover:bg-slate-700"
            }`}
          >
            <IoSettingsOutline
              className={`w-4 h-4 ${
                activeLink.includes("/setting")
                  ? "text-white"
                  : "text-slate-400 group-hover:text-white"
              }`}
              aria-hidden="true"
            />
          </div>
          <span className="text-sm">Settings</span>
          {activeLink.includes("/setting") && (
            <div className="ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-purple-500"></div>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
});
Aside.displayName = "Aside";

export default Aside;
