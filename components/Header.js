import { RiBarChartHorizontalLine } from "react-icons/ri";
import { BiExitFullscreen } from "react-icons/bi";
import { GoScreenFull } from "react-icons/go";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Header({ handleAsideOpen }) {
  const [isFullScreen, setIsFullscreen] = useState(false);
  const { data: session } = useSession();

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <header className="w-full flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm fixed z-20">
      {/* Logo & Menu Icon */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-indigo-600">ADMIN</h1>
        {session && (
          <button
            onClick={handleAsideOpen}
            className="p-2 rounded-md hover:bg-gray-100 transition"
            aria-label="Toggle Sidebar"
          >
            <RiBarChartHorizontalLine className="text-xl text-gray-700" />
          </button>
        )}
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleFullScreen}
          className="p-2 rounded-md hover:bg-gray-100 transition"
          aria-label="Toggle Fullscreen"
        >
          {isFullScreen ? (
            <BiExitFullscreen className="text-xl text-gray-700" />
          ) : (
            <GoScreenFull className="text-xl text-gray-700" />
          )}
        </button>

        <div className="relative">
          <img
            src="/img/notification.png"
            alt="Notifications"
            className="w-6 h-6"
          />
        </div>

        <div className="relative">
          {/* import Image from "next/image"; */}
          <Image
            src="/img/egecnobg_32x32.jpg"
            alt="EGEC Logo"
            width={32}
            height={32}
            className="rounded-full object-cover border border-gray-300"
          />
        </div>
      </div>
    </header>
  );
}
