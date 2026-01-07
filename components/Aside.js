// components/Aside.js
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

// Updated icon imports
import {
  MdDashboard,
  MdSchool,
  MdScience,
  MdBusinessCenter,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import { SiBloglovin } from "react-icons/si";

import LoginLayout from "./LoginLayout";

export default function Aside({ asideOpen }) {
  const router = useRouter();
  const [activeLink, setActiveLink] = useState("/");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setActiveLink(router.pathname);
  }, [router.pathname]);

  const handleLinkClick = useCallback(
    async (link) => {
      if (router.pathname === link) return;
      setLoading(true);
      await router.push(link);
      setLoading(false);
    },
    [router]
  );

  if (!session) return null;

  return (
    <LoginLayout>
      <aside
        className={`fixed top-[60px] z-10 h-screen bg-white shadow-md transition-all duration-300 ease-in-out ${
          asideOpen ? "left-0 w-[200px]" : "-left-[200px]"
        } flex flex-col justify-between`}
      >
        {loading && <div className="p-4 text-center">Loading...</div>}

        <ul className="flex flex-col gap-1 px-4 pt-4 text-sm text-gray-700 font-medium">
          {/* Dashboard */}
          <li
            className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer ${
              activeLink === "/"
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleLinkClick("/")}
            onMouseEnter={() => router.prefetch("/")}
          >
            <MdDashboard className="text-xl" />
            <span>Dashboard</span>
          </li>

          {/* Universities */}
          <li>
            <div
              className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer ${
                activeLink.includes("/universities")
                  ? "bg-indigo-100 text-indigo-700"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleLinkClick("/universities")}
              onMouseEnter={() => router.prefetch("/universities")}
            >
              <MdSchool className="text-xl" />
              <span>Universities</span>
            </div>
            {activeLink.includes("/universities") && (
              <ul className="pl-6 text-[0.875rem] text-gray-600">
                {/* <Link href="/universities">
                  <li className="hover:text-indigo-600 py-1">
                    All Universities
                  </li>
                </Link> */}
                <Link href="/universities/draftuniversities">
                  <li className="hover:text-indigo-600 py-1">
                    Draft Universities
                  </li>
                </Link>
                <Link href="/universities/adduniversity">
                  <li className="hover:text-indigo-600 py-1">Add University</li>
                </Link>
              </ul>
            )}
          </li>

          {/* Specializations */}
          <li>
            <div
              className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer ${
                activeLink.includes("/specializations")
                  ? "bg-indigo-100 text-indigo-700"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleLinkClick("/specializations")}
              onMouseEnter={() => router.prefetch("/specializations")}
            >
              <MdScience className="text-xl" />
              <span>Specializations</span>
            </div>
            {activeLink.includes("/specializations") && (
              <ul className="pl-6 text-[0.875rem] text-gray-600">
                <Link href="/specializations">
                  <li className="hover:text-indigo-600 py-1">
                    All Specializations
                  </li>
                </Link>
                <Link href="/specializations/draftspecializations">
                  <li className="hover:text-indigo-600 py-1">
                    Draft Specializations
                  </li>
                </Link>
                <Link href="/specializations/addspecialization">
                  <li className="hover:text-indigo-600 py-1">
                    Add Specialization
                  </li>
                </Link>
              </ul>
            )}
          </li>

          {/* Colleges */}
          <li>
            <div
              className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer ${
                activeLink.includes("/colleges")
                  ? "bg-indigo-100 text-indigo-700"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleLinkClick("/colleges")}
              onMouseEnter={() => router.prefetch("/colleges")}
            >
              <MdBusinessCenter className="text-xl" />
              <span>Colleges</span>
            </div>
            {/* {activeLink.includes("/colleges") && (
              <ul className="pl-6 text-[0.875rem] text-gray-600">
                <Link href="/colleges">
                  <li className="hover:text-indigo-600 py-1">All Colleges</li>
                </Link>
                <Link href="/colleges/addcollege">
                  <li className="hover:text-indigo-600 py-1">Add College</li>
                </Link>
              </ul>
            )} */}
          </li>

          {/* Degrees */}
          <li>
            <div
              className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer ${
                activeLink.includes("/degrees")
                  ? "bg-indigo-100 text-indigo-700"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleLinkClick("/degrees")}
              onMouseEnter={() => router.prefetch("/degrees")}
            >
              <MdSchool className="text-xl" />
              <span>Degrees</span>
            </div>
            {activeLink.includes("/degrees") && (
              <ul className="pl-6 text-[0.875rem] text-gray-600">
                <Link href="/degrees">
                  <li className="hover:text-indigo-600 py-1">All Degrees</li>
                </Link>
                <Link href="/degrees/adddegree">
                  <li className="hover:text-indigo-600 py-1">Add Degree</li>
                </Link>
              </ul>
            )}
          </li>

          {/* Settings */}
          <li
            className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer ${
              activeLink === "/setting"
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleLinkClick("/setting")}
            onMouseEnter={() => router.prefetch("/setting")}
          >
            <MdSettings className="text-xl" />
            <span>Settings</span>
          </li>
        </ul>

        <div className="px-4 pb-6 mb-14">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition py-2 rounded-md font-semibold"
          >
            <MdLogout className="text-xl" />
            Logout
          </button>
        </div>
      </aside>
    </LoginLayout>
  );
}
